package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

const sanityProject = "t9t7is4j"

type Post struct {
	ID    string `json:"_id"`
	Slug  string `json:"slug"`
	Title string `json:"title"`
}

func env(key string) string {
	val := os.Getenv(key)
	if val == "" {
		fmt.Printf("❌ Missing environment variable: %s\n", key)
		os.Exit(1)
	}
	return val
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

func patchSlug(token, postID, newSlug string) error {
	apiURL := fmt.Sprintf("https://%s.api.sanity.io/v2023-05-03/data/mutate/production", sanityProject)
	mutation := map[string]any{
		"mutations": []any{
			map[string]any{
				"patch": map[string]any{
					"id": postID,
					"set": map[string]any{
						"slug": map[string]any{
							"_type":   "slug",
							"current": newSlug,
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

func main() {
	sanityToken := env("SANITY_API_TOKEN")

	fmt.Println("🔍 Fetching all posts from Sanity...")
	query := `*[_type == "post"]{ _id, title, "slug": slug.current }`
	data, err := sanityQuery(sanityToken, query)
	if err != nil {
		fmt.Printf("❌ Query failed: %v\n", err)
		os.Exit(1)
	}

	var res struct {
		Result []Post `json:"result"`
	}
	if err := json.Unmarshal(data, &res); err != nil {
		fmt.Printf("❌ Parse failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("📊 Found %d total posts.\n", len(res.Result))

	slugMap := make(map[string][]Post)
	for _, p := range res.Result {
		// Ignore posts with empty slugs for this check
		if p.Slug == "" {
			continue
		}
		slugMap[p.Slug] = append(slugMap[p.Slug], p)
	}

	fixedCount := 0
	for slug, posts := range slugMap {
		if len(posts) > 1 {
			fmt.Printf("\n⚠️  Found %d posts with the exact same slug: /%s/\n", len(posts), slug)
			// Keep the first one as is, patch the rest
			for i := 1; i < len(posts); i++ {
				post := posts[i]
				newSlug := fmt.Sprintf("%s-%d", slug, i+1)
				fmt.Printf("   -> Renaming post ID %s ('%s') to slug: /%s/\n", post.ID, post.Title, newSlug)
				
				err := patchSlug(sanityToken, post.ID, newSlug)
				if err != nil {
					fmt.Printf("   ❌ Failed to patch: %v\n", err)
				} else {
					fmt.Printf("   ✅ Successfully patched!\n")
					fixedCount++
				}
				time.Sleep(500 * time.Millisecond) // rate limit protection
			}
		}
	}

	if fixedCount == 0 {
		fmt.Println("\n🎉 All good! No duplicate slugs were found.")
	} else {
		fmt.Printf("\n🎉 Done! Fixed %d duplicate slugs across the database.\n", fixedCount)
	}
}
