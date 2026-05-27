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

// Normalize ArXiv ID by removing version (e.g., 2405.00001v1 -> 2405.00001)
function normalizeArxivId(id) {
  if (!id) return '';
  if (id.startsWith('openalex:') || id.startsWith('10.')) {
    return id.trim().toLowerCase();
  }
  return id.split('v')[0].trim();
}

// Helper to reconstruct abstract from OpenAlex inverted index
function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return '';
  try {
    const wordEntries = Object.entries(invertedIndex);
    let maxPos = 0;
    for (const [word, positions] of wordEntries) {
      for (const pos of positions) {
        if (pos > maxPos) maxPos = pos;
      }
    }
    const words = new Array(maxPos + 1).fill('');
    for (const [word, positions] of wordEntries) {
      for (const pos of positions) {
        words[pos] = word;
      }
    }
    return words.join(' ').trim();
  } catch (e) {
    return '';
  }
}

async function testCron() {
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const limit = 1;

  console.log(`[Test] Starting Improved Daily Automation Test...`);

  try {
    // 1. Fetch existing ArXiv IDs and Titles
    const existingPosts = await sanityClient.fetch(`*[_type == "post" && defined(title)]{ arxivId, title }`);
    const arxivIdSet = new Set(existingPosts.filter(p => p.arxivId).map(p => normalizeArxivId(p.arxivId)));
    
    // Create a normalized title set (lowercase, stripped of punctuation and numbers) to catch exact duplicates
    const titleSet = new Set(existingPosts.map(p => {
      // Remove the prefix numbering like "461. " and lowercase it
      const cleanTitle = p.title.replace(/^\d+\.\s*/, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      return cleanTitle;
    }));

    console.log(`[Test] Found ${arxivIdSet.size} existing ArXiv IDs and ${titleSet.size} titles in Sanity.`);

    // 2. Fetch papers from OpenAlex (Highly robust, no IP bans)
    let selected = null;
    try {
      const oaUrl = `https://api.openalex.org/works?filter=title.search:graphene&sort=publication_date:desc&per-page=30`
      console.log(`[Test] Fetching from OpenAlex...`);
      const oaRes = await fetch(oaUrl, {
        headers: { 'User-Agent': 'USA-Graphene-Bot/1.2 (mailto:info@usa-graphene.com)' }
      });
      
      if (oaRes.ok) {
        const oaData = await oaRes.json();
        const papers = oaData.results || [];
        for (const paper of papers) {
          const rawId = paper.id?.replace('https://openalex.org/', 'openalex:') || paper.doi?.replace('https://doi.org/', '');
          if (!rawId) continue;
          
          const normalizedId = normalizeArxivId(rawId);
          const abstractText = reconstructAbstract(paper.abstract_inverted_index);
          const rawTitle = paper.title?.trim() || 'Untitled Graphene Research';
          const normalizedTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          
          if (normalizedId && !arxivIdSet.has(normalizedId) && !titleSet.has(normalizedTitle) && abstractText.length > 200) {
            const authors = (paper.authorships || []).map(a => a.author?.display_name).filter(Boolean).join(', ');
            selected = {
              arxivId: rawId,
              title: rawTitle,
              abstract: abstractText,
              authors: authors || 'Graphene Research Team'
            };
            console.log(`[Test] Found NEW paper via OpenAlex: ${selected.arxivId}`);
            break;
          }
        }
      } else {
        console.warn(`[Test] OpenAlex failed: ${oaRes.status}`);
      }
    } catch (oaErr) {
      console.warn(`[Test] OpenAlex error: ${oaErr.message}`);
    }

    if (!selected) throw new Error("No new Graphene papers found (all top results are already published)");

    console.log(`[Test] Generating 2000+ words for: ${selected.title}`);
    const prompt = `You are a senior science journalist and patient technical teacher for usa-graphene.com.
Write a deeply detailed, educational 2000+ word technical article based on this paper:

Title: ${selected.title}
Abstract: ${selected.abstract}

WRITING RULES:
1. Length: Minimum 2000 words, but prioritize clear teaching over filler.
2. No bullet points, no numbered lists, no bolding (**). Use paragraphs and ## H2 headings only.
3. Explain cause and effect. Do not just say graphene improves performance; explain how conductivity, surface area, interfaces, defects, chemistry, or structure affect the result.
4. Begin with a plain-English hook explaining why this research matters to a smart non-specialist.
5. MANDATORY: In the first section, naturally credit the researchers by name: ${selected.authors}. Do not use the label "Research conducted by:".
6. Use this exact body structure with ## headings:
   Opening plain-English hook before the first heading.
   ## The Problem This Research Is Solving
   ## The Key Idea in Plain English
   ## How the Graphene-Based System Works
   ## What the Researchers Found
   ## Why the Result Matters
   ## Limitations and What Still Needs Testing
   ## Real-World Applications
   ## If You Remember One Thing
   ## FAQ
   ## Conclusion
7. The FAQ must include 5 beginner-friendly Q&A pairs written in paragraph form.
8. Be honest about limitations. Do not imply the work is commercially ready unless the abstract clearly says so.
9. Return ONLY a JSON object:
{
  "title": "SEO Title",
  "excerpt": "Short educational SEO summary",
  "body": "Full article text with ## headings",
  "imagePrompt": "A high-end 16:9 scientific cover image prompt for this research. No text, no labels, no watermark."
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
      body: p.body.split(/\n{2,}/).filter(para => para.trim() !== '').flatMap(para => {
        const trimmed = para.trim().replace(/\*\*/g, '');
        const headingMatch = trimmed.match(/^##\s+([^\n]+)(?:\n+([\s\S]+))?$/);
        if (headingMatch) {
          const blocks = [{
            _type: 'block', _key: Math.random().toString(36).slice(2, 11),
            style: 'h2',
            children: [{ _type: 'span', text: headingMatch[1].trim(), marks: [] }]
          }];
          const followingText = headingMatch[2]?.trim();
          if (followingText) {
            blocks.push({
              _type: 'block', _key: Math.random().toString(36).slice(2, 11),
              style: 'normal',
              children: [{ _type: 'span', text: followingText, marks: [] }]
            });
          }
          return blocks;
        }
        return [{
          _type: 'block', _key: Math.random().toString(36).slice(2, 11),
          style: 'normal',
          children: [{ _type: 'span', text: trimmed, marks: [] }]
        }];
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
