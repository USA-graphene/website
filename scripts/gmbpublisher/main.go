package main

// Graphene-Based Materials: Science and Technology
// Publisher Go script – mirrors vol5publisher architecture exactly.
// Usage:
//   SANITY_API_TOKEN=... GEMINI_API_KEY=... go run main.go
//   SANITY_API_TOKEN=... GEMINI_API_KEY=... go run main.go 5 10   # chapters 5–10 only

import (
	"bytes"
	"crypto/md5"
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
	pdfPath      = "/Users/raimis/ownCloud/Desktop/Graphene & books/Graphene-Based Materials - Science and Technology - Subbiah Alwarappan, Ashok Kumar (CRC, 2014).pdf"
	sanityProject = "t9t7is4j"
	authorID      = "0fbb5f25-9a9b-40ee-a727-0a900e3152f1"
	bookTitle     = "Graphene-Based Materials: Science and Technology (Alwarappan & Kumar, CRC 2014)"
)

// Category IDs
const (
	catScience     = "7QyVE6fI6HWfwHJOF8VGju"
	catElectronics = "category-electronics-photonics"
	catEnergy      = "category-energy-storage"
	catComposites  = "3c7c1ec6-d835-49e0-b0f2-1c2873c6d86c"
	catIndustry    = "7BrkOiqqnrTDYuPuTq0PcD"
	catChem        = "7QyVE6fI6HWfwHJOF8VGju"
	catSensors     = "91bad9b1-6801-4835-a938-09cc56cb8f8e"
	catWater       = "category-water-environment"
	catCoatings    = "category-coatings-materials"
)

// CHAPTERS: exact titles from the book's PDF outline (6 chapters)
var chapters = []struct {
	title      string
	categoryID string
}{
	{"Graphene: An Introduction", catScience},
	{"Graphene Synthesis", catChem},
	{"Surface Characterization of Graphene", catScience},
	{"Graphene-Based Materials in Gas Sensors", catSensors},
	{"Graphene-Based Materials in Biosensing and Energy Storage Applications", catEnergy},
	{"Graphene-Based Materials for Photonic and Optoelectronic Applications", catElectronics},
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Block struct {
	Type     string  `json:"_type"`
	Key      string  `json:"_key"`
	Style    string  `json:"style,omitempty"`
	Children []Span  `json:"children,omitempty"`
	Asset    *AssetR `json:"asset,omitempty"`
}

type Span struct {
	Type  string   `json:"_type"`
	Key   string   `json:"_key"`
	Text  string   `json:"text"`
	Marks []string `json:"marks"`
}

type AssetR struct {
	Type string `json:"_type"`
	Ref  string `json:"_ref"`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func shortHash(s string) string {
	h := md5.Sum([]byte(s))
	return fmt.Sprintf("%x", h)[:8]
}

func slugify(title string) string {
	re := regexp.MustCompile(`[^\w\s-]`)
	s := strings.ToLower(title)
	s = re.ReplaceAllString(s, "")
	s = regexp.MustCompile(`[\s_-]+`).ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if len(s) > 80 {
		s = s[:80]
	}
	return s
}

func cleanBody(text string) string {
	text = strings.ReplaceAll(text, "**", "")
	text = strings.ReplaceAll(text, "__", "")
	re := regexp.MustCompile(`\n{3,}`)
	text = re.ReplaceAllString(text, "\n\n")
	return strings.TrimSpace(text)
}

func uniqueSeed(n int) int64 {
	h := md5.Sum([]byte(strconv.Itoa(n)))
	val := new(big.Int).SetBytes(h[:])
	mod := new(big.Int).SetInt64(999983)
	return new(big.Int).Mod(val, mod).Int64()
}

func sanityQuery(token, query string) ([]byte, error) {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/query/production?query=%s",
		sanityProject, url.QueryEscape(query))
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := (&http.Client{Timeout: 60 * time.Second}).Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// ── Sanity post-count helper ─────────────────────────────────────────────────

// fetchNextPostNumber queries Sanity for the current maximum numbered post
// (titles starting with "N.") and returns N+1.
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
		Result []struct{ Title string `json:"title"` } `json:"result"`
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

// ── PDF extraction ────────────────────────────────────────────────────────────

func extractChapterText(f *os.File, chapterIdx int, totalChapters int) string {
	size, _ := f.Seek(0, io.SeekEnd)
	f.Seek(0, io.SeekStart)

	reader, err := pdf.NewReader(f, size)
	if err != nil {
		fmt.Printf("  ⚠️  PDF reader error: %v\n", err)
		return ""
	}

	numPages := reader.NumPage()
	// Divide pages roughly evenly across chapters
	pagesPerChapter := numPages / totalChapters
	if pagesPerChapter < 1 {
		pagesPerChapter = 1
	}

	startPage := chapterIdx*pagesPerChapter + 1
	endPage := startPage + pagesPerChapter
	if endPage > numPages {
		endPage = numPages
	}
	// Cap at 20 pages to stay within Gemini context
	if endPage-startPage > 20 {
		endPage = startPage + 20
	}

	var parts []string
	for p := startPage; p <= endPage; p++ {
		page := reader.Page(p)
		if page.V.IsNull() {
			continue
		}
		text, err := page.GetPlainText(nil)
		if err == nil && text != "" {
			parts = append(parts, text)
		}
	}
	text := strings.Join(parts, "\n\n")
	if len(text) > 9000 {
		text = text[:9000]
	}
	return text
}

// ── Gemini ────────────────────────────────────────────────────────────────────

type GeminiRequest struct {
	Contents         []GContent    `json:"contents"`
	GenerationConfig *GGenConfig   `json:"generationConfig,omitempty"`
}
type GContent struct{ Parts []GPart `json:"parts"` }
type GPart struct{ Text string `json:"text"` }
type GGenConfig struct {
	Temperature     float64 `json:"temperature"`
	MaxOutputTokens int     `json:"maxOutputTokens"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func geminiWritePost(chapterTitle, chapterText, geminiKey string) (map[string]string, error) {
	prompt := fmt.Sprintf(`You are a senior science journalist writing for usa-graphene.com — a specialist graphene industry publication.

Write a complete, SEO-optimized blog post based on this chapter from the book "%s":

Chapter Title: %s

Chapter Content (excerpt):
%s

WRITING RULES — follow every one:
1. Length: 1800–2200 words total.
2. Structure: Introduction (2–3 paragraphs) → 5–7 sections each with an ## H2 heading → FAQ (5 Q&A) → Conclusion.
3. Every paragraph: 4–7 sentences. No bullet lists inside the body.
4. Tone: direct, confident, expert. Write like a scientist explaining to a smart colleague.
5. Vary sentence length. Mix short punchy sentences with longer analytical ones.
6. NO AI clichés: "In conclusion", "Furthermore", "Moreover", "Delve into", "Revolutionize", "Game-changer", "Cutting-edge".
7. NO markdown bold or italic — do NOT use ** or * around any words. Plain text only.
8. NO em-dashes (—) used as sentence separators.
9. Weave the primary keyword into the introduction, one H2 heading, and the conclusion.
10. Include real numbers, temperatures, percentages, and application data where available.
11. Each FAQ answer: 3–4 sentences, technically precise.
12. Conclusion: 2 paragraphs ending with a call-to-action to usa-graphene.com.

Return a JSON object with EXACTLY these fields (raw JSON, no markdown code fences):
{
  "title": "SEO title max 55 chars — must include primary keyword",
  "slug": "url-slug max 70 chars, lowercase, hyphens only",
  "excerpt": "2-sentence meta description 150–160 chars",
  "body": "full article, ## prefixed H2 headings, double newlines between paragraphs, plain text",
  "seoTitle": "title tag max 60 chars",
  "seoDescription": "meta description 150–160 chars"
}

Return ONLY the JSON.`, bookTitle, chapterTitle, chapterText)

	reqBody := GeminiRequest{
		Contents:         []GContent{{Parts: []GPart{{Text: prompt}}}},
		GenerationConfig: &GGenConfig{Temperature: 0.8, MaxOutputTokens: 8192},
	}
	data, _ := json.Marshal(reqBody)

	apiURL := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s",
		geminiKey,
	)
	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("gemini request failed: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var gr GeminiResponse
	if err := json.Unmarshal(body, &gr); err != nil {
		return nil, fmt.Errorf("gemini unmarshal: %w", err)
	}
	if len(gr.Candidates) == 0 || len(gr.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("gemini returned empty response (safety filter?)")
	}

	text := strings.TrimSpace(gr.Candidates[0].Content.Parts[0].Text)
	// Strip code fences if present
	if strings.HasPrefix(text, "```") {
		text = regexp.MustCompile("(?s)^```\\w*\n?").ReplaceAllString(text, "")
		text = regexp.MustCompile("(?s)\n?```$").ReplaceAllString(text, "")
		text = strings.TrimSpace(text)
	}

	var result map[string]string
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		// Regex fallback for each field
		extract := func(name string) string {
			re := regexp.MustCompile(`(?s)"` + name + `"\s*:\s*"((?:[^"\\]|\\.)*)"`)
			m := re.FindStringSubmatch(text)
			if m == nil {
				return ""
			}
			return strings.ReplaceAll(strings.ReplaceAll(m[1], `\n`, "\n"), `\"`, `"`)
		}
		result = map[string]string{
			"title":          extract("title"),
			"slug":           extract("slug"),
			"excerpt":        extract("excerpt"),
			"body":           extract("body"),
			"seoTitle":       extract("seoTitle"),
			"seoDescription": extract("seoDescription"),
			"imagePrompt":    extract("imagePrompt"),
		}
	}
	if result["title"] == "" {
		result["title"] = chapterTitle
	}
	if result["slug"] == "" {
		result["slug"] = slugify(chapterTitle)
	}
	return result, nil
}

// ── Image generation ──────────────────────────────────────────────────────────

func generateImage(prompt, geminiKey string, seed int64) ([]byte, string, error) {
	// Try Imagen 4 first
	if geminiKey != "" {
		type ImgRequest struct {
			Instances  []map[string]string `json:"instances"`
			Parameters map[string]any      `json:"parameters"`
		}
		reqBody := ImgRequest{
			Instances:  []map[string]string{{"prompt": prompt}},
			Parameters: map[string]any{"sampleCount": 1, "aspectRatio": "16:9"},
		}
		data, _ := json.Marshal(reqBody)
		apiURL := fmt.Sprintf(
			"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=%s",
			geminiKey,
		)
		resp, err := http.Post(apiURL, "application/json", bytes.NewReader(data))
		if err == nil && resp.StatusCode == 200 {
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			var result struct {
				Predictions []struct {
					BytesBase64Encoded string `json:"bytesBase64Encoded"`
				} `json:"predictions"`
			}
			if json.Unmarshal(body, &result) == nil && len(result.Predictions) > 0 {
				imgBytes, err := base64.StdEncoding.DecodeString(result.Predictions[0].BytesBase64Encoded)
				if err == nil {
					fmt.Println("     ✅ Imagen 4")
					return imgBytes, "image/png", nil
				}
			}
		}
		fmt.Println("     ⚠️  Imagen 4 failed, using Pollinations...")
	}

	// Pollinations fallback
	encodedPrompt := url.QueryEscape(prompt)
	if len(encodedPrompt) > 400 {
		encodedPrompt = url.QueryEscape(prompt[:300])
	}
	imgURL := fmt.Sprintf(
		"https://image.pollinations.ai/prompt/%s?nologo=true&width=1408&height=800&model=flux-realism&seed=%d&enhance=true",
		encodedPrompt, seed,
	)
	client := &http.Client{Timeout: 90 * time.Second}
	req, _ := http.NewRequest("GET", imgURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("pollinations failed: %w", err)
	}
	defer resp.Body.Close()
	imgBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}
	fmt.Println("     ✅ Pollinations")
	return imgBytes, "image/jpeg", nil
}

// ── Sanity ────────────────────────────────────────────────────────────────────

func uploadImageToSanity(imgBytes []byte, mime, title, sanityToken string) (string, error) {
	ext := "jpg"
	if mime == "image/png" {
		ext = "png"
	}
	re := regexp.MustCompile(`[^\w\s]`)
	name := re.ReplaceAllString(title, "")
	name = regexp.MustCompile(`\s+`).ReplaceAllString(strings.TrimSpace(name), "_")
	if len(name) > 100 {
		name = name[:100]
	}
	filename := name + "." + ext

	uploadURL := fmt.Sprintf(
		"https://%s.api.sanity.io/v2023-05-03/assets/images/production?filename=%s",
		sanityProject, url.QueryEscape(filename),
	)
	req, _ := http.NewRequest("POST", uploadURL, bytes.NewReader(imgBytes))
	req.Header.Set("Content-Type", mime)
	req.Header.Set("Authorization", "Bearer "+sanityToken)

	client := &http.Client{Timeout: 90 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Document struct {
			ID string `json:"_id"`
		} `json:"document"`
	}
	if err := json.Unmarshal(body, &result); err != nil || result.Document.ID == "" {
		return "", fmt.Errorf("image upload failed: %s", string(body)[:min(200, len(body))])
	}
	fmt.Printf("     Asset: %s\n", result.Document.ID)
	return result.Document.ID, nil
}

func bodyToBlocks(bodyText string) []Block {
	var blocks []Block
	for i, para := range strings.Split(bodyText, "\n\n") {
		para = strings.TrimSpace(para)
		if para == "" {
			continue
		}
		bkey := shortHash(fmt.Sprintf("b%d-%s", i, para[:min(24, len(para))]))
		skey := shortHash(fmt.Sprintf("s%d-%s", i, para[:min(24, len(para))]))

		style := "normal"
		text := para
		if strings.HasPrefix(para, "## ") {
			style = "h2"
			text = para[3:]
		} else if strings.HasPrefix(para, "### ") {
			style = "h3"
			text = para[4:]
		}
		blocks = append(blocks, Block{
			Type:     "block",
			Key:      bkey,
			Style:    style,
			Children: []Span{{Type: "span", Key: skey, Text: text, Marks: []string{}}},
		})
	}
	return blocks
}

func publishToSanity(post map[string]string, imageID, categoryID, sanityToken string) error {
	doc := map[string]any{
		"_type":       "post",
		"title":       post["title"],
		"slug":        map[string]string{"_type": "slug", "current": post["slug"]},
		"excerpt":     post["excerpt"],
		"body":        bodyToBlocks(cleanBody(post["body"])),
		"seoTitle":    post["seoTitle"],
		"publishedAt": func() string {
			loc, _ := time.LoadLocation("America/New_York")
			return time.Now().In(loc).Format(time.RFC3339)
		}(),
		"author":      map[string]string{"_type": "reference", "_ref": authorID},
		"mainImage": map[string]any{
			"_type": "image",
			"asset": map[string]string{"_type": "reference", "_ref": imageID},
		},
		"categories": []map[string]string{
			{"_type": "reference", "_ref": categoryID, "_key": "cat1"},
		},
	}

	payload, _ := json.Marshal(map[string]any{"mutations": []map[string]any{{"create": doc}}})
	mutURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	req, _ := http.NewRequest("POST", mutURL, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+sanityToken)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("sanity error %d: %s", resp.StatusCode, string(body)[:min(200, len(body))])
	}
	return nil
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	sanityToken := os.Getenv("SANITY_API_TOKEN")
	geminiKey := os.Getenv("GEMINI_API_KEY")
	if geminiKey == "" {
		geminiKey = os.Getenv("GOOGLE_AI_API_KEY")
	}
	if sanityToken == "" {
		fmt.Fprintln(os.Stderr, "❌ SANITY_API_TOKEN required")
		os.Exit(1)
	}
	if geminiKey == "" {
		fmt.Fprintln(os.Stderr, "❌ GEMINI_API_KEY required")
		os.Exit(1)
	}

	startCh, endCh := 0, len(chapters)
	if len(os.Args) >= 2 {
		n, _ := strconv.Atoi(os.Args[1])
		startCh = n - 1
	}
	if len(os.Args) >= 3 {
		n, _ := strconv.Atoi(os.Args[2])
		endCh = n
	}

	fmt.Printf("\n📖  %s\n", bookTitle)
	fmt.Printf("📄  Loading PDF (this may take a minute)...\n")

	f, err := os.Open(pdfPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌  PDF load failed: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()
	fmt.Printf("✅  PDF opened\n\n")

	// Fetch current max post number ONCE before the loop
	fmt.Println("🔢 Fetching current post count from Sanity...")
	nextNum, err := fetchNextPostNumber(sanityToken)
	if err != nil {
		fmt.Printf("⚠️  Could not fetch post count (%v), starting from 1\n", err)
		nextNum = 1
	}
	fmt.Printf("   Next post number: %d\n\n", nextNum)

	// Fetch all current post titles for duplicate checking
	fmt.Println("📊 Checking for existing posts in Sanity...")
	allPostsRaw, err := sanityQuery(sanityToken, `*[_type=="post"]{title}`)
	var existingTitles []string
	if err == nil {
		var res struct {
			Result []struct{ Title string `json:"title"` } `json:"result" `
		}
		if json.Unmarshal(allPostsRaw, &res) == nil {
			for _, p := range res.Result {
				existingTitles = append(existingTitles, strings.ToLower(p.Title))
			}
		}
	}

	var published, failed int
	for i, ch := range chapters[startCh:endCh] {
		chNum := startCh + i + 1
		postNum := nextNum + published // use published to increment sequence correctly

		// Check if this chapter already exists
		isDuplicate := false
		chLower := strings.ToLower(ch.title)
		for _, et := range existingTitles {
			if strings.Contains(et, chLower) || strings.Contains(chLower, strings.ReplaceAll(et, "unlocking performance: ", "")) {
				isDuplicate = true
				break
			}
		}
		if isDuplicate {
			fmt.Printf("\n⏭️  Skipping Chapter %02d: %s (Already published)\n", chNum, ch.title)
			continue
		}
		fmt.Printf("\n%s\n", strings.Repeat("═", 68))
		fmt.Printf("📝 Chapter %02d/%d [post #%d]: %s\n", chNum, len(chapters), postNum, ch.title)
		fmt.Printf("%s\n", strings.Repeat("═", 68))

		// 1. Extract text
		fmt.Print("  📄 Extracting chapter text...")
		chText := extractChapterText(f, startCh+i, len(chapters))
		fmt.Printf(" %d chars\n", len(chText))

		// 2. Write post with Gemini
		fmt.Println("  🤖 Writing SEO post (Gemini 2.5 Flash)...")
		post, err := geminiWritePost(ch.title, chText, geminiKey)
		if err != nil {
			fmt.Printf("  ❌ Gemini failed: %v\n", err)
			failed++
			time.Sleep(5 * time.Second)
			continue
		}
		post["body"] = cleanBody(post["body"])
		wordCount := len(strings.Fields(post["body"]))

		// Prefix title with sequential number (matches cron convention)
		numberedTitle := fmt.Sprintf("%d. %s", postNum, post["title"])
		post["title"] = numberedTitle
		post["slug"]  = slugify(numberedTitle)

		fmt.Printf("     Title : %s\n", post["title"])
		fmt.Printf("     Words : %d\n", wordCount)
		fmt.Printf("     Slug  : %s\n", post["slug"])

		// 3. Generate image — hardcoded prompt style (same as cron job)
		fmt.Println("  🖼  Generating cover image...")
		imgPrompt := fmt.Sprintf(
			"A high-end, futuristic 3D product render of %s. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks.",
			ch.title,
		)
		seed := uniqueSeed(postNum * 100)
		imgBytes, mime, err := generateImage(imgPrompt, geminiKey, seed)
		if err != nil {
			fmt.Printf("  ❌ Image generation failed: %v\n", err)
			failed++
			time.Sleep(5 * time.Second)
			continue
		}
		fmt.Printf("     Size  : %d KB\n", len(imgBytes)/1024)

		// 4. Upload image
		fmt.Println("  ☁️  Uploading image to Sanity...")
		imageID, err := uploadImageToSanity(imgBytes, mime, post["title"], sanityToken)
		if err != nil {
			fmt.Printf("  ❌ Image upload failed: %v\n", err)
			failed++
			time.Sleep(5 * time.Second)
			continue
		}

		// 5. Publish post
		fmt.Println("  🚀 Publishing to Sanity...")
		if err := publishToSanity(post, imageID, ch.categoryID, sanityToken); err != nil {
			fmt.Printf("  ❌ Publish failed: %v\n", err)
			failed++
			time.Sleep(5 * time.Second)
			continue
		}
		fmt.Printf("  ✅ Live → usa-graphene.com/blog/%s\n", post["slug"])
		published++

		if chNum < endCh {
			time.Sleep(10 * time.Second)
		}
	}

	fmt.Printf("\n%s\n", strings.Repeat("═", 68))
	fmt.Printf("✅ DONE — %d published, %d failed\n\n", published, failed)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
