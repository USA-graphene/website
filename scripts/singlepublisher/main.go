package main

import (
	"bytes"
	"crypto/md5"
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
	"strconv"
	"strings"
	"time"

	"github.com/ledongthuc/pdf"
)

// ── Config ────────────────────────────────────────────────────────────────────

const (
	pdfPath       = "/Users/raimis/Downloads/Graphene environmental footprint greatly reduced when derived from biomass waste via flash Joule heating _ DocHub.pdf"
	sanityProject = "t9t7is4j"
	authorID      = "0fbb5f25-9a9b-40ee-a727-0a900e3152f1"
	catScience    = "7QyVE6fI6HWfwHJOF8VGju"
	postTitle     = "Graphene-Rubber Nanocomposites: The Future of High-Performance Tires"
)

// ── Helpers ───────────────────────────────────────────────────────────────────

func slugify(s string) string {
	s = strings.ToLower(s)
	re := regexp.MustCompile(`[^\w\s-]`)
	s = re.ReplaceAllString(s, "")
	re2 := regexp.MustCompile(`[\s_-]+`)
	s = re2.ReplaceAllString(s, "-")
	if len(s) > 80 {
		s = s[:80]
	}
	return strings.Trim(s, "-")
}

func shortHash(s string) string {
	h := md5.Sum([]byte(s))
	return fmt.Sprintf("%x", h)[:8]
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// ── Sanity post-count helper ─────────────────────────────────────────────────

// fetchNextPostNumber queries Sanity for the current max numbered post.
func fetchNextPostNumber(sanityToken string) (int, error) {
	apiURL := fmt.Sprintf(
		"https://%s.api.sanity.io/v2023-05-03/data/query/production?query=%s",
		sanityProject,
		url.QueryEscape(`*[_type=="post"]|order(publishedAt asc){title}`),
	)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Authorization", "Bearer "+sanityToken)
	resp, err := (&http.Client{Timeout: 60 * time.Second}).Do(req)
	if err != nil {
		return 1, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var res struct {
		Result []struct {
			Title string `json:"title"`
		} `json:"result"`
	}
	if err := json.Unmarshal(body, &res); err != nil {
		return 1, err
	}
	reNum := regexp.MustCompile(`^(\d+)\.`)
	maxN := 0
	for _, p := range res.Result {
		if m := reNum.FindStringSubmatch(p.Title); m != nil {
			if n, _ := strconv.Atoi(m[1]); n > maxN {
				maxN = n
			}
		}
	}
	return maxN + 1, nil
}

// ── PDF Extraction ────────────────────────────────────────────────────────────

func extractAllPages(path string) ([]string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	n := r.NumPage()
	pages := make([]string, n)
	for i := 1; i <= n; i++ {
		p := r.Page(i)
		if p.V.IsNull() {
			continue
		}
		text, _ := p.GetPlainText(nil)
		pages[i-1] = text
	}
	return pages, nil
}

func extractText(pages []string) string {
	var sb strings.Builder
	for _, pg := range pages {
		sb.WriteString(pg)
		sb.WriteString("\n\n")
		if sb.Len() >= 12000 { // Grab a good chunk of text for Gemini
			break
		}
	}
	out := sb.String()
	if len(out) > 12000 {
		out = out[:12000]
	}
	return out
}

// ── Gemini Post Generation ────────────────────────────────────────────────────

type Post struct {
	Title          string
	Slug           string
	Excerpt        string
	Body           string
	SeoTitle       string
	PrimaryKeyword string
	Prompt1        string
}

func geminiWritePost(geminiKey, chTitle, chText string) (Post, error) {
	prompt := fmt.Sprintf(`You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word SEO blog post based on this academic paper text:

Paper Title: %s

Paper Excerpt:
%s

WRITING RULES:
1. Length: 1800-2200 words.
2. Structure: Introduction → 5-7 sections with ## H2 headings → FAQ (5 Q&A) → Conclusion.
3. Every paragraph: 4-7 sentences. No bullet lists inside the body.
4. Tone: direct, confident, expert.
5. NO AI clichés: 'In conclusion', 'Furthermore', 'Moreover', 'Delve into', 'Revolutionize', 'Game-changer'.
6. NO markdown bold or italic. Plain text only. Do not use ** or *.

Return ONLY a JSON object:
{
  "title": "SEO title max 60 chars",
  "slug": "url-slug",
  "excerpt": "150-char meta description",
  "body": "Full article text. No bolding.",
  "seoTitle": "title tag",
  "primaryKeyword": "main keyword",
  "imagePrompt1": "A high-end, futuristic 3D product render of %s. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks."
}`, chTitle, chText, chTitle)

	body := map[string]any{
		"contents":         []any{map[string]any{"parts": []any{map[string]any{"text": prompt}}}},
		"generationConfig": map[string]any{"temperature": 0.85, "maxOutputTokens": 16384},
	}
	raw, _ := json.Marshal(body)
	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + geminiKey

	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(raw))
	if err != nil {
		return Post{}, err
	}
	defer resp.Body.Close()
	respBytes, _ := io.ReadAll(resp.Body)

	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(respBytes, &result); err != nil || len(result.Candidates) == 0 {
		return Post{}, fmt.Errorf("gemini parse error: %s", string(respBytes[:min(200, len(respBytes))]))
	}

	text := result.Candidates[0].Content.Parts[0].Text
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)

	var p struct {
		Title          string `json:"title"`
		Slug           string `json:"slug"`
		Excerpt        string `json:"excerpt"`
		Body           string `json:"body"`
		SeoTitle       string `json:"seoTitle"`
		PrimaryKeyword string `json:"primaryKeyword"`
		Prompt1        string `json:"imagePrompt1"`
	}

	if err := json.Unmarshal([]byte(text), &p); err != nil {
		return Post{}, fmt.Errorf("json unmarshal failed: %v | text: %s", err, text[:min(100, len(text))])
	}

	cleanBody := func(s string) string {
		s = strings.ReplaceAll(s, "**", "")
		s = strings.ReplaceAll(s, "__", "")
		re := regexp.MustCompile(`(?m)^\*([^*]+)\*$`)
		s = re.ReplaceAllString(s, "$1")
		re2 := regexp.MustCompile(`\n{3,}`)
		s = re2.ReplaceAllString(s, "\n\n")
		return strings.TrimSpace(s)
	}

	res := Post{
		Title:          p.Title,
		Slug:           p.Slug,
		Excerpt:        p.Excerpt,
		Body:           cleanBody(p.Body),
		SeoTitle:       p.SeoTitle,
		PrimaryKeyword: p.PrimaryKeyword,
		Prompt1:        p.Prompt1,
	}

	if res.Title == "" {
		res.Title = chTitle
	}
	if res.Slug == "" {
		res.Slug = slugify(chTitle)
	}
	if res.Prompt1 == "" {
		res.Prompt1 = "A high-end, futuristic 3D product render of " + chTitle + ". Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks."
	}
	return res, nil
}

// ── Image Generation ──────────────────────────────────────────────────────────

func generateImage(geminiKey, prompt string, seed int) ([]byte, string, error) {
	if geminiKey != "" {
		imgURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=" + geminiKey
		body := map[string]any{
			"contents": []any{map[string]any{"parts": []any{map[string]any{"text": prompt}}}},
			"generationConfig": map[string]any{
				"response_modalities": []string{"IMAGE"},
			},
		}
		raw, _ := json.Marshal(body)
		resp, err := http.Post(imgURL, "application/json", bytes.NewReader(raw))
		if err == nil && resp.StatusCode == 200 {
			defer resp.Body.Close()
			var r struct {
				Candidates []struct {
					Content struct {
						Parts []struct {
							InlineData struct {
								Data string `json:"data"`
							} `json:"inlineData"`
						} `json:"parts"`
					} `json:"content"`
				} `json:"candidates"`
			}
			if data, _ := io.ReadAll(resp.Body); json.Unmarshal(data, &r) == nil && len(r.Candidates) > 0 {
				for _, p := range r.Candidates[0].Content.Parts {
					if p.InlineData.Data != "" {
						imgBytes, _ := base64.StdEncoding.DecodeString(p.InlineData.Data)
						if len(imgBytes) > 0 {
							return imgBytes, "image/png", nil
						}
					}
				}
			}
		} else if resp != nil {
			resp.Body.Close()
			fmt.Printf("     Gemini 3 Pro Image failed (%d), using Pollinations fallback...\n", resp.StatusCode)
		}
	}

	h := sha256.Sum256([]byte(fmt.Sprintf("%d-%s", seed, prompt[:min(40, len(prompt))])))
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

type block struct {
	Type     string `json:"_type"`
	Key      string `json:"_key"`
	Style    string `json:"style,omitempty"`
	Children []any  `json:"children,omitempty"`
}

func bodyToBlocks(body string) []block {
	var blocks []block
	for i, para := range strings.Split(body, "\n\n") {
		para = strings.TrimSpace(para)
		if para == "" {
			continue
		}
		bkey := shortHash(fmt.Sprintf("b%d-%s", i, para[:min(24, len(para))]))
		skey := shortHash(fmt.Sprintf("s%d-%s", i, para[:min(24, len(para))]))

		style := "normal"
		text := para
		if strings.HasPrefix(para, "## ") {
			style, text = "h2", para[3:]
		} else if strings.HasPrefix(para, "### ") {
			style, text = "h3", para[4:]
		}
		blocks = append(blocks, block{
			Type:  "block",
			Key:   bkey,
			Style: style,
			Children: []any{map[string]any{
				"_type": "span", "_key": skey, "text": text, "marks": []any{},
			}},
		})
	}
	return blocks
}

func publishToSanity(sanityToken string, p Post, img1ID, categoryID string) error {
	doc := map[string]any{
		"_type":       "post",
		"title":       p.Title,
		"slug":        map[string]any{"_type": "slug", "current": p.Slug},
		"excerpt":     p.Excerpt,
		"body":        bodyToBlocks(p.Body),
		"seoTitle":    p.SeoTitle,
		"publishedAt": time.Now().UTC().Format(time.RFC3339),
		"author":      map[string]any{"_type": "reference", "_ref": authorID},
		"mainImage":   map[string]any{"_type": "image", "asset": map[string]any{"_type": "reference", "_ref": img1ID}},
		"categories":  []any{map[string]any{"_type": "reference", "_ref": categoryID, "_key": "cat1"}},
	}

	payload, _ := json.Marshal(map[string]any{"mutations": []any{map[string]any{"create": doc}}})
	mutateURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)

	req, _ := http.NewRequest("POST", mutateURL, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+sanityToken)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("sanity error %d: %s", resp.StatusCode, string(data[:min(200, len(data))]))
	}
	return nil
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	sanityToken := env("SANITY_API_TOKEN", "")
	geminiKey := env("GEMINI_API_KEY", "")

	if sanityToken == "" || geminiKey == "" {
		fmt.Fprintln(os.Stderr, "❌  SANITY_API_TOKEN and GEMINI_API_KEY must be set")
		os.Exit(1)
	}

	fmt.Printf("\n📖  Reading extracted text file...\n")
	textBytes, err := os.ReadFile("/Users/raimis/aa/scripts/singlepublisher/extracted.txt")
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌  Text load failed: %v\n", err)
		os.Exit(1)
	}
	chText := string(textBytes)
	if len(chText) > 10000 {
		chText = chText[:10000]
	}
	fmt.Printf("  📄 Using %d chars of text for generation\n", len(chText))

	// Fetch current max post number
	fmt.Println("🔢 Fetching current post count from Sanity...")
	nextNum, fetchErr := fetchNextPostNumber(sanityToken)
	if fetchErr != nil {
		fmt.Printf("⚠️  Could not fetch post count (%v), starting from 1\n", fetchErr)
		nextNum = 1
	}
	fmt.Printf("   Next post number: %d\n\n", nextNum)

	fmt.Printf("  🤖 Writing SEO post (Gemini 3.1 Pro)...\n")
	post, err := geminiWritePost(geminiKey, postTitle, chText)
	if err != nil {
		fmt.Printf("  ❌ Post generation failed: %v\n", err)
		os.Exit(1)
	}

	// Prefix title with sequential post number
	numberedTitle := fmt.Sprintf("%d. %s", nextNum, post.Title)
	post.Title = numberedTitle
	post.Slug = slugify(numberedTitle)

	fmt.Printf("     Title : %s\n", post.Title)
	fmt.Printf("     Words : %d\n", len(strings.Fields(post.Body)))

	fmt.Printf("  🖼  Generating Cover Image with Universal Prompt...\n")
	fmt.Printf("     Prompt: %s\n", post.Prompt1)
	imgBytes, mime, err := generateImage(geminiKey, post.Prompt1, 42)
	if err != nil {
		fmt.Printf("  ❌ Image generation failed: %v\n", err)
		os.Exit(1)
	}
	img1ID, err := uploadImageToSanity(sanityToken, imgBytes, mime, post.Title, "Cover")
	if err != nil {
		fmt.Printf("  ❌ Image upload failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("  🚀 Publishing to Sanity...\n")
	if err := publishToSanity(sanityToken, post, img1ID, catScience); err != nil {
		fmt.Printf("  ❌ Publish failed: %v\n", err)
		os.Exit(1)
	}

	liveURL := fmt.Sprintf("usa-graphene.com/blog/%s", post.Slug)
	fmt.Printf("  ✅ DONE! Live → %s\n", liveURL)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
