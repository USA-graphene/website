package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const sanityProject = "t9t7is4j"

type Post struct {
	ID          string `json:"_id"`
	Title       string `json:"title"`
	Slug        struct{ Current string `json:"current"` } `json:"slug"`
	Excerpt     string `json:"excerpt"`
	PublishedAt string `json:"publishedAt"`
	WordCount   int    `json:"wordCount"`
	Body        []struct {
		Type     string `json:"_type"`
		Style    string `json:"style"`
		Children []struct {
			Text string `json:"text"`
		} `json:"children"`
	} `json:"body"`
}

func main() {
	token := os.Getenv("SANITY_API_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "SANITY_API_TOKEN required")
		os.Exit(1)
	}

	// Fetch all posts with body content
	query := `*[_type == "post"] | order(publishedAt desc) {
		_id, title, slug, excerpt, publishedAt,
		"wordCount": length(pt::text(body)),
		body[] { _type, style, children[] { text } }
	}`

	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/query/production?query=%s",
		sanityProject, url.QueryEscape(query))

	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "API error: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var result struct {
		Result []Post `json:"result"`
	}
	if err := json.Unmarshal(data, &result); err != nil {
		fmt.Fprintf(os.Stderr, "Parse error: %v\n%s\n", err, string(data[:min(300, len(data))]))
		os.Exit(1)
	}

	posts := result.Result
	fmt.Printf("📊 Total posts: %d\n\n", len(posts))

	type Issue struct {
		ID       string
		Title    string
		Slug     string
		Problems []string
	}
	var issues []Issue

	for _, p := range posts {
		var problems []string

		// Extract full body text
		var bodyParts []string
		blockCount := 0
		for _, b := range p.Body {
			if b.Type == "block" {
				blockCount++
				for _, c := range b.Children {
					if c.Text != "" {
						bodyParts = append(bodyParts, c.Text)
					}
				}
			}
		}
		fullText := strings.Join(bodyParts, " ")
		wordCount := len(strings.Fields(fullText))

		// Check: too few words
		if wordCount < 800 {
			problems = append(problems, fmt.Sprintf("LOW WORD COUNT: %d words (need 800+)", wordCount))
		}

		// Check: too few blocks
		if blockCount < 5 {
			problems = append(problems, fmt.Sprintf("TOO FEW BLOCKS: %d (need 5+)", blockCount))
		}

		// Check: no H2 headings
		h2Count := 0
		for _, b := range p.Body {
			if b.Style == "h2" {
				h2Count++
			}
		}
		if h2Count < 2 {
			problems = append(problems, fmt.Sprintf("FEW H2 HEADINGS: %d (need 2+)", h2Count))
		}

		// Check: abrupt ending - last block too short
		if len(bodyParts) > 0 {
			lastPara := bodyParts[len(bodyParts)-1]
			lastWords := len(strings.Fields(lastPara))
			if lastWords < 10 {
				problems = append(problems, fmt.Sprintf("ABRUPT ENDING: last paragraph only %d words: \"%s\"", lastWords, truncate(lastPara, 80)))
			}
		}

		// Check: missing excerpt
		if strings.TrimSpace(p.Excerpt) == "" {
			problems = append(problems, "MISSING EXCERPT")
		}

		// Check: title too short or generic
		if len(p.Title) < 15 {
			problems = append(problems, fmt.Sprintf("SHORT TITLE: \"%s\"", p.Title))
		}

		// Check: body contains leftover placeholders
		if strings.Contains(fullText, "[IMAGE_2]") || strings.Contains(fullText, "[IMAGE_3]") {
			problems = append(problems, "LEFTOVER IMAGE PLACEHOLDERS in body text")
		}

		// Check: body contains markdown artifacts
		if strings.Contains(fullText, "**") || strings.Contains(fullText, "##") {
			problems = append(problems, "MARKDOWN ARTIFACTS in body text")
		}

		if len(problems) > 0 {
			issues = append(issues, Issue{p.ID, p.Title, p.Slug.Current, problems})
		}
	}

	// Print healthy summary
	fmt.Printf("✅ Healthy posts: %d / %d\n", len(posts)-len(issues), len(posts))
	fmt.Printf("⚠️  Posts with issues: %d\n\n", len(issues))

	if len(issues) == 0 {
		fmt.Println("All posts look good!")
		return
	}

	fmt.Println(strings.Repeat("=", 80))
	for i, iss := range issues {
		fmt.Printf("\n%d. %s\n", i+1, iss.Title)
		fmt.Printf("   Slug: %s\n", iss.Slug)
		fmt.Printf("   ID:   %s\n", iss.ID)
		for _, prob := range iss.Problems {
			fmt.Printf("   ❌ %s\n", prob)
		}
	}

	// Output JSON for programmatic use
	jsonOut, _ := json.MarshalIndent(issues, "", "  ")
	os.WriteFile("/Users/raimis/aa/audit_results.json", jsonOut, 0644)
	fmt.Printf("\n\n📄 Full audit written to audit_results.json\n")
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
