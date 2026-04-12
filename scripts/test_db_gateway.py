#!/usr/bin/env python3
import requests
import sys

def test_endpoint(url):
    print(f"Testing Graphene DB Gateway: {url}")
    try:
        # 1. Test basic connectivity (should return 200 or 401/403 if auth is on)
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Successfully reached the index!")
            # Try to list tables
            print("Tables available (Public API):")
            print(response.json())
        elif response.status_code == 401:
            print("Connected, but Authentication is Required (Good sign for security!)")
        else:
            print(f"Server responded with: {response.text[:200]}")

    except requests.exceptions.ConnectionError:
        print("Failed to connect. Ensure your A record is set and ports are forwarded.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        url = "https://db.usa-graphene.com"
    else:
        url = sys.argv[1]
    
    test_endpoint(url)
