import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

// 1. Explicit Node.js runtime for Buffer support
export const runtime = 'nodejs';
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Normalize ArXiv ID by removing version (e.g., 2405.00001v1 -> 2405.00001)
// Also safely pass through OpenAlex IDs and DOIs.
function normalizeArxivId(id: string) {
  if (!id) return '';
  if (id.startsWith('openalex:') || id.startsWith('10.')) {
    return id.trim().toLowerCase();
  }
  return id.split('v')[0].trim();
}

// Helper to reconstruct abstract from OpenAlex inverted index
function reconstructAbstract(invertedIndex: any): string {
  if (!invertedIndex) return '';
  try {
    const wordEntries = Object.entries(invertedIndex);
    let maxPos = 0;
    for (const [word, positions] of wordEntries) {
      for (const pos of positions as number[]) {
        if (pos > maxPos) maxPos = pos;
      }
    }
    const words = new Array(maxPos + 1).fill('');
    for (const [word, positions] of wordEntries) {
      for (const pos of positions as number[]) {
        words[pos] = word;
      }
    }
    return words.join(' ').trim();
  } catch (e) {
    return '';
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dryRun = searchParams.get('dryrun') === 'true';
  
  const rawLimit = Number(searchParams.get('limit') || 1);
  const limit = Math.min(Math.max(rawLimit, 1), 5);

  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const cronSecret = process.env.CRON_SECRET;

  console.log(`[Cron] Starting Job. DryRun: ${dryRun}, Limit: ${limit}`);

  try {
    const authHeader = req.headers.get('Authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    const isAuthorized = dryRun || 
                        xCronHeader === cronSecret || 
                        authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
       console.error(`[Cron] Unauthorized access attempt.`);
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Duplicate detection via ArXiv ID
    const existingArxivIds: string[] = await sanityClient.fetch(`*[_type == "post" && defined(arxivId)].arxivId`);
    const arxivIdSet = new Set(existingArxivIds.map(normalizeArxivId));

    // 2. Fetch papers — OpenAlex (Primary, highly robust, no IP bans)
    let selectedList: any[] = []

    try {
      const oaUrl = `https://api.openalex.org/works?search=graphene&sort=publication_date:desc&per-page=30`
      const oaRes = await fetch(oaUrl, {
        headers: { 'User-Agent': 'USA-Graphene-Bot/1.2 (mailto:info@usa-graphene.com)' }
      })

      if (oaRes.ok) {
        const oaData = await oaRes.json()
        const papers = oaData.results || []
        for (const paper of papers) {
          if (selectedList.length >= limit) break
          
          // Use OpenAlex ID as the arxivId to prevent duplicates, fallback to DOI
          const rawId = paper.id?.replace('https://openalex.org/', 'openalex:') || paper.doi?.replace('https://doi.org/', '');
          if (!rawId) continue;
          
          const normalizedId = normalizeArxivId(rawId);
          const abstractText = reconstructAbstract(paper.abstract_inverted_index);
          
          // Only process papers with a substantial abstract
          if (normalizedId && !arxivIdSet.has(normalizedId) && abstractText.length > 200) {
            const authors = (paper.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean).join(', ');
            selectedList.push({
              arxivId: rawId,
              title: paper.title?.trim() || 'Untitled Graphene Research',
              abstract: abstractText,
              authors: authors || 'Graphene Research Team'
            })
          }
        }
        console.log(`[Cron] OpenAlex returned ${selectedList.length} new papers (from ${papers.length} checked)`)
      } else {
        console.warn(`[Cron] OpenAlex failed (${oaRes.status}).`)
      }
    } catch (err) {
      console.warn(`[Cron] OpenAlex error: ${err}`)
    }

    if (selectedList.length === 0) {
      console.log(`[Cron] No new graphene papers found today.`);
      return NextResponse.json({ success: true, results: [], message: 'No new papers found from any source' })
    }

    console.log(`[Cron] Processing ${selectedList.length} new papers.`);

    // 3. Process each paper
    const results = [];
    for (const paper of selectedList) {
      try {
        const prompt = `You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word technical article based on this research:
Title: ${paper.title}
Authors: ${paper.authors}
Abstract: ${paper.abstract}

WRITING RULES:
- Length: Minimum 2000 words.
- **MANDATORY**: Start the article with a dedicated line: "Research conducted by: [Authors]" followed by a brief 1-2 sentence introduction of their contribution.
- No bullet points. No bold text (**).
- Include FAQ at the end (5 detailed Q&As).
- Use ## H2 headings.
- Tone: Professional, expert, scientific.

JSON structure ONLY: 
{ 
  "title": "SEO Title", 
  "excerpt": "Description", 
  "body": "Full text with ## headings", 
  "imagePrompt": "Detailed futuristic scientific visual prompt for this research" 
}`;

        // Using verified 3.1 Pro model
        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.8, 
              maxOutputTokens: 16384, 
              response_mime_type: "application/json" 
            }
          })
        });

        if (!gRes.ok) throw new Error(`Gemini Text API error: ${gRes.status}`);
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Gemini returned empty response (possible safety filter)');
        
        let p;
        try {
          // Robust JSON parsing
          const cleanJson = rawText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
          p = JSON.parse(cleanJson);
        } catch (jsonErr) {
          // Fallback extraction if JSON is malformed
          console.warn(`[Cron] JSON Parse failed, attempting regex extraction.`);
          const extract = (field: string) => {
            const re = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"(?=[\\s,}]|$)`);
            const match = rawText.match(re);
            return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : '';
          };
          p = { title: extract('title'), excerpt: extract('excerpt'), body: extract('body'), imagePrompt: extract('imagePrompt') };
        }

        if (!p.title || !p.body) throw new Error('Could not extract title or body from Gemini response');

        // Numbering
        const allPosts: any[] = await sanityClient.fetch(`*[_type == "post"]{ title }`);
        let maxNum = 0;
        allPosts.forEach(post => {
          const m = post.title.match(/^(\d+)\./);
          if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
        });
        const finalTitle = `${maxNum + 1}. ${p.title}`;
        const finalSlug = slugify(finalTitle);

        // Image Generation
        let assetId = '';
        try {
          // Using verified Nano Banana Pro model
          const imgPrompt = `A high-end, futuristic 3D scientific visualization of ${p.title}. No text, 16:9 aspect ratio, cinematic lighting, 8k resolution, professional studio quality.`;
          const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: imgPrompt }] }] })
          });

          if (iRes.ok) {
            const iData = await iRes.json();
            const b64 = iData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
            if (b64 && !dryRun) {
              const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { 
                filename: `arxiv-${paper.arxivId}.png`,
                contentType: 'image/png'
              });
              assetId = asset._id;
            }
          } 
          
          // Pollinations Fallback
          if (!assetId) {
            console.warn(`[Cron] Gemini Image failed or returned no data, using Pollinations fallback...`);
            const pRes = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(p.imagePrompt || p.title)}?width=1280&height=720&nologo=true`);
            if (pRes.ok && !dryRun) {
              const buffer = Buffer.from(await pRes.arrayBuffer());
              const asset = await sanityClient.assets.upload('image', buffer, { filename: `fallback-${paper.arxivId}.jpg` });
              assetId = asset._id;
            }
          }
        } catch (imgErr) { console.warn(`[Cron] Image generation failed: ${imgErr}`); }

        if (!dryRun) {
          await sanityClient.create({
            _type: 'post',
            arxivId: paper.arxivId,
            title: finalTitle,
            seoTitle: p.title,
            seoDescription: p.excerpt,
            slug: { _type: 'slug', current: finalSlug },
            excerpt: p.excerpt,
            body: p.body.split(/\n{2,}/).filter((para: string) => para.trim() !== '').map((para: string) => ({
              _type: 'block', _key: crypto.randomUUID(),
              style: para.startsWith('## ') ? 'h2' : 'normal',
              children: [{ _type: 'span', _key: crypto.randomUUID(), text: para.replace(/^##\s+/, '').replace(/\*\*/g, ''), marks: [] }]
            })),
            publishedAt: new Date().toISOString(),
            mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
            categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
            author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
          });
          results.push({ arxivId: paper.arxivId, status: 'published', title: finalTitle });
          console.log(`[Cron] Successfully published: ${finalTitle}`);
        } else {
          results.push({ arxivId: paper.arxivId, status: 'dry-run', title: finalTitle });
        }
      } catch (paperErr: any) {
        console.error(`[Cron] Failed paper ${paper.arxivId}: ${paperErr.message}`);
        results.push({ arxivId: paper.arxivId, status: 'failed', error: paperErr.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error(`[Cron] Fatal Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

