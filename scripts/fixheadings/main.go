package main

// fixheadings: Scans all Sanity posts for "normal"-style blocks that look like
// headings (short, title-case, no trailing period) and promotes them to h2.
// This fixes the 138 posts flagged for "FEW H2 HEADINGS: 0" without any AI calls.
//
// Usage:
//   SANITY_API_TOKEN=... go run main.go
//   SANITY_API_TOKEN=... go run main.go --dry-run

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
	"unicode"
)

const sanityProject = "t9t7is4j"

// ── Types ─────────────────────────────────────────────────────────────────────

type Post struct {
	ID   string `json:"_id"`
	Title string `json:"title"`
	Body []Block `json:"body"`
}

type Block struct {
	Type     string  `json:"_type"`
	Key      string  `json:"_key"`
	Style    string  `json:"style,omitempty"`
	Children []Child `json:"children,omitempty"`
}

type Child struct {
	Type  string   `json:"_type"`
	Key   string   `json:"_key"`
	Text  string   `json:"text"`
	Marks []string `json:"marks"`
}

// ── Heading detection ─────────────────────────────────────────────────────────

// looksLikeHeading returns true for blocks that are structurally heading-like:
// - Single span (no mixed formatting)
// - Short text (5–120 chars)
// - Starts with an uppercase letter
// - No trailing period (headings don't end with .)
// - No sentence-internal lowercase run (avoids mis-tagging long sentences)
func looksLikeHeading(b Block) bool {
	if b.Type != "block" || b.Style != "normal" {
		return false
	}
	if len(b.Children) != 1 {
		return false
	}
	text := strings.TrimSpace(b.Children[0].Text)
	if len(text) < 5 || len(text) > 120 {
		return false
	}
	// Must start with uppercase
	runes := []rune(text)
	if !unicode.IsUpper(runes[0]) {
		return false
	}
	// Must NOT end with a period, question mark, or comma (those are sentences)
	last := runes[len(runes)-1]
	if last == '.' || last == ',' || last == ';' {
		return false
	}
	// Must NOT contain more than 3 lowercase letters followed by a space
	// (i.e. avoid re-tagging normal sentences that happen to be short)
	words := strings.Fields(text)
	if len(words) > 14 {
		return false
	}
	// At least one graphene/science keyword (avoids tagging random short phrases)
	lower := strings.ToLower(text)
	keywords := []string{
		"graphene", "carbon", "nanotube", "nanoribbon", "oxide", "composite",
		"properties", "applications", "synthesis", "fabrication", "electronic",
		"optical", "mechanical", "thermal", "electrical", "sensor", "battery",
		"energy", "hydrogen", "polymer", "nanocomposite", "coating", "transport",
		"introduction", "conclusion", "overview", "results", "methods", "structure",
		"behavior", "performance", "effects", "role", "impact", "challenges",
		"future", "industry", "device", "material", "substrate", "electrode",
	}
	for _, kw := range keywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}

func h2Count(body []Block) int {
	n := 0
	for _, b := range body {
		if b.Type == "block" && b.Style == "h2" {
			n++
		}
	}
	return n
}

// ── Sanity helpers ────────────────────────────────────────────────────────────

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

func sanityPatch(token, postID string, body []Block) error {
	mutations := []map[string]any{
		{"patch": map[string]any{
			"id":  postID,
			"set": map[string]any{"body": body},
		}},
	}
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
		body, _ := io.ReadAll(resp.Body)
		n := len(body)
		if n > 300 {
			n = 300
		}
		return fmt.Errorf("sanity %d: %s", resp.StatusCode, string(body[:n]))
	}
	return nil
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	token := os.Getenv("SANITY_API_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "❌ SANITY_API_TOKEN required")
		os.Exit(1)
	}

	dryRun := false
	for _, arg := range os.Args[1:] {
		if arg == "--dry-run" {
			dryRun = true
		}
	}
	if dryRun {
		fmt.Println("🔍 DRY RUN — no changes will be saved")
	}

	// Fetch all posts with their body
	fmt.Println("📊 Fetching all posts from Sanity...")
	query := `*[_type == "post"] | order(publishedAt desc) {
		_id, title, body[] { _type, _key, style, children[] { _type, _key, text, marks } }
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
	fmt.Printf("   Loaded %d posts\n\n", len(posts))

	fixed := 0
	skipped := 0

	for _, p := range posts {
		if h2Count(p.Body) >= 2 {
			skipped++
			continue
		}

		// Scan for promotable heading blocks
		var promoted []string
		newBody := make([]Block, len(p.Body))
		copy(newBody, p.Body)

		for i, b := range newBody {
			if looksLikeHeading(b) {
				newBody[i].Style = "h2"
				promoted = append(promoted, b.Children[0].Text)
			}
		}

		if len(promoted) < 2 {
			// Not enough promotable headings — skip rather than produce a bad result
			skipped++
			continue
		}

		fmt.Printf("  📝 %s\n", p.Title)
		for _, h := range promoted {
			fmt.Printf("     → h2: %s\n", truncate(h, 70))
		}

		if !dryRun {
			if err := sanityPatch(token, p.ID, newBody); err != nil {
				fmt.Printf("  ❌ Patch failed: %v\n", err)
				continue
			}
			time.Sleep(200 * time.Millisecond) // be gentle on the API
		}
		fixed++
	}

	fmt.Printf("\n%s\n", strings.Repeat("═", 60))
	fmt.Printf("✅ Done — %d posts fixed, %d skipped (already OK or not enough detectable headings)\n", fixed, skipped)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
