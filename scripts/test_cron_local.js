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

function normalizeArxivId(id) {
  if (!id) return '';
  return id.split('v')[0].trim();
}

async function testCron() {
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const limit = 1;

  console.log(`[Test] Starting Improved Daily Automation Test...`);

  try {
    // 1. Fetch existing ArXiv IDs
    const existingArxivIds = await sanityClient.fetch(`*[_type == "post" && defined(arxivId)].arxivId`);
    const arxivIdSet = new Set(existingArxivIds.map(normalizeArxivId));

    console.log(`[Test] Found ${arxivIdSet.size} existing ArXiv IDs in Sanity.`);

    // 2. Fetch papers from Semantic Scholar (Sorted by Date)
    let selected = null;
    try {
      const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=graphene&fields=paperId,title,abstract,authors,externalIds,publicationDate&limit=50&sort=publicationDate:desc`
      console.log(`[Test] Fetching from Semantic Scholar (Date Sort)...`);
      const ssRes = await fetch(ssUrl, {
        headers: { 'User-Agent': 'USA-Graphene-Bot/1.1' }
      });
      
      if (ssRes.ok) {
        const ssData = await ssRes.json();
        const papers = ssData.data || [];
        for (const paper of papers) {
          const rawId = paper.externalIds?.ArXiv || paper.paperId;
          const normalizedId = normalizeArxivId(rawId);
          if (normalizedId && !arxivIdSet.has(normalizedId)) {
            selected = {
              arxivId: rawId,
              title: paper.title?.trim(),
              abstract: paper.abstract?.trim() || 'No abstract available.',
              authors: (paper.authors || []).map(a => a.name).join(', ')
            };
            console.log(`[Test] Found NEW paper via Semantic Scholar: ${selected.arxivId}`);
            break;
          }
        }
      }
    } catch (ssErr) {
      console.warn(`[Test] Semantic Scholar failed: ${ssErr.message}`);
    }

    // 3. Fallback to ArXiv if needed
    if (!selected) {
      console.log(`[Test] No new papers in Semantic Scholar top 50. Trying ArXiv...`);
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene+OR+abs:graphene&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;
      const arxivRes = await fetch(arxivUrl);
      const arxivXml = await arxivRes.text();
      
      if (arxivXml.includes('Rate exceeded')) {
        throw new Error("ArXiv Rate Limit Exceeded");
      }

      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      
      while ((match = entryRegex.exec(arxivXml)) !== null) {
        const entry = match[1];
        const arxivId = entry.match(/<id>.*?\/abs\/(.*?)<\/id>/)?.[1] || entry.match(/<id>(.*?)<\/id>/)?.[1];
        const normalizedId = normalizeArxivId(arxivId);
        
        if (normalizedId && !arxivIdSet.has(normalizedId)) {
          selected = {
            arxivId,
            title: entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim(),
            abstract: entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim(),
            authors: 'ArXiv Researchers'
          };
          console.log(`[Test] Found NEW paper via ArXiv: ${selected.arxivId}`);
          break;
        }
      }
    }

    if (!selected) throw new Error("No new Graphene papers found (all top results are already published)");

    console.log(`[Test] Generating 2000+ words for: ${selected.title}`);
    const prompt = `You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word technical article based on this paper:

Title: ${selected.title}
Abstract: ${selected.abstract}

WRITING RULES:
1. Length: Minimum 2000 words.
2. Structure: Introduction → 5-7 sections with ## H2 headings → FAQ (5 Q&A) → Conclusion.
3. **MANDATORY**: Start the body with: "Research conducted by: ${selected.authors}" followed by a paragraph crediting their work.
4. No bullet points, no bolding (**).
5. Return ONLY a JSON object:
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
        generationConfig: { temperature: 0.8, maxOutputTokens: 16384, response_mime_type: "application/json" }
      })
    });

    const gData = await gRes.json();
    const rawText = gData.candidates[0].content.parts[0].text;
    const p = JSON.parse(rawText);
    console.log(`[Test] Gemini Article generated. Length: ${p.body.split(" ").length} words`);

    console.log(`[Test] Generating Studio Quality Image (Nano Banana Pro)...`);
    const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: p.imagePrompt }] }] })
    });
    
    const iData = await iRes.json();
    const b64 = iData.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;

    let maxNumber = 0;
    const allPosts = await sanityClient.fetch(`*[_type == "post"]{ title }`);
    allPosts.forEach(post => {
      const m = post.title.match(/^(\d+)\./);
      if (m) maxNumber = Math.max(maxNumber, parseInt(m[1]));
    });
    const finalTitle = `${maxNumber + 1}. ${p.title}`;
    const finalSlug = slugify(finalTitle);

    let assetId = '';
    if (b64) {
      const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
      assetId = asset._id;
    }

    console.log(`[Test] Publishing: ${finalTitle}`);
    const created = await sanityClient.create({
      _type: 'post',
      arxivId: selected.arxivId,
      title: finalTitle,
      seoTitle: p.title,
      seoDescription: p.excerpt,
      slug: { _type: 'slug', current: finalSlug },
      excerpt: p.excerpt,
      body: p.body.split(/\n{2,}/).filter(para => para.trim() !== '').map(para => {
        const text = para.trim().replace(/^##\s+/, '').replace(/\*\*/g, '');
        return {
          _type: 'block', _key: Math.random().toString(36).slice(2, 11),
          style: para.startsWith('## ') ? 'h2' : 'normal',
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
