package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"
)

// ── Config ────────────────────────────────────────────────────────────────────

const sanityProject = "t9t7is4j"

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// ── Image Generation ──────────────────────────────────────────────────────────

func generateImage(geminiKey, prompt string, seed int) ([]byte, string, error) {
	if geminiKey != "" {
		imgURL := "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + geminiKey
		body := map[string]any{
			"instances":  []any{map[string]any{"prompt": prompt}},
			"parameters": map[string]any{"sampleCount": 1, "aspectRatio": "16:9"},
		}
		raw, _ := json.Marshal(body)
		resp, err := http.Post(imgURL, "application/json", bytes.NewReader(raw))
		if err == nil && resp.StatusCode == 200 {
			defer resp.Body.Close()
			var r struct {
				Predictions []struct {
					BytesBase64Encoded string `json:"bytesBase64Encoded"`
				} `json:"predictions"`
			}
			if data, _ := io.ReadAll(resp.Body); json.Unmarshal(data, &r) == nil && len(r.Predictions) > 0 {
				imgBytes, _ := base64.StdEncoding.DecodeString(r.Predictions[0].BytesBase64Encoded)
				if len(imgBytes) > 0 {
					return imgBytes, "image/png", nil
				}
			}
		} else if resp != nil {
			if resp.Body != nil {
				resp.Body.Close()
			}
			fmt.Printf("     Imagen failed (%d), using Pollinations fallback...\n", resp.StatusCode)
		}
	}

	h := sha256.Sum256([]byte(fmt.Sprintf("%d-%s", seed, prompt)))
	n := new(big.Int).SetBytes(h[:])
	pollSeed := new(big.Int).Mod(n, big.NewInt(999983)).Int64()

	p := url.QueryEscape(prompt)
	if len(p) > 400 {
		p = p[:400]
	}
	pollURL := fmt.Sprintf("https://image.pollinations.ai/prompt/%s?nologo=true&width=1408&height=800&model=flux-realism&seed=%d&enhance=true", p, pollSeed)

	req, _ := http.NewRequest("GET", pollURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	client := &http.Client{Timeout: 90 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	imgBytes, err := io.ReadAll(resp.Body)
	return imgBytes, "image/jpeg", err
}

// ── Sanity ────────────────────────────────────────────────────────────────────

func uploadImageToSanity(sanityToken string, imgBytes []byte, mime, title, suffix string) (string, error) {
	re := regexp.MustCompile(`[^\w\s]`)
	name := re.ReplaceAllString(title, "")
	re2 := regexp.MustCompile(`\s+`)
	name = re2.ReplaceAllString(strings.TrimSpace(name), "_")
	if len(name) > 100 {
		name = name[:100]
	}
	ext := "jpg"
	if mime == "image/png" {
		ext = "png"
	}
	filename := fmt.Sprintf("%s_%s.%s", name, suffix, ext)

	uploadURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/assets/images/production?filename=%s",
		sanityProject, url.QueryEscape(filename))

	req, _ := http.NewRequest("POST", uploadURL, bytes.NewReader(imgBytes))
	req.Header.Set("Content-Type", mime)
	req.Header.Set("Authorization", "Bearer "+sanityToken)

	client := &http.Client{Timeout: 90 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var r struct {
		Document struct {
			ID string `json:"_id"`
		} `json:"document"`
	}
	if err := json.Unmarshal(data, &r); err != nil {
		return "", fmt.Errorf("upload parse error: %s", string(data[:min(200, len(data))]))
	}
	return r.Document.ID, nil
}

func sanityMutateImage(token, id, imageID string) error {
	payload, _ := json.Marshal(map[string]any{
		"mutations": []any{
			map[string]any{
				"patch": map[string]any{
					"id": id,
					"set": map[string]any{
						"mainImage": map[string]any{
							"_type": "image",
							"asset": map[string]any{
								"_type": "reference",
								"_ref":  imageID,
							},
						},
					},
				},
			},
		},
	})
	mutURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	req, _ := http.NewRequest("POST", mutURL, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("sanity mutate error %d: %s", resp.StatusCode, string(data[:min(200, len(data))]))
	}
	return nil
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintln(os.Stderr, "Usage: go run remake_image.go <postID> <postTitle>")
		os.Exit(1)
	}
	postID := os.Args[1]
	postTitle := os.Args[2]

	sanityToken := env("SANITY_API_TOKEN", "")
	geminiKey := env("GEMINI_API_KEY", "")

	if sanityToken == "" || geminiKey == "" {
		fmt.Fprintln(os.Stderr, "❌  SANITY_API_TOKEN and GEMINI_API_KEY must be set")
		os.Exit(1)
	}

	prompt := "A high-end, futuristic 3D product render of " + postTitle + ". Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks."

	fmt.Printf("\n  🖼  Generating New Cover Image for '%s'...\n", postTitle)
	
	seed := int(time.Now().UnixNano() % 1000000)
	imgBytes, mime, err := generateImage(geminiKey, prompt, seed)
	if err != nil {
		fmt.Printf("  ❌ Image generation failed: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("  ⬆️  Uploading to Sanity...\n")
	img1ID, err := uploadImageToSanity(sanityToken, imgBytes, mime, postTitle, "Cover")
	if err != nil {
		fmt.Printf("  ❌ Image upload failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("  🔄 Patching Post Document (ID: %s)...\n", postID)
	if err := sanityMutateImage(sanityToken, postID, img1ID); err != nil {
		fmt.Printf("  ❌ Patch failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("  ✅ DONE! Picture for '%s' updated successfully.\n\n", postTitle)
}
