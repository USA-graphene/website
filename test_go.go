package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	key := os.Getenv("GOOGLE_AI_API_KEY")
	apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=%s", key)
	
	payload := map[string]any{
		"contents": []any{
			map[string]any{
				"parts": []any{
					map[string]any{
						"text": "A blue circle",
					},
				},
			},
		},
	}
	raw, _ := json.Marshal(payload)
	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(raw))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	data, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	fmt.Println("Status:", resp.StatusCode)
	fmt.Println("Body:", string(data))
}
