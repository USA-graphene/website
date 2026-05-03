package main

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
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
	pdfPath       = "/Users/raimis/ownCloud/Desktop/Graphene & books/Graphene Science Handbook - Mechanical and Chemical Properties - Volume 4 (2016) (Pdf) Gooner/Graphene Science Handbook - Mechanical and Chemical Properties - Vol.4 (2016).pdf"
	sanityProject = "t9t7is4j"
	authorID      = "0fbb5f25-9a9b-40ee-a727-0a900e3152f1"

	catScience     = "7QyVE6fI6HWfwHJOF8VGju"
	catComposites  = "3c7c1ec6-d835-49e0-b0f2-1c2873c6d86c"
	catSensors     = "91bad9b1-6801-4835-a938-09cc56cb8f8e"
	catElectronics = "category-electronics-photonics"
	catEnergy      = "category-energy-storage"
	catChem        = "7QyVE6fI6HWfwHJOF8VGju"
)

type Chapter struct {
	Title    string
	Category string
}

var chapters = []Chapter{
	{"Mechanical Properties of Graphene: Strength, Stiffness, and Elasticity", catComposites},
	{"Fuzzy Fiber-Reinforced Composites with Wavy Carbon Nanotubes: Effective Elastic Properties", catComposites},
	{"Effects of Vacancies, Nitrogen Atoms, and sp3 Bonds on Graphene Mechanical Properties", catChem},
	{"Mechanical Properties of Graphene Sheets: Experimental and Computational Insights", catComposites},
	{"Mechanical Stabilities of Graphene and BN-Modified Graphene from First-Principles", catChem},
	{"Mechanical Properties of Graphene in Polymer Nanocomposites", catComposites},
	{"Grain Boundaries in CVD-Grown Graphene: Formation, Properties, and Impact", catChem},
	{"Graphene-Based Biological and Chemical Sensors: Principles and Applications", catSensors},
	{"Printed Graphene-Based Electrochemical Sensors: Fabrication and Performance", catSensors},
	{"Graphene Quantum Dots: Chemical Routes and Photoluminescence Applications", catElectronics},
	{"Electrochemical Biosensors and Biofuel Cells Based on Graphene Derivatives", catEnergy},
	{"Chemical Modification of Graphene: Strategies and Functional Outcomes", catChem},
	{"Graphene Synthesis by Chemical Vapor De-position on Copper: Process and Quality", catChem},
	{"Chemically Modified Graphene for Electrochemical Sensing Applications", catSensors},
	{"Graphene Electrochemical Exfoliation: Methods and Applications", catChem},
	{"Modification of Graphene with Polymers via Addition Chemistry", catComposites},
	{"Molecular Theory of Graphene Chemical Modification: Mechanisms and Predictions", catChem},
	{"Low-Cost Simple Methods for Graphene Synthesis: Scalable Approaches", catChem},
	{"Graphene-Based Solar Cells: Efficiency, Architecture, and Future Prospects", catEnergy},
	{"Graphene Production from Chlorination of Metallocenes: A Novel Route", catChem},
	{"Chemical Modification of Graphene with Polymers: Performance and Structure", catComposites},
	{"Charge Carrier Mobility in Graphene: Strain and Screening Effects", catElectronics},
	{"Graphene-Based Antibacterial Materials: Mechanisms and Biomedical Applications", catSensors},
	{"Nanofluidics in Graphene-Based Material Systems: Ion Transport and Membranes", catChem},
	{"Nanoporous Graphene Sheets for Gas Separation: Design and Selectivity", catChem},
	{"Photorefractive Properties of Graphene-Based Organic Systems", catElectronics},
	{"Graphene and Its Derivatives in Electrochemical Sensors: A Comprehensive Comparison", catSensors},
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

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func extractAllPages(path string) ([]string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var pages []string
	for i := 1; i <= r.NumPage(); i++ {
		p := r.Page(i)
		if p.V.IsNull() {
			continue
		}
		s, _ := p.GetPlainText(nil)
		pages = append(pages, s)
	}
	return pages, nil
}

func chapterText(pages []string, chIdx int) string {
	// Simple heuristic: 15 pages per chapter
	start := chIdx * 15
	if start >= len(pages) {
		return ""
	}
	end := start + 25
	if end > len(pages) {
		end = len(pages)
	}
	return strings.Join(pages[start:end], "\n\n")
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
5. NO AI clichés.
6. NO markdown bold or italic. Plain text only.

Return ONLY a JSON object:
{
  "title": "SEO title",
  "slug": "url-slug",
  "excerpt": "meta description",
  "body": "Full article text",
  "seoTitle": "title tag",
  "primaryKeyword": "keyword",
  "imagePrompt1": "High-end 3D render render of %s..."
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
			FinishReason string `json:"finishReason"`
			Content      struct {
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
	fmt.Printf("   DEBUG: Total text length: %d chars\n", len(text))
	var p Post
	if err := json.Unmarshal([]byte(text), &p); err != nil {
		fmt.Printf("   ❌ JSON Error: %v\n", err)
		fmt.Printf("   RAW TEXT: %s\n", text)
	}
	fmt.Printf("   DEBUG: JSON keys found: %s\n", text[:min(200, len(text))])

	cleanBody := func(s string) string {
		s = strings.ReplaceAll(s, "**", "")
		s = strings.ReplaceAll(s, "__", "")
		re2 := regexp.MustCompile(`\n{3,}`)
		s = re2.ReplaceAllString(s, "\n\n")
		return strings.TrimSpace(s)
	}
	p.Body = cleanBody(p.Body)
	if p.Title == "" { p.Title = chTitle }
	if p.Slug == "" { p.Slug = slugify(chTitle) }
	if p.Prompt1 == "" { p.Prompt1 = "A high-end, futuristic 3D product render of " + chTitle }

	return p, nil
}

// ── Sanity Integration ────────────────────────────────────────────────────────

func uploadImageToSanity(token string, imgData []byte, mime, title, label string) (string, error) {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/assets/images/production?filename=%s&label=%s", 
		sanityProject, url.QueryEscape(title+".png"), url.QueryEscape(label))
	req, _ := http.NewRequest("POST", apiURL, bytes.NewReader(imgData))
	req.Header.Set("Content-Type", mime)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := (&http.Client{Timeout: 60 * time.Second}).Do(req)
	if err != nil { return "", err }
	defer resp.Body.Close()
	var res struct { Document struct { ID string `json:"_id"` } `json:"document"` }
	data, _ := io.ReadAll(resp.Body)
	json.Unmarshal(data, &res)
	return res.Document.ID, nil
}

type block struct {
	Type     string `json:"_type"`
	Key      string `json:"_key"`
	Style    string `json:"style"`
	Children []any  `json:"children"`
}

func bodyToBlocks(body string) []block {
	var blocks []block
	for i, para := range strings.Split(body, "\n\n") {
		para = strings.TrimSpace(para)
		if para == "" { continue }
		bkey, skey := shortHash(fmt.Sprintf("b%d", i)), shortHash(fmt.Sprintf("s%d", i))
		style, text := "normal", para
		if strings.HasPrefix(para, "## ") { style, text = "h2", para[3:] }
		blocks = append(blocks, block{
			Type: "block", Key: bkey, Style: style,
			Children: []any{map[string]any{"_type": "span", "_key": skey, "text": text}},
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
	if err != nil { return nil, err }
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func fetchNextPostNumber(token string) (int, error) {
	data, err := sanityQuery(token, `*[_type=="post"]|order(publishedAt asc){title}`)
	if err != nil { return 1, err }
	var res struct { Result []struct { Title string `json:"title"` } `json:"result"` }
	json.Unmarshal(data, &res)
	re := regexp.MustCompile(`^(\d+)\.`)
	maxN := 0
	for _, p := range res.Result {
		if m := re.FindStringSubmatch(p.Title); m != nil {
			if n, _ := strconv.Atoi(m[1]); n > maxN { maxN = n }
		}
	}
	return maxN + 1, nil
}

func publishToSanity(token string, p Post, imgID, catID string, nextNum int) error {
	doc := map[string]any{
		"_type": "post", "title": fmt.Sprintf("%d. %s", nextNum, p.Title),
		"slug": map[string]any{"_type": "slug", "current": p.Slug},
		"excerpt": p.Excerpt, "body": bodyToBlocks(p.Body), "seoTitle": p.SeoTitle,
		"publishedAt": time.Now().UTC().Format(time.RFC3339),
		"author": map[string]any{"_type": "reference", "_ref": authorID},
		"mainImage": map[string]any{"_type": "image", "asset": map[string]any{"_type": "reference", "_ref": imgID}},
		"categories": []any{map[string]any{"_type": "reference", "_ref": catID, "_key": "cat1"}},
	}
	payload, _ := json.Marshal(map[string]any{"mutations": []any{map[string]any{"create": doc}}})
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	req, _ := http.NewRequest("POST", apiURL, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil { return err }
	defer resp.Body.Close()
	return nil
}

func main() {
	sanityToken := env("SANITY_API_TOKEN", "")
	geminiKey := env("GEMINI_API_KEY", "")
	if geminiKey == "" { geminiKey = env("GOOGLE_AI_API_KEY", "") }
	if sanityToken == "" || geminiKey == "" { os.Exit(1) }

	pages, _ := extractAllPages(pdfPath)
	startCh, endCh := 0, len(chapters)
	if len(os.Args) >= 2 {
		n, _ := strconv.Atoi(os.Args[1])
		startCh = n - 1
	}
	if len(os.Args) >= 3 {
		n, _ := strconv.Atoi(os.Args[2])
		endCh = n
	}

	for i := startCh; i < endCh; i++ {
		ch := chapters[i]
		num := i + 1
		fmt.Printf("📝 Chapter %02d: %s\n", num, ch.Title)
		chText := chapterText(pages, i)
		post, _ := geminiWritePost(geminiKey, ch.Title, chText)
		fmt.Printf("   Words: %d\n", len(strings.Fields(post.Body)))
		// ... image and publish ...
		// (skipping actual publish in this debug manual run)
	}
}
