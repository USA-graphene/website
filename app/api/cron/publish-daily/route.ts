import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function nowEST(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}-04:00`;
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dryRun = searchParams.get('dryrun') === 'true';
  const limit = parseInt(searchParams.get('limit') || '3');
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  console.log(`[Cron] Starting Gemini-Powered Job. DryRun: ${dryRun}, Limit: ${limit}`);

  try {
    if (!geminiKey) throw new Error('GOOGLE_AI_API_KEY is missing');

    console.log(`[Cron] Fetching existing posts from Sanity...`);
    const allPosts: any[] = await sanityClient.fetch(`*[_type == "post"]{ title, "slug": slug.current }`);
    const existingSlugs = new Set(allPosts.map(p => p.slug));
    let maxNumber = 0;
    allPosts.forEach(p => {
      const m = p.title.match(/^(\d+)\./);
      if (m) maxNumber = Math.max(maxNumber, parseInt(m[1]));
    });

    console.log(`[Cron] Fetching latest papers from ArXiv...`);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    let selectedList: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null && selectedList.length < limit) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      
      if (title) {
        const arxivWords = slugify(title).split('-').filter(w => w.length > 3).slice(0, 2);
        const isDuplicate = Array.from(existingSlugs).some(s => {
          if (!s) return false;
          return arxivWords.every(w => (s as string).includes(w));
        });

        if (!isDuplicate) {
          selectedList.push({ title, abstract });
          existingSlugs.add(slugify(title));
        }
      }
    }
    console.log(`[Cron] Selected ${selectedList.length} new papers.`);

    const results = [];

    for (const selected of selectedList) {
      console.log(`[Cron] Generating technical article with Gemini 3.1 Pro...`);
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

      if (!gRes.ok) {
        console.error(`[Cron] Gemini Text Error: ${await gRes.text()}`);
        continue;
      }

      const gData = await gRes.json();
      const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let p;
      try {
        p = JSON.parse(rawText);
      } catch (e) {
        console.error(`[Cron] JSON Parse failed`);
        continue;
      }

      if (p.body.length < 1000) {
        console.warn(`[Cron] Article too short. Skipping.`);
        continue;
      }

      console.log(`[Cron] Text generated (${p.body.length} chars). Generating Nano Banana Image...`);

      let assetId = '';
      try {
        const iRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: p.imagePrompt }] }]
          })
        });
        
        if (iRes.ok) {
          const iData = await iRes.json();
          const b64 = iData.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
          if (b64 && !dryRun) {
            const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
            assetId = asset._id;
          }
        }
      } catch (iErr) { console.warn(`[Cron] Image error: ${iErr}`); }

      const nextNum = maxNumber + 1;
      maxNumber++;
      const finalTitle = `${nextNum}. ${p.title}`;
      const finalSlug = slugify(finalTitle);

      if (!dryRun) {
        console.log(`[Cron] Publishing: ${finalTitle}`);
        const created = await sanityClient.create({
          _type: 'post',
          title: finalTitle,
          slug: { _type: 'slug', current: finalSlug },
          excerpt: p.excerpt,
          body: p.body.split('\n\n').filter((para: string) => para.trim() !== '').map((para: string) => {
            let style = 'normal';
            let text = para.trim();

            // Clean AI markings like "1. **Topic:**" or "**Topic:**"
            text = text.replace(/^\d+\.\s*\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
            text = text.replace(/^\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
            text = text.replace(/\*\*/g, '');

            if (text.startsWith('### ')) { style = 'h3'; text = text.replace(/^###\s+/, ''); }
            else if (text.startsWith('## ')) { style = 'h2'; text = text.replace(/^##\s+/, ''); }
            return {
              _type: 'block', _key: Math.random().toString(36).slice(2, 11),
              style: style,
              children: [{ _type: 'span', text: text, marks: [] }]
            };
          }),
          publishedAt: nowEST(),
          mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
          categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
          author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
        });
        results.push({ id: created._id, title: finalTitle, url: `https://usa-graphene.com/blog/${finalSlug}` });
      } else {
        results.push({ id: 'dry-run', title: finalTitle });
      }
    }

    return NextResponse.json({ success: true, count: results.length, posts: results });
  } catch (err: any) {
    console.error(`[Cron] Fatal: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
