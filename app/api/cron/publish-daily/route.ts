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
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Duplicate detection via ArXiv ID
    const existingArxivIds: string[] = await sanityClient.fetch(`*[_type == "post" && defined(arxivId)].arxivId`);
    const arxivIdSet = new Set(existingArxivIds);

    // 2. Fetch from ArXiv with Retry & Smart User-Agent
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene+OR+abs:graphene&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;
    
    let arxivXml = '';
    let retries = 5;
    while (retries > 0) {
      const res = await fetch(arxivUrl, {
        headers: { 'User-Agent': `USA-Graphene-Bot/${Math.random().toString(36).substring(7)} (info@usa-graphene.com)` }
      });
      const text = await res.text();
      if (text.includes('<entry>')) {
        arxivXml = text;
        break;
      }
      console.warn(`[Cron] ArXiv rate limited or empty. Retrying in ${6 - retries}s...`);
      await new Promise(r => setTimeout(r, (6 - retries) * 1000));
      retries--;
    }

    if (!arxivXml) throw new Error("ArXiv API failed to return entries after retries (likely rate limited)");
    
    const parser = new XMLParser({ ignoreAttributes: false, htmlEntities: true });
    const parsed = parser.parse(arxivXml);
    const entries = Array.isArray(parsed.feed?.entry) ? parsed.feed.entry : (parsed.feed?.entry ? [parsed.feed.entry] : []);

    let selectedList: any[] = [];
    for (const entry of entries) {
      if (selectedList.length >= limit) break;
      const arxivId = entry.id?.split('/abs/')?.[1] || entry.id;
      if (arxivId && !arxivIdSet.has(arxivId)) {
        selectedList.push({
          arxivId,
          title: entry.title?.replace(/\n/g, ' ').trim(),
          abstract: entry.summary?.replace(/\n/g, ' ').trim(),
          authors: (Array.isArray(entry.author) ? entry.author : [entry.author]).map((a: any) => a.name).join(', ')
        });
      }
    }

    console.log(`[Cron] Found ${selectedList.length} new papers.`);

    // 3. Process each paper
    const results = [];
    for (const paper of selectedList) {
      try {
        const prompt = `You are an expert science journalist for usa-graphene.com.
Write a technical, 1200+ word article based on this research:
Title: ${paper.title}
Authors: ${paper.authors}
Abstract: ${paper.abstract}

RULES:
- Length: 1200+ words.
- Credit authors in paragraph 1.
- No bullet points. No bold text (**).
- Include FAQ at the end.
- Use ## H2 headings.
- JSON structure ONLY: { "title": "SEO Title", "excerpt": "Description", "body": "Full text with ## headings", "imagePrompt": "Detailed scientific visual prompt" }`;

        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.75, response_mime_type: "application/json" }
          })
        });

        if (!gRes.ok) throw new Error(`Gemini Text API error: ${gRes.status}`);
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Gemini returned empty response');
        
        let p;
        try {
          p = JSON.parse(rawText.replace(/```json\n?/, '').replace(/\n?```/, '').trim());
        } catch (jsonErr) {
          const extract = (field: string) => {
            const re = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"(?=[\\s,}]|$)`);
            const match = rawText.match(re);
            return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : '';
          };
          p = { title: extract('title'), excerpt: extract('excerpt'), body: extract('body'), imagePrompt: extract('imagePrompt') };
        }

        if (!p.title || !p.body) throw new Error('Could not extract title or body');

        // Numbering
        const allPosts: any[] = await sanityClient.fetch(`*[_type == "post"]{ title }`);
        let maxNum = 0;
        allPosts.forEach(post => {
          const m = post.title.match(/^(\d+)\./);
          if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
        });
        const finalTitle = `${maxNum + 1}. ${p.title}`;
        const finalSlug = slugify(finalTitle);

        // Image
        let assetId = '';
        try {
          const imgPrompt = `A high-end, futuristic 3D scientific visualization of ${p.title}. No text, 16:9 aspect ratio, cinematic lighting, 8k resolution.`;
          const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: imgPrompt }] }] })
          });

          if (iRes.ok) {
            const iData = await iRes.json();
            const b64 = iData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
            if (b64 && !dryRun) {
              const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: `arxiv-${paper.arxivId}.png` });
              assetId = asset._id;
            }
          } 
          if (!assetId) {
            const pRes = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(p.imagePrompt || p.title)}?width=1280&height=720&nologo=true`);
            if (pRes.ok && !dryRun) {
              const buffer = Buffer.from(await pRes.arrayBuffer());
              const asset = await sanityClient.assets.upload('image', buffer, { filename: `fallback-${paper.arxivId}.jpg` });
              assetId = asset._id;
            }
          }
        } catch (imgErr) { console.warn(`[Cron] Image failed: ${imgErr}`); }

        if (!dryRun) {
          await sanityClient.create({
            _type: 'post',
            arxivId: paper.arxivId,
            title: finalTitle,
            seoTitle: p.title,
            seoDescription: p.excerpt,
            slug: { _type: 'slug', current: finalSlug },
            excerpt: p.excerpt,
            body: p.body.split(/\n{2,}/).map((para: string) => ({
              _type: 'block', _key: crypto.randomUUID(),
              style: para.startsWith('## ') ? 'h2' : 'normal',
              children: [{ _type: 'span', _key: crypto.randomUUID(), text: para.replace(/^##\s+/, '').replace(/\*\*/g, ''), marks: [] }]
            })),
            publishedAt: new Date().toISOString(),
            mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
            categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju' }],
            author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
          });
          results.push({ arxivId: paper.arxivId, status: 'published', title: finalTitle });
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
