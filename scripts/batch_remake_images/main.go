package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const (
	sanityProject = "t9t7is4j"
)

type Post struct {
	ID    string `json:"_id"`
	Title string `json:"title"`
}

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

// ── Image Generation (Nano Banana Pro) ────────────────────────────────────────

func generateImageNanoBanana(geminiKey, prompt string) ([]byte, string, error) {
	apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=%s", geminiKey)
	
	payload := map[string]any{
		"contents": []any{
			map[string]any{
				"parts": []any{
					map[string]any{
						"text": prompt,
					},
				},
			},
		},
	}
	
	raw, _ := json.Marshal(payload)
	
	for attempt := 0; attempt < 3; attempt++ {
		resp, err := http.Post(apiURL, "application/json", bytes.NewReader(raw))
		if err != nil {
			fmt.Printf("     Request failed: %v. Retrying...\n", err)
			time.Sleep(5 * time.Second)
			continue
		}
		
		data, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		
		if resp.StatusCode != 200 {
			fmt.Printf("     Nano Banana Pro failed (Status: %d, Body: %s)\n", resp.StatusCode, string(data[:min(200, len(data))]))
			time.Sleep(10 * time.Second)
			continue
		}
		
		var r struct {
			Candidates []struct {
				Content struct {
					Parts []struct {
						InlineData struct {
							MimeType string `json:"mimeType"`
							Data     string `json:"data"`
						} `json:"inlineData"`
					} `json:"parts"`
				} `json:"content"`
			} `json:"candidates"`
		}
		
		if err := json.Unmarshal(data, &r); err != nil || len(r.Candidates) == 0 || len(r.Candidates[0].Content.Parts) == 0 {
			fmt.Printf("     Parse error or no candidates.\n")
			time.Sleep(5 * time.Second)
			continue
		}
		
		for _, part := range r.Candidates[0].Content.Parts {
			if part.InlineData.Data != "" {
				imgBytes, _ := base64.StdEncoding.DecodeString(part.InlineData.Data)
				return imgBytes, part.InlineData.MimeType, nil
			}
		}
		
		fmt.Printf("     No image data found in parts. Retrying...\n")
		time.Sleep(5 * time.Second)
	}
	
	return nil, "", fmt.Errorf("failed to generate image with Nano Banana Pro after retries")
}

// ── Sanity API ──────────────────────────────────────────────────────────────

func uploadImageToSanity(token string, imgBytes []byte, contentType string) (string, error) {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/assets/images/production", sanityProject)
	req, _ := http.NewRequest("POST", apiURL, bytes.NewReader(imgBytes))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", contentType)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var r struct {
		Document struct {
			ID string `json:"_id"`
		} `json:"document"`
		ID string `json:"_id"`
	}
	data, _ := io.ReadAll(resp.Body)
	if err := json.Unmarshal(data, &r); err != nil {
		return "", fmt.Errorf("failed to parse asset response: %v, Body: %s", err, string(data))
	}

	assetID := r.ID
	if assetID == "" {
		assetID = r.Document.ID
	}
	if assetID == "" {
		return "", fmt.Errorf("no asset ID found in response: %s", string(data))
	}

	return assetID, nil
}

func patchPostImage(token, postID, assetID string) error {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	mutation := map[string]any{
		"mutations": []any{
			map[string]any{
				"patch": map[string]any{
					"id": postID,
					"set": map[string]any{
						"mainImage": map[string]any{
							"_type": "image",
							"asset": map[string]any{
								"_type": "reference",
								"_ref":  assetID,
							},
						},
					},
				},
			},
		},
	}
	raw, _ := json.Marshal(mutation)
	req, _ := http.NewRequest("POST", apiURL, bytes.NewReader(raw))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mutation failed (status %d): %s", resp.StatusCode, string(data))
	}
	return nil
}

func sanityQuery(token, query string) ([]byte, error) {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/query/production?query=%s",
		sanityProject, url.QueryEscape(query))
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	sanityToken := env("SANITY_API_TOKEN", "")
	geminiKey := env("GEMINI_API_KEY", "")

	if sanityToken == "" || geminiKey == "" {
		fmt.Fprintln(os.Stderr, "❌ SANITY_API_TOKEN and GEMINI_API_KEY must be set")
		os.Exit(1)
	}

	targetNumbers := []int{237, 236, 288, 192, 191}
	targetMap := make(map[int]bool)
	for _, n := range targetNumbers {
		targetMap[n] = true
	}

	fmt.Println("🔍 Fetching posts from Sanity...")
	query := `*[_type == "post"]{ _id, title }`
	data, err := sanityQuery(sanityToken, query)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Query failed: %v\n", err)
		os.Exit(1)
	}

	var res struct {
		Result []Post `json:"result"`
	}
	json.Unmarshal(data, &res)

	reNum := regexp.MustCompile(`^(\d+)\.`)
	var toProcess []Post
	for _, p := range res.Result {
		match := reNum.FindStringSubmatch(p.Title)
		if match != nil {
			num, _ := strconv.Atoi(match[1])
			if targetMap[num] {
				toProcess = append(toProcess, p)
			}
		}
	}

	fmt.Printf("🎯 Starting live push for %d posts...\n\n", len(toProcess))

	previewDir := "scripts/batch_remake_images/preview"

	for i, p := range toProcess {
		match := reNum.FindStringSubmatch(p.Title)
		numStr := match[1]
		
		fmt.Printf("[%d/%d] Processing: %s\n", i+1, len(toProcess), p.Title)

		filename := filepath.Join(previewDir, fmt.Sprintf("%s.png", numStr))
		var imgBytes []byte
		var contentType string = "image/png"

		// Use local file if exists, otherwise generate
		if _, err := os.Stat(filename); err == nil {
			fmt.Printf("  📂 Using local preview: %s\n", filename)
			imgBytes, _ = os.ReadFile(filename)
		} else {
			fmt.Printf("  ✨ Generating fresh (no local found)...\n")
			cleanTitle := reNum.ReplaceAllString(p.Title, "")
			cleanTitle = strings.TrimSpace(cleanTitle)
			prompt := fmt.Sprintf("A hyper-realistic, professional 3D scientific visualization of %s. Featuring elegant molecular structures and futuristic industrial applications of graphene. Cinematic lighting with deep shadows and glowing highlights, metallic and carbon textures, 8k resolution, masterfully composed, clean and premium aesthetic. Absolutely no text, no labels, no watermarks.", cleanTitle)

			imgBytes, contentType, err = generateImageNanoBanana(geminiKey, prompt)
			if err != nil {
				fmt.Printf("  ❌ Generation failed: %v\n", err)
				continue
			}
		}

		// Upload to Sanity
		fmt.Printf("  ☁️ Uploading to Sanity...\n")
		assetID, err := uploadImageToSanity(sanityToken, imgBytes, contentType)
		if err != nil {
			fmt.Printf("  ❌ Upload failed: %v\n", err)
			continue
		}

		// Patch Document
		fmt.Printf("  📝 Patching document %s...\n", p.ID)
		err = patchPostImage(sanityToken, p.ID, assetID)
		if err != nil {
			fmt.Printf("  ❌ Patch failed: %v\n", err)
			continue
		}

		fmt.Printf("  ✅ Successfully updated!\n\n")
		time.Sleep(1 * time.Second) 
	}

	fmt.Println("🎉 All targeted posts remade successfully on the live site!")
}
