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
  
  const rawLimit = Number(searchParams.get('limit') || 3);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 10) : 3;

  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const sanityToken = process.env.SANITY_API_TOKEN;

  console.log(`[Cron] Starting Production-Grade Job. DryRun: ${dryRun}, Limit: ${limit}`);

  try {
    const authHeader = req.headers.get('Authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    const isAuthorized = dryRun || 
                        xCronHeader === cronSecret || 
                        authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
       console.warn('[Cron] Unauthorized access attempt blocked.');
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!geminiKey || !sanityToken) {
      throw new Error('Critical Environment Variables missing (GEMINI_API_KEY or SANITY_API_TOKEN)');
    }

    // Duplicate detection
    console.log(`[Cron] Checking Sanity for existing ArXiv IDs...`);
    const existingArxivIds: string[] = await sanityClient.fetch(`*[_type == "post" && defined(arxivId)].arxivId`);
    const arxivIdSet = new Set(existingArxivIds);

    // ArXiv fetch with retry
    console.log(`[Cron] Fetching latest papers from ArXiv...`);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`;
    
    let arxivRes;
    let retries = 3;
    while (retries > 0) {
      arxivRes = await fetch(arxivUrl, {
        headers: { 'User-Agent': 'USA-Graphene-Automation/1.1 (https://usa-graphene.com)' }
      });
      if (arxivRes.ok) break;
      if (arxivRes.status === 403 || arxivRes.status === 429) {
        console.warn(`[Cron] ArXiv rate limited. Retrying in 5s... (${retries} left)`);
        await new Promise(r => setTimeout(r, 5000));
        retries--;
      } else {
        throw new Error(`ArXiv API failed: ${arxivRes.status}`);
      }
    }

    if (!arxivRes || !arxivRes.ok) throw new Error(`ArXiv API failed after retries`);

    const arxivXml = await arxivRes.text();
    const parser = new XMLParser({ ignoreAttributes: false, htmlEntities: true });
    const parsed = parser.parse(arxivXml);
    const entries = Array.isArray(parsed.feed?.entry) ? parsed.feed.entry : (parsed.feed?.entry ? [parsed.feed.entry] : []);

    let selectedList: any[] = [];
    for (const entry of entries) {
      if (selectedList.length >= limit) break;

      const arxivId = entry.id?.split('/abs/')?.[1] || entry.id;
      const title = entry.title?.replace(/\n/g, ' ').trim();
      const abstract = entry.summary?.replace(/\n/g, ' ').trim();
      
      const authorList = Array.isArray(entry.author) ? entry.author : (entry.author ? [entry.author] : []);
      const authors = authorList.map((a: any) => a.name).join(', ');

      if (arxivId && !arxivIdSet.has(arxivId)) {
        selectedList.push({ arxivId, title, abstract, authors });
        arxivIdSet.add(arxivId);
      }
    }

    console.log(`[Cron] Found ${selectedList.length} new papers to process.`);
    
    // Process papers in parallel (Vercel has high timeout on Pro)
    const finalResults = await Promise.all(selectedList.map(async (selected, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 2000)); // Stagger
        
        console.log(`[Cron] Processing (${index + 1}/${selectedList.length}): ${selected.arxivId}`);
        
        const prompt = `You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 1200+ word technical research brief based on this paper.
Title: """${selected.title}"""
Authors: """${selected.authors}"""
Abstract: """${selected.abstract}"""

RULES:
1. Length: 1200+ words.
2. Credit authors in first paragraph.
3. Use ## H2 headings.
4. Tone: Expert, no bolding, no bullet points.
5. Return JSON: { "title": "...", "excerpt": "...", "body": "...", "imagePrompt": "..." }`;

        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, response_mime_type: "application/json" }
          })
        });

        if (!gRes.ok) throw new Error(`Gemini Error: ${gRes.status}`);
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Gemini returned empty response');
        
        const p = JSON.parse(rawText);

        // Atomic Numbering
        const allPosts: any[] = await sanityClient.fetch(`*[_type == "post"]{ title }`);
        let maxNum = 0;
        allPosts.forEach(post => {
          const m = post.title.match(/^(\d+)\./);
          if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
        });
        const finalTitle = `${maxNum + 1}. ${p.title}`;
        const finalSlug = slugify(finalTitle);

        // Image via Pollinations (Primary)
        let assetId = '';
        try {
          const imgPrompt = `A high-end 3D scientific visualization of ${p.title}. No text, 16:9 aspect ratio, cinematic lighting.`;
          const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}?nologo=true&width=1280&height=720&model=flux-realism`;
          const imgRes = await fetch(imgUrl);
          if (imgRes.ok && !dryRun) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const asset = await sanityClient.assets.upload('image', buffer, { filename: `arxiv-${selected.arxivId}.jpg` });
            assetId = asset._id;
          }
        } catch (iErr) { console.warn(`[Cron] Image failed: ${iErr}`); }

        if (!dryRun) {
          await sanityClient.create({
            _type: 'post',
            arxivId: selected.arxivId,
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
            categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
            author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
          });
          return { arxivId: selected.arxivId, title: finalTitle, status: 'published' };
        }
        return { arxivId: selected.arxivId, title: finalTitle, status: 'dry-run' };
      } catch (err: any) {
        console.error(`[Cron] Failed ${selected.arxivId}: ${err.message}`);
        return { arxivId: selected.arxivId, error: err.message, status: 'failed' };
      }
    }));

    return NextResponse.json({ success: true, results: finalResults });
  } catch (err: any) {
    console.error(`[Cron] FATAL: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
