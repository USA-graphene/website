import urllib.request, json, os, sys, hashlib, re

SANITY_TOKEN = os.environ.get('SANITY_API_TOKEN', 'sk2xXoAc8mZArN3wBhEHt1k06l5HBQNOixYOvYuNwOg20aWlZDfQKVzrKzC2T8vGyJ74zG0Bv0ytYMgAl2Zd30YiXKBge2oKzlIW79rsdB2o0WMBbTFffPN9wOmwc2zyfKMzBmD72Wfpvhz9xxfn7imI7g6oYjGcwubpOOfRsa8k0C8nFii4')
SANITY_PROJECT = 't9t7is4j'
GEMINI_KEY = 'AIzaSyC5n4GiKdaglnPdHC_G4cC72Z7uxzIifaA'

# 1. Fetch doc
query = urllib.parse.quote('*[_id == "v2I8xbswIO3h0NWvyFu66C"][0]')
url = f'https://{SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/query/production?query={query}'
req = urllib.request.Request(url, headers={'Authorization': f'Bearer {SANITY_TOKEN}'})
with urllib.request.urlopen(req) as resp:
    doc = json.loads(resp.read())['result']

blocks = doc.get('body', [])
old_text = '\n\n'.join(b['children'][0]['text'] for b in blocks if 'children' in b)
print('Old word count:', len(old_text.split()))

# 2. Re-write
prompt = f"""You are a senior science writer for usa-graphene.com.
I have a draft of an article titled '{doc['title']}' that was accidentally truncated.
Here is what was written so far:
{old_text}

Please rewrite the entire article from scratch to be a complete, deeply SEO-optimized blog post, fixing the truncation.

WRITING RULES:
1. Length: 1800–2200 words total.
2. Structure: Introduction (2–3 paragraphs) → 5–7 sections each with an ## H2 heading → FAQ (5 Q&A) → Conclusion.
3. Every paragraph: 4–7 sentences. No bullet lists inside the body.
4. Tone: direct, confident, expert.
5. NO AI clichés: 'In conclusion', 'It is important to note', 'Furthermore', 'Moreover', 'Delve into', 'Revolutionize', 'Game-changer', etc.
6. NO markdown bold or italic — plain text only. Do not use ** or *.
7. Include technical details appropriate for engineers and researchers.
8. Conclusion ends with a specific call-to-action to usa-graphene.com.

Return ONLY a JSON object with this exact format:
{{
  "body": "full article text with ## H2 headings, double newlines between paragraphs. No bolding. No code fences."
}}
"""

payload = json.dumps({
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'temperature': 0.8, 'maxOutputTokens': 8192}
}).encode()
g_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}'
req2 = urllib.request.Request(g_url, data=payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req2, timeout=300) as resp2:
    data = json.loads(resp2.read())
text = data['candidates'][0]['content']['parts'][0]['text'].strip()
if text.startswith('```'):
    text = '\n'.join(text.split('\n')[1:-1])

try:
    new_body = json.loads(text)['body']
except Exception as e:
    m = re.search(r'"body"\s*:\s*"(.*)"', text, re.DOTALL)
    if m:
        new_body = m.group(1).replace('\\n', '\n').replace('\\"', '"')
    else:
        print('Regex failed on output:', text[:200])
        sys.exit(1)

# Clean
new_body = new_body.replace('**', '').replace('__', '')
new_body = re.sub(r'(?<!\w)\*([^*]+)\*(?!\w)', r'\1', new_body)
new_body = re.sub(r'\n{3,}', '\n\n', new_body).strip()

print('New word count:', len(new_body.split()))

def body_to_blocks(body_text):
    blocks = []
    for i, para in enumerate(body_text.split('\n\n')):
        para = para.strip()
        if not para: continue
        bkey = hashlib.md5(f"b{i}-{para[:24]}".encode()).hexdigest()[:8]
        skey = hashlib.md5(f"s{i}-{para[:24]}".encode()).hexdigest()[:8]
        if para.startswith('## '):
            text, style = para[3:].strip(), 'h2'
        elif para.startswith('### '):
            text, style = para[4:].strip(), 'h3'
        else:
            text, style = para, 'normal'
        blocks.append({
            '_type': 'block', '_key': bkey, 'style': style,
            'children': [{'_type': 'span', '_key': skey, 'text': text, 'marks': []}],
        })
    return blocks

mutations = {'mutations': [{'patch': {'id': doc['_id'], 'set': {'body': body_to_blocks(new_body)}}}]}
m_url = f'https://{SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/mutate/production'
req3 = urllib.request.Request(m_url, data=json.dumps(mutations).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {SANITY_TOKEN}'})
with urllib.request.urlopen(req3) as resp3:
    print('Sanity update:', json.loads(resp3.read()))
