const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function testCron() {
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  console.log(`[Test] Starting Verified Gemini 3.1 Pro Run...`);

  try {
    // Fetch existing slugs to avoid duplicates
    const allPosts = await sanityClient.fetch(`*[_type == "post"]{ "slug": slug.current, title }`);
    const existingSlugs = new Set(allPosts.map(p => p.slug));

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene&start=0&max_results=15&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let selected = null;
    let match;
    
    while ((match = entryRegex.exec(arxivXml)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      const slug = slugify(title);

      // Simple duplicate check
      const isDuplicate = Array.from(existingSlugs).some(s => s && s.includes(slug.substring(0, 20)));
      if (!isDuplicate) {
        selected = { title, abstract };
        break;
      }
    }

    if (!selected) throw new Error("No new ArXiv papers found (all are already published)");

    console.log(`[Test] Generating 2000+ words for NEW paper: ${selected.title}`);
    const prompt = `You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word technical article based on this paper:

Title: ${selected.title}
Abstract: ${selected.abstract}

WRITING RULES:
1. Length: Minimum 2000 words.
2. Structure: Introduction → 5-7 sections with ## H2 headings → FAQ (5 Q&A) → Conclusion.
3. Every paragraph: 4-7 sentences. NO bullet points, NO numbered lists, NO bolding (**).
4. Tone: expert, technical. Use natural transitions between concepts.
5. NO bolded labels like '1. **Topic:**' or 'Key Point:'.
6. NO AI clichés: 'In conclusion', 'Moreover', 'Furthermore', 'It is important to note'.

Return ONLY a JSON object:
{
  "title": "SEO Title",
  "excerpt": "Short summary",
  "body": "Full article text with ## headings",
  "imagePrompt": "A high-end 3D render of ${selected.title}..."
}`;

    const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 16384, response_mime_type: "application/json" }
      })
    });

    const gData = await gRes.json();
    const rawText = gData.candidates[0].content.parts[0].text;
    const p = JSON.parse(rawText);
    console.log(`[Test] Gemini Article length: ${p.body.split(" ").length} words`);

    console.log(`[Test] Generating Nano Banana Image...`);
    const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: p.imagePrompt }] }] })
    });
    
    const iData = await iRes.json();
    const b64 = iData.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;

    let maxNumber = 0;
    allPosts.forEach(post => {
      const m = post.title.match(/^(\d+)\./);
      if (m) maxNumber = Math.max(maxNumber, parseInt(m[1]));
    });
    const nextNumber = maxNumber + 1;
    const finalTitle = `${nextNumber}. ${p.title}`;
    const finalSlug = slugify(finalTitle);

    let assetId = '';
    if (b64) {
      const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
      assetId = asset._id;
    }

    console.log(`[Test] Publishing: ${finalTitle}`);
    const created = await sanityClient.create({
      _type: 'post',
      title: finalTitle,
      slug: { _type: 'slug', current: finalSlug },
      excerpt: p.excerpt,
      body: p.body.split('\n\n').filter(para => para.trim() !== '').map(para => {
        let style = 'normal';
        let text = para.trim();

        // Clean AI markings
        text = text.replace(/^\d+\.\s*\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
        text = text.replace(/^\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
        text = text.replace(/\*\*/g, '');

        if (text.startsWith('## ')) { style = 'h2'; text = text.replace(/^##\s+/, ''); }
        return {
          _type: 'block', _key: Math.random().toString(36).slice(2, 11),
          style: style,
          children: [{ _type: 'span', text: text, marks: [] }]
        };
      }),
      publishedAt: new Date().toISOString(),
      mainImage: assetId ? { _type: 'image', asset: { _ref: assetId } } : undefined,
      author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
      categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }]
    });

    console.log(`[Test] SUCCESS! Post Created: https://usa-graphene.com/blog/${finalSlug}`);
  } catch (err) {
    console.error(`[Test] FAILED: ${err.message}`);
  }
}

testCron();
