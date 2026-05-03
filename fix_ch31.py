import urllib.request, json, os, sys, hashlib, re
sys.path.insert(0, '/Users/raimis/aa/scripts')
import publish_vol2_posts as pub

SANITY_TOKEN = os.environ.get('SANITY_API_TOKEN', 'sk2xXoAc8mZArN3wBhEHt1k06l5HBQNOixYOvYuNwOg20aWlZDfQKVzrKzC2T8vGyJ74zG0Bv0ytYMgAl2Zd30YiXKBge2oKzlIW79rsdB2o0WMBbTFffPN9wOmwc2zyfKMzBmD72Wfpvhz9xxfn7imI7g6oYjGcwubpOOfRsa8k0C8nFii4')
SANITY_PROJECT = 't9t7is4j'

query = urllib.parse.quote('*[_type == "post" && title match "Designing Advanced Carbon-Based*"][0]')
url = f'https://{SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/query/production?query={query}'
req = urllib.request.Request(url, headers={'Authorization': f'Bearer {SANITY_TOKEN}'})
with urllib.request.urlopen(req) as resp:
    doc = json.loads(resp.read())['result']
    
print("Found doc ID:", doc['_id'])

reader = pub.PdfReader(pub.PDF_PATH)
ch_text = pub.extract_chapter_text(reader, 30)

post = pub.gemini_write_post("Designing Carbon-Based Thin Films from Graphene-Like Nanostructures", ch_text)
body = pub.clean_body(post["body"])
print("New word count:", len(body.split()))

if len(body.split()) < 100:
    print("STILL FAILED:", post)
    sys.exit(1)

mutations = {'mutations': [{'patch': {'id': doc['_id'], 'set': {'body': pub.body_to_blocks(body, None, None)}}}]}
m_url = f'https://{SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/mutate/production'
req3 = urllib.request.Request(m_url, data=json.dumps(mutations).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {SANITY_TOKEN}'})
with urllib.request.urlopen(req3) as resp3:
    print('Sanity update:', json.loads(resp3.read()))
