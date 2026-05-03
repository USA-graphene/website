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
	"strings"
	"time"
)

const sanityProject = "t9t7is4j"

// ── Types ─────────────────────────────────────────────────────────────────────

type Post struct {
	ID    string `json:"_id"`
	Title string `json:"title"`
	Slug  struct {
		Current string `json:"current"`
	} `json:"slug"`
	Excerpt string `json:"excerpt"`
	Body    []Body `json:"body"`
}

type Body struct {
	Type     string   `json:"_type"`
	Key      string   `json:"_key"`
	Style    string   `json:"style,omitempty"`
	Children []Child  `json:"children,omitempty"`
	Asset    *AssetRef `json:"asset,omitempty"`
}

type Child struct {
	Type  string   `json:"_type"`
	Key   string   `json:"_key"`
	Text  string   `json:"text"`
	Marks []string `json:"marks"`
}

type AssetRef struct {
	Type string `json:"_type"`
	Ref  string `json:"_ref"`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func shortHash(s string) string {
	h := md5.Sum([]byte(s))
	return fmt.Sprintf("%x", h)[:8]
}

func wordCount(bodies []Body) int {
	count := 0
	for _, b := range bodies {
		if b.Type == "block" {
			for _, c := range b.Children {
				count += len(strings.Fields(c.Text))
			}
		}
	}
	return count
}

func bodyText(bodies []Body) string {
	var parts []string
	for _, b := range bodies {
		if b.Type == "block" {
			for _, c := range b.Children {
				if c.Text != "" {
					parts = append(parts, c.Text)
				}
			}
		}
	}
	return strings.Join(parts, " ")
}

func hasMarkdownArtifacts(bodies []Body) bool {
	for _, b := range bodies {
		for _, c := range b.Children {
			if strings.Contains(c.Text, "**") || strings.Contains(c.Text, "##") {
				return true
			}
		}
	}
	return false
}

func hasPlaceholders(bodies []Body) bool {
	for _, b := range bodies {
		for _, c := range b.Children {
			if strings.Contains(c.Text, "[IMAGE_2]") || strings.Contains(c.Text, "[IMAGE_3]") {
				return true
			}
		}
	}
	return false
}

func isAbrupt(bodies []Body) bool {
	// Find last text block
	for i := len(bodies) - 1; i >= 0; i-- {
		if bodies[i].Type == "block" && len(bodies[i].Children) > 0 {
			lastText := bodies[i].Children[len(bodies[i].Children)-1].Text
			if len(strings.Fields(lastText)) < 10 {
				return true
			}
			return false
		}
	}
	return false
}

// ── Sanity API ────────────────────────────────────────────────────────────────

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

func sanityMutate(token string, mutations []map[string]any) error {
	payload, _ := json.Marshal(map[string]any{"mutations": mutations})
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
		return fmt.Errorf("sanity %d: %s", resp.StatusCode, string(data[:min(300, len(data))]))
	}
	return nil
}

// ── Fix Functions ─────────────────────────────────────────────────────────────

// cleanMarkdownFromBody strips ** and ## from body text spans
func cleanMarkdownFromBody(bodies []Body) []Body {
	reBold := regexp.MustCompile(`\*\*([^*]*)\*\*`)
	reItalic := regexp.MustCompile(`\*([^*]+)\*`)
	reH := regexp.MustCompile(`^#{1,6}\s+`)

	for i := range bodies {
		if bodies[i].Type != "block" {
			continue
		}
		for j := range bodies[i].Children {
			t := bodies[i].Children[j].Text
			t = reBold.ReplaceAllString(t, "$1")
			t = reItalic.ReplaceAllString(t, "$1")
			t = reH.ReplaceAllString(t, "")
			t = strings.ReplaceAll(t, "**", "")
			t = strings.ReplaceAll(t, "__", "")
			bodies[i].Children[j].Text = t
		}
	}
	return bodies
}

// removePlaceholders removes [IMAGE_2], [IMAGE_3] text from body
func removePlaceholders(bodies []Body) []Body {
	var out []Body
	for _, b := range bodies {
		if b.Type == "block" && len(b.Children) == 1 {
			text := strings.TrimSpace(b.Children[0].Text)
			if text == "[IMAGE_2]" || text == "[IMAGE_3]" {
				continue
			}
		}
		// Also clean placeholders inline
		if b.Type == "block" {
			for j := range b.Children {
				b.Children[j].Text = strings.ReplaceAll(b.Children[j].Text, "[IMAGE_2]", "")
				b.Children[j].Text = strings.ReplaceAll(b.Children[j].Text, "[IMAGE_3]", "")
			}
		}
		out = append(out, b)
	}
	return out
}

// rewritePostBody uses Gemini to regenerate body content
func rewritePostBody(geminiKey, title, currentBody string) (string, error) {
	prompt := fmt.Sprintf(`You are a senior science journalist for usa-graphene.com.
The following blog post titled "%s" has an incomplete or abrupt body. Rewrite it as a complete, high-quality article.

Current incomplete body:
%s

RULES:
1. Length: 1800-2200 words.
2. Structure: Introduction → 5-7 sections with ## H2 headings → FAQ (5 Q&A) → Conclusion.
3. Every paragraph: 4-7 sentences. No bullet lists.
4. Tone: direct, confident, expert. About graphene science/technology.
5. NO AI clichés: 'In conclusion', 'Furthermore', 'Moreover', 'Delve into'.
6. NO markdown bold/italic. Plain text only. No ** or *.
7. Place [IMAGE_2] and [IMAGE_3] on their own lines between paragraphs.

Return ONLY the article body text (no JSON wrapper). Start directly with the intro paragraph.`, title, currentBody[:min(2000, len(currentBody))])

	body := map[string]any{
		"contents":         []any{map[string]any{"parts": []any{map[string]any{"text": prompt}}}},
		"generationConfig": map[string]any{"temperature": 0.85, "maxOutputTokens": 8192},
	}
	raw, _ := json.Marshal(body)
	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey

	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(raw))
	if err != nil {
		return "", err
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
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("json unmarshal failed: %w", err)
	}
	if len(result.Candidates) == 0 {
		return "", fmt.Errorf("gemini error: no candidates (raw: %s)", string(respBytes[:min(200, len(respBytes))]))
	}
	cand := result.Candidates[0]
	if len(cand.Content.Parts) == 0 {
		return "", fmt.Errorf("gemini returned empty parts (safety filter? raw: %s)", string(respBytes[:min(200, len(respBytes))]))
	}

	newBody := cand.Content.Parts[0].Text
	// Clean markdown from generated text
	newBody = strings.ReplaceAll(newBody, "**", "")
	newBody = strings.ReplaceAll(newBody, "__", "")
	re := regexp.MustCompile(`\n{3,}`)
	newBody = re.ReplaceAllString(newBody, "\n\n")
	return strings.TrimSpace(newBody), nil
}

func textToBlocks(text string) []Body {
	var blocks []Body
	for i, para := range strings.Split(text, "\n\n") {
		para = strings.TrimSpace(para)
		if para == "" {
			continue
		}
		bkey := shortHash(fmt.Sprintf("fix-b%d-%s", i, para[:min(24, len(para))]))
		skey := shortHash(fmt.Sprintf("fix-s%d-%s", i, para[:min(24, len(para))]))

		style := "normal"
		content := para
		if strings.HasPrefix(para, "## ") {
			style, content = "h2", para[3:]
		} else if strings.HasPrefix(para, "### ") {
			style, content = "h3", para[4:]
		}

		// Skip image placeholders — we leave existing images in place
		if content == "[IMAGE_2]" || content == "[IMAGE_3]" {
			continue
		}

		blocks = append(blocks, Body{
			Type:  "block",
			Key:   bkey,
			Style: style,
			Children: []Child{{
				Type:  "span",
				Key:   skey,
				Text:  content,
				Marks: []string{},
			}},
		})
	}
	return blocks
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	token := os.Getenv("SANITY_API_TOKEN")
	geminiKey := os.Getenv("GEMINI_API_KEY")
	if token == "" {
		fmt.Fprintln(os.Stderr, "SANITY_API_TOKEN required")
		os.Exit(1)
	}

	mode := "all"
	if len(os.Args) >= 2 {
		mode = os.Args[1]
	}

	// Fetch all posts
	query := `*[_type == "post"] | order(publishedAt desc) {
		_id, title, slug, excerpt, body
	}`
	data, err := sanityQuery(token, query)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		os.Exit(1)
	}
	var res struct {
		Result []Post `json:"result"`
	}
	json.Unmarshal(data, &res)
	posts := res.Result
	fmt.Printf("📊 Loaded %d posts\n\n", len(posts))

	// Phase 1: Fix markdown artifacts (fast, no AI needed)
	if mode == "all" || mode == "markdown" {
		fmt.Println("═══ PHASE 1: Cleaning markdown artifacts ═══")
		fixed := 0
		for _, p := range posts {
			if !hasMarkdownArtifacts(p.Body) {
				continue
			}
			cleaned := cleanMarkdownFromBody(p.Body)
			err := sanityMutate(token, []map[string]any{
				{"patch": map[string]any{
					"id":  p.ID,
					"set": map[string]any{"body": cleaned},
				}},
			})
			if err != nil {
				fmt.Printf("  ❌ %s: %v\n", p.Title, err)
				continue
			}
			fixed++
			fmt.Printf("  ✅ Cleaned: %s\n", p.Title)
		}
		fmt.Printf("  → %d posts cleaned of markdown\n\n", fixed)
	}

	// Phase 2: Remove leftover placeholders
	if mode == "all" || mode == "placeholders" {
		fmt.Println("═══ PHASE 2: Removing leftover image placeholders ═══")
		fixed := 0
		for _, p := range posts {
			if !hasPlaceholders(p.Body) {
				continue
			}
			cleaned := removePlaceholders(p.Body)
			err := sanityMutate(token, []map[string]any{
				{"patch": map[string]any{
					"id":  p.ID,
					"set": map[string]any{"body": cleaned},
				}},
			})
			if err != nil {
				fmt.Printf("  ❌ %s: %v\n", p.Title, err)
				continue
			}
			fixed++
			fmt.Printf("  ✅ Cleaned: %s\n", p.Title)
		}
		fmt.Printf("  → %d posts cleaned of placeholders\n\n", fixed)
	}

	// Phase 3: Delete truly empty posts (0 blocks, 0 words)
	if mode == "all" || mode == "empty" {
		fmt.Println("═══ PHASE 3: Deleting empty posts (0 words, 0 blocks) ═══")
		deleted := 0
		for _, p := range posts {
			wc := wordCount(p.Body)
			bc := 0
			for _, b := range p.Body {
				if b.Type == "block" {
					bc++
				}
			}
			if wc == 0 && bc == 0 {
				err := sanityMutate(token, []map[string]any{
					{"delete": map[string]any{"id": p.ID}},
				})
				if err != nil {
					fmt.Printf("  ❌ %s: %v\n", p.Title, err)
					continue
				}
				deleted++
				fmt.Printf("  🗑  Deleted: %s\n", p.Title)
			}
		}
		fmt.Printf("  → %d empty posts deleted\n\n", deleted)
	}

	// Phase 4: Rewrite low-word-count and abrupt posts via Gemini
	if (mode == "all" || mode == "rewrite") && geminiKey != "" {
		fmt.Println("═══ PHASE 4: Rewriting low-word-count / abrupt posts ═══")
		rewritten := 0
		for _, p := range posts {
			wc := wordCount(p.Body)
			if wc >= 800 && !isAbrupt(p.Body) {
				continue
			}
			if wc == 0 {
				continue // already handled by delete
			}

			currentText := bodyText(p.Body)
			fmt.Printf("  🤖 Rewriting: %s (%d words)...\n", p.Title, wc)

			newText, err := rewritePostBody(geminiKey, p.Title, currentText)
			if err != nil {
				fmt.Printf("  ❌ %s: %v\n", p.Title, err)
				continue
			}

			newBlocks := textToBlocks(newText)
			newWC := 0
			for _, b := range newBlocks {
				for _, c := range b.Children {
					newWC += len(strings.Fields(c.Text))
				}
			}

			if newWC < wc {
				fmt.Printf("  ⚠️  Skipped (new %d < old %d words): %s\n", newWC, wc, p.Title)
				continue
			}

			err = sanityMutate(token, []map[string]any{
				{"patch": map[string]any{
					"id":  p.ID,
					"set": map[string]any{"body": newBlocks},
				}},
			})
			if err != nil {
				fmt.Printf("  ❌ Patch failed: %s: %v\n", p.Title, err)
				continue
			}
			rewritten++
			fmt.Printf("  ✅ Rewritten: %s (%d → %d words)\n", p.Title, wc, newWC)

			time.Sleep(5 * time.Second)
		}
		fmt.Printf("  → %d posts rewritten\n\n", rewritten)
	}

	fmt.Println("✅ All fixes complete.")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
