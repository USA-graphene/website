package main

// renumberposts: Finds all posts whose title does NOT start with a number (e.g. "355." or "N. 355")
// and assigns them sequential numbers starting after the current max.
// It also standardizes existing "N. 355" titles to "355.".
// Patches both title and slug in Sanity.
//
// Usage:
//   SANITY_API_TOKEN=... go run main.go            # live
//   SANITY_API_TOKEN=... go run main.go --dry-run  # preview only

import (
	"bytes"
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

type Post struct {
	ID          string `json:"_id"`
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	PublishedAt string `json:"publishedAt"`
}

// rePrefix matches prefixes like "355. " or "N. 355 "
var rePrefix = regexp.MustCompile(`^(?:N\.\s*)?(\d+)\.?\s+`)
var reSlug   = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	s = strings.ToLower(s)
	s = reSlug.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
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

func sanityPatch(token, id string, fields map[string]any) error {
	payload, _ := json.Marshal(map[string]any{
		"mutations": []map[string]any{
			{"patch": map[string]any{"id": id, "set": fields}},
		},
	})
	mutURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	req, _ := http.NewRequest("POST", mutURL, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		n := len(b); if n > 200 { n = 200 }
		return fmt.Errorf("sanity %d: %s", resp.StatusCode, b[:n])
	}
	return nil
}

func main() {
	token := os.Getenv("SANITY_API_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "❌ SANITY_API_TOKEN required")
		os.Exit(1)
	}

	dryRun := false
	for _, a := range os.Args[1:] {
		if a == "--dry-run" {
			dryRun = true
		}
	}
	if dryRun {
		fmt.Println("🔍 DRY RUN — no changes saved")
	}

	fmt.Println("📊 Fetching all posts (chronological order)...")
	raw, err := sanityQuery(token, `*[_type=="post"]|order(publishedAt asc, _id asc){_id,title,publishedAt,"slug":slug.current}`)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		os.Exit(1)
	}

	var res struct {
		Result []Post `json:"result"`
	}
	json.Unmarshal(raw, &res)
	posts := res.Result
	fmt.Printf("   Loaded %d posts\n\n", len(posts))

	type job struct {
		post     Post
		newTitle string
		newSlug  string
		num      int
	}
	var jobs []job

	for i, p := range posts {
		num := i + 1 // Sequence from 1 to N
		
		// 1. Extract base title (remove any existing Number. or N. Number prefix)
		hasOldNumber := rePrefix.MatchString(p.Title)
		baseTitle := rePrefix.ReplaceAllString(p.Title, "")
		baseTitle = strings.TrimSpace(baseTitle)

		// 2. Define the ideal title
		idealTitle := fmt.Sprintf("%d. %s", num, baseTitle)
		
		// 3. Define the slug: Only change if it was unnumbered before
		idealSlug := p.Slug
		if !hasOldNumber {
			idealSlug = slugify(idealTitle)
		}

		// 4. Check if update is needed
		if p.Title == idealTitle && p.Slug == idealSlug {
			continue
		}

		jobs = append(jobs, job{
			post:     p,
			newTitle: idealTitle,
			newSlug:  idealSlug,
			num:      num,
		})
	}

	if len(jobs) == 0 {
		fmt.Println("✅ All posts are correctly numbered and standardized.")
		return
	}

	fmt.Printf("Found %d posts that need renumbering or standardization:\n\n", len(jobs))

	fixed := 0
	for _, j := range jobs {
		fmt.Printf("  [%d] Current: %s\n", j.num, j.post.Title[:min(60, len(j.post.Title))])
		fmt.Printf("       Fixed  : %s\n", j.newTitle[:min(60, len(j.newTitle))])
		
		if !dryRun {
			err := sanityPatch(token, j.post.ID, map[string]any{
				"title": j.newTitle,
				"slug":  map[string]string{"_type": "slug", "current": j.newSlug},
			})
			if err != nil {
				fmt.Printf("  ❌ Patch failed: %v\n", err)
				continue
			}
			time.Sleep(150 * time.Millisecond)
		}
		fixed++
	}

	fmt.Printf("\n%s\n", strings.Repeat("═", 60))
	fmt.Printf("✅ %d posts updated to sequential 1-%d numbering\n", fixed, len(posts))
}

func min(a, b int) int {
	if a < b { return a }
	return b
}
