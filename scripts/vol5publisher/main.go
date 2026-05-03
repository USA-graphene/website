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
	pdfPath       = "/Users/raimis/ownCloud/Desktop/Graphene & books/Graphene Science Handbook - Size-Dependent Properties - Volume 5 (2016) (Pdf) Gooner/Graphene Science Handbook - Size-Dependent Properties - Vol.5 (2016).pdf"
	sanityProject = "t9t7is4j"
	authorID      = "0fbb5f25-9a9b-40ee-a727-0a900e3152f1"

	catScience     = "7QyVE6fI6HWfwHJOF8VGju"
	catElectronics = "category-electronics-photonics"
	catEnergy      = "category-energy-storage"
	catComposites  = "3c7c1ec6-d835-49e0-b0f2-1c2873c6d86c"
	catSensors     = "91bad9b1-6801-4835-a938-09cc56cb8f8e"
	catWater       = "category-water-environment"
	catCoatings    = "category-coatings-materials"
	catChem        = "7QyVE6fI6HWfwHJOF8VGju"
)

type Chapter struct {
	Title    string
	Category string
}

var chapters = []Chapter{
	{"Graphene as a Spin-Polarized Tunnel Barrier", catElectronics},
	{"Elastic Properties of Kevlar Reinforced by Graphene: Modeling and Simulation", catComposites},
	{"Size Control Methods and Size-Dependent Properties of Graphene", catScience},
	{"Adsorption and Catalysis of Graphene in Environmental Remediation", catWater},
	{"Graphene Oxide-Derived Porous Materials for Hydrogen and Methane Storage", catEnergy},
	{"Indirect Coupling between Magnetic Moments in Graphene Nanostructures", catScience},
	{"Excitonic Effects in Armchair Graphene Nanoribbons: A Many-Body Overview", catScience},
	{"Electronic Properties of Graphene Grown on Metal Substrates via Synchrotron Spectroscopy", catScience},
	{"Graphene Field-Effect Transistor Chemical and Biological Sensors", catSensors},
	{"Diffusion in Graphene: An In-Depth Overview", catScience},
	{"Interface Traps in Graphene Field-Effect Devices: Extraction and Influence", catElectronics},
	{"Magnetic Properties of Nanographene Bilayer", catScience},
	{"Quantum Capacitance of Graphene Sheets and Nanoribbons", catElectronics},
	{"Functionalization and Properties of Graphene", catScience},
	{"Properties of Two-Dimensional Silicon versus Carbon Systems", catScience},
	{"Raman and FTIR Spectroscopy for Characterization of Graphene Materials", catScience},
	{"Mechanical Behavior of Single-Layer Graphene with Grain Boundary Loops", catComposites},
	{"Characterization of Pristine and Functionalized Graphene on Metal Surfaces", catScience},
	{"Nanographene Patterns from Focused Ion Beam Deposition: XPS and Raman", catScience},
	{"Thermophysical Properties of Composite Films Based on Carbon Nanotubes and Graphene", catComposites},
	{"Graphene Gas Sensor: Single-Molecule Detection", catSensors},
	{"Graphene-Based Semiconductor Materials for Photocatalytic Applications", catScience},
	{"Electronic Modification of Graphene by Silicon and Hydrogen", catElectronics},
	{"Graphene in Semiconductor Devices as Transparent Contact and Thermal Management Layers", catElectronics},
	{"Graphene and Graphene Oxide in Dye-Sensitized Solar Cells", catEnergy},
	{"Graphene and Its Applications in Healthcare Systems", catSensors},
	{"Advances in Graphene RF Transistors and Applications", catElectronics},
	{"Graphene Transistors: Silicon CMOS-Compatible Processing for Nanoelectronics", catElectronics},
	{"Graphene Nanocomposites for Lithium Battery Application", catEnergy},
	{"Improving Corrosion Resistance via Graphene Nanocomposite Coatings", catCoatings},
	{"Graphene-Based Electrochemical Capacitors", catEnergy},
}

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

func chapterText(pages []string, chIdx int) string {
	title := strings.ToLower(chapters[chIdx].Title)
	words := strings.Fields(title)
	if len(words) > 4 {
		words = words[:4]
	}
	needle := strings.Join(words, " ")

	startPage := -1
	for i, pg := range pages {
		if strings.Contains(strings.ToLower(pg), needle) {
			startPage = i
			break
		}
	}
	if startPage < 0 {
		startPage = (len(pages) / len(chapters)) * chIdx
	}

	var sb strings.Builder
	end := startPage + 20
	if end > len(pages) {
		end = len(pages)
	}
	for _, pg := range pages[startPage:end] {
		sb.WriteString(pg)
		sb.WriteString("\n\n")
		if sb.Len() >= 9000 {
			break
		}
	}
	out := sb.String()
	if len(out) > 9000 {
		out = out[:9000]
	}
	return out
}

// ── Gemini Post Generation ────────────────────────────────────────────────────

type Post struct {
	Title          string `json:"title"`
	Slug           string `json:"slug"`
	Excerpt        string `json:"excerpt"`
	Body           string `json:"body"`
	SeoTitle       string `json:"seoTitle"`
	PrimaryKeyword string `json:"primaryKeyword"`
	Prompt1        string `json:"imagePrompt1"`
}

func geminiWritePost(geminiKey, chTitle, chText string) (Post, error) {
	prompt := fmt.Sprintf(`You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word SEO blog post based on this academic chapter:

Chapter Title: %s

Chapter Excerpt:
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
		"generationConfig": map[string]any{"temperature": 0.85, "maxOutputTokens": 8192, "response_mime_type": "application/json"},
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

	cleanBody := func(s string) string {
		s = strings.ReplaceAll(s, "**", "")
		s = strings.ReplaceAll(s, "__", "")
		re := regexp.MustCompile(`(?m)^\*([^*]+)\*$`)
		s = re.ReplaceAllString(s, "$1")
		re2 := regexp.MustCompile(`\n{3,}`)
		s = re2.ReplaceAllString(s, "\n\n")
		return strings.TrimSpace(s)
	}

	var p Post
	if err := json.Unmarshal([]byte(text), &p); err != nil {
		// Fallback to minimal extraction if JSON is slightly malformed
		fmt.Printf("  ⚠️  JSON unmarshal failed, using fallback: %v\n", err)
		p.Title = chTitle
		p.Slug = slugify(chTitle)
	}

	p.Body = cleanBody(p.Body)
	if p.Title == "" {
		p.Title = chTitle
	}
	if p.Slug == "" {
		p.Slug = slugify(chTitle)
	}
	if p.Prompt1 == "" {
		p.Prompt1 = "A high-end, futuristic 3D product render of " + chTitle + ". Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks."
	}
	return p, nil
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
			resp.Body.Close()
			fmt.Printf("     Imagen failed (%d), using Pollinations fallback...\n", resp.StatusCode)
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
	Asset    *ref   `json:"asset,omitempty"`
}
type ref struct {
	Type string `json:"_type"`
	Ref  string `json:"_ref"`
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

func publishToSanity(sanityToken string, p Post, img1ID, categoryID string, nextNum int) error {
	finalTitle := fmt.Sprintf("%d. %s", nextNum, p.Title)
	doc := map[string]any{
		"_type":       "post",
		"title":       finalTitle,
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
	if geminiKey == "" {
		geminiKey = env("GOOGLE_AI_API_KEY", "")
	}

	if sanityToken == "" || geminiKey == "" {
		fmt.Fprintln(os.Stderr, "❌  SANITY_API_TOKEN and GEMINI_API_KEY must be set")
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

	fmt.Printf("\n📖  Vol.5: Size-Dependent Properties (2016) — %d chapters\n", endCh-startCh)
	fmt.Printf("📄  Loading PDF (this may take a minute)...\n")

	pages, err := extractAllPages(pdfPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌  PDF load failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("    %d pages loaded.\n", len(pages))

	nextNum, err := fetchNextPostNumber(sanityToken)
	if err != nil {
		fmt.Printf("⚠️  Could not fetch next post number, defaulting to 1: %v\n", err)
		nextNum = 1
	}

	// 2. Fetch all current post titles for duplicate checking
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

	for i := startCh; i < endCh; i++ {
		ch := chapters[i]
		num := i + 1

		// Check if this chapter (or something very similar) already exists
		isDuplicate := false
		chLower := strings.ToLower(ch.Title)
		for _, et := range existingTitles {
			if strings.Contains(et, chLower) || strings.Contains(chLower, strings.ReplaceAll(et, "unlocking performance: ", "")) {
				isDuplicate = true
				break
			}
		}
		if isDuplicate {
			fmt.Printf("\n⏭️  Skipping Chapter %02d: %s (Already published)\n", num, ch.Title)
			continue
		}

		fmt.Printf("\n%s\n", strings.Repeat("=", 68))
		fmt.Printf("📝 Chapter %02d/%02d: %s (Post #%d)\n", num, len(chapters), ch.Title, nextNum)
		fmt.Printf("%s\n", strings.Repeat("=", 68))

		chText := chapterText(pages, i)
		fmt.Printf("  📄 Extracted %d chars\n", len(chText))

		fmt.Printf("  🤖 Writing SEO post (Gemini 3.1 Pro)...\n")
		post, err := geminiWritePost(geminiKey, ch.Title, chText)
		if err != nil {
			fmt.Printf("  ❌ Chapter %d failed (Gemini): %v\n", num, err)
			continue
		}
		fmt.Printf("     Title : %s\n", post.Title)
		fmt.Printf("     Words : %d\n", len(strings.Fields(post.Body)))

		fmt.Printf("  🖼  Generating Cover Image...\n")
		imgBytes, mime, err := generateImage(geminiKey, post.Prompt1, num*100+1)
		if err != nil {
			fmt.Printf("  ❌ Image generation failed: %v\n", err)
			continue
		}
		img1ID, err := uploadImageToSanity(sanityToken, imgBytes, mime, post.Title, "Cover")
		if err != nil {
			fmt.Printf("  ❌ Image upload failed: %v\n", err)
			continue
		}

		fmt.Printf("  🚀 Publishing to Sanity...\n")
		if err := publishToSanity(sanityToken, post, img1ID, ch.Category, nextNum); err != nil {
			fmt.Printf("  ❌ Chapter %d publish failed: %v\n", num, err)
			continue
		}

		liveURL := fmt.Sprintf("usa-graphene.com/blog/%s", post.Slug)
		fmt.Printf("  ✅ Live → %s\n", liveURL)
		
		nextNum++
		if i < endCh-1 {
			time.Sleep(8 * time.Second)
		}
	}

	fmt.Printf("\n%s\n", strings.Repeat("=", 68))
	fmt.Printf("✅ DONE\n\n")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
