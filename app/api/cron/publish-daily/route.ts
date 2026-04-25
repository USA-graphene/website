import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ── EST timestamp helper ──────────────────────────────────────────────────────
// Returns current time as ISO-8601 with America/New_York offset (-05:00 or -04:00).
function nowEST(): string {
  const now = new Date();
  const tzAbbr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? 'EDT';
  const offsetHours = tzAbbr === 'EST' ? -5 : -4; // EST winter / EDT summer
  const sign = offsetHours < 0 ? '-' : '+';
  const absH = Math.abs(offsetHours);
  const adjusted = new Date(now.getTime() + offsetHours * 3_600_000);
  return adjusted.toISOString().slice(0, 19) + `${sign}${String(absH).padStart(2, '0')}:00`;
}

// ── ArXiv helper ──────────────────────────────────────────────────────────────
async function fetchArxivPapers(start = 0, maxResults = 30) {
  const url = `http://export.arxiv.org/api/query?search_query=all:graphene&start=${start}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ArXiv API returned ${res.status}`);
  const xml = await res.text();

  const papers: { title: string; abstract: string }[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const titleMatch  = entry.match(/<title>([\s\S]*?)<\/title>/);
    const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
    if (titleMatch && summaryMatch) {
      papers.push({
        title:    titleMatch[1].replace(/\n/g, ' ').trim(),
        abstract: summaryMatch[1].replace(/\n/g, ' ').trim(),
      });
    }
  }
  return papers;
}

// ── Slug normaliser (mirrors the cron's slug builder) ─────────────────────────
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    console.log('CRON START: publish-daily', nowEST());

    // 1. Auth
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch ALL existing slugs from Sanity for reliable dedup
    console.log('Fetching all existing slugs from Sanity...');
    const allPosts: { title: string; slug: string }[] = await sanityClient.fetch(
      `*[_type == "post"] | order(publishedAt asc) { title, "slug": slug.current }`
    );

    // Build slug set and find max post number
    const existingSlugs = new Set(allPosts.map(p => p.slug));
    let maxNumber = 0;
    for (const p of allPosts) {
      const m = p.title.match(/^(\d+)\./);
      if (m) {
        const n = parseInt(m[1]);
        if (n > maxNumber) maxNumber = n;
      }
    }
    const nextNumber = maxNumber + 1;
    console.log(`Total posts: ${allPosts.length} | Next number: ${nextNumber}`);

    // 3. Try to find an unpublished ArXiv paper (check page 0 then page 1 if needed)
    let selectedPaper: { title: string; abstract: string } | null = null;

    for (const startOffset of [0, 10, 20]) {
      console.log(`Fetching ArXiv papers (start=${startOffset})...`);
      const papers = await fetchArxivPapers(startOffset, 15);

      for (const paper of papers) {
        if (paper.abstract.length < 200) continue;

        // Dedup: check if a slug derived from this paper title already exists
        const candidateSlug = slugify(`${nextNumber}. ${paper.title}`);
        const bareSlug      = slugify(paper.title);

        // Also check if any existing slug CONTAINS the first 5 meaningful words
        const words = paper.title.toLowerCase().split(/\s+/).slice(0, 5).join('-');
        const alreadyCovered = existingSlugs.has(candidateSlug)
          || existingSlugs.has(bareSlug)
          || Array.from(existingSlugs).some(s => s.includes(words));

        if (!alreadyCovered) {
          selectedPaper = paper;
          break;
        }
      }
      if (selectedPaper) break;
    }

    if (!selectedPaper) {
      console.log('No new ArXiv papers found after checking 45 results.');
      return NextResponse.json({ message: 'No new ArXiv papers to publish right now.' });
    }

    console.log(`Selected: ${selectedPaper.title}`);

    // 4. Generate post with Gemini 2.5 Flash
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('Missing GEMINI_API_KEY');

    const prompt = `You are a senior science journalist for usa-graphene.com.
Write a deeply detailed, 2000+ word SEO blog post based on this academic paper:
Paper Title: ${selectedPaper.title}
Paper Abstract: ${selectedPaper.abstract}

WRITING RULES:
1. Length: MINIMUM 2000 words. 15-20 paragraphs total.
2. Structure:
   - Introduction (300 words)
   - 10 detailed sections with ## H2 headings (200 words each)
   - FAQ (5 Q&A, detailed answers)
   - Conclusion (200 words)
3. Tone: expert, technical, highly descriptive. Explain physics, methodology, and market impact.
4. NO AI clichés: 'In conclusion', 'Furthermore', 'Moreover', 'Delve into', 'Revolutionize', 'Game-changer'.
5. NO markdown bold or italic. Plain text only.
6. H2 and H3 headings only.

Output ONLY a raw JSON object (no code fences):
{
  "title": "A catchy, click-worthy title",
  "seoTitle": "Concise SEO title (max 60 chars)",
  "seoDescription": "Compelling meta description (max 155 chars)",
  "excerpt": "1-2 sentence summary",
  "content": "Full blog post (2000+ words). Use ## for H2, ### for H3. No bolding."
}`;

    console.log('Calling Gemini 2.5 Flash...');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
        }),
      }
    );
    if (!geminiRes.ok) throw new Error(`Gemini error: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    let text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Strip code fences if present
    text = text.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
    const blogData = JSON.parse(text);
    if (!blogData.title || !blogData.content) throw new Error('Gemini: missing title/content');

    const finalTitle = `${nextNumber}. ${blogData.title}`;
    const finalSlug  = slugify(finalTitle);
    console.log(`Title: ${finalTitle} | Words: ${blogData.content.split(/\s+/).length}`);

    // 5. Convert markdown to Portable Text blocks
    const blocks = blogData.content
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return { _type: 'block', _key: Math.random().toString(36).slice(2, 11), style: 'h3',
            children: [{ _type: 'span', text: trimmed.slice(4), marks: [] }] };
        } else if (trimmed.startsWith('## ')) {
          return { _type: 'block', _key: Math.random().toString(36).slice(2, 11), style: 'h2',
            children: [{ _type: 'span', text: trimmed.slice(3), marks: [] }] };
        } else {
          return { _type: 'block', _key: Math.random().toString(36).slice(2, 11), style: 'normal',
            children: [{ _type: 'span', text: trimmed, marks: [] }] };
        }
      });

    // 6. Generate cover image — hardcoded studio-render prompt (consistent style)
    const imgPrompt = `A high-end, futuristic 3D product render of ${blogData.title}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks.`;

    let imageAssetId: string | null = null;
    try {
      console.log('Generating image via Imagen 4...');
      const imagenRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: imgPrompt }],
            parameters: { sampleCount: 1, aspectRatio: '16:9' },
          }),
        }
      );

      let imgBuffer: Buffer | null = null;
      let mimeType = 'image/png';

      if (imagenRes.ok) {
        const imagenData: any = await imagenRes.json();
        const b64 = imagenData.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          imgBuffer = Buffer.from(b64, 'base64');
          console.log('Imagen 4 success, size:', imgBuffer.length);
        }
      }

      // Pollinations fallback
      if (!imgBuffer) {
        console.log('Imagen 4 failed — falling back to Pollinations...');
        const safePrompt = encodeURIComponent(imgPrompt.substring(0, 400));
        const seed = Math.floor(Math.random() * 1_000_000);
        const pollUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&width=1408&height=800&model=flux-realism&seed=${seed}&enhance=true`;
        const pollRes = await fetch(pollUrl);
        if (pollRes.ok) {
          imgBuffer = Buffer.from(await pollRes.arrayBuffer());
          mimeType  = 'image/jpeg';
          console.log('Pollinations success');
        }
      }

      if (imgBuffer) {
        const asset = await sanityClient.assets.upload('image', imgBuffer, {
          filename: `${finalSlug}.${mimeType === 'image/png' ? 'png' : 'jpg'}`,
          contentType: mimeType,
        });
        imageAssetId = asset._id;
        console.log('Image uploaded:', imageAssetId);
      }
    } catch (imgErr: any) {
      console.warn('Image pipeline failed:', imgErr.message);
    }

    // 7. Publish to Sanity — publishedAt stored in EST
    const newPost: any = {
      _type:          'post',
      title:          finalTitle,
      slug:           { _type: 'slug', current: finalSlug },
      seoTitle:       blogData.seoTitle,
      seoDescription: blogData.seoDescription,
      excerpt:        blogData.excerpt,
      body:           blocks,
      publishedAt:    nowEST(),   // ← EST timestamp
      categories:     [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
      author:         { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
    };
    if (imageAssetId) {
      newPost.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } };
    }

    const created = await sanityClient.create(newPost);
    console.log('Published:', created._id, nowEST());

    return NextResponse.json({
      success:       true,
      message:       'Daily post published!',
      title:         finalTitle,
      url:           `https://usa-graphene.com/blog/${finalSlug}`,
      publishedAt:   newPost.publishedAt,
      sourceArxiv:   selectedPaper.title,
    });

  } catch (err: any) {
    console.error('CRON FATAL:', err);
    return NextResponse.json({ error: err.message, hint: 'Check env vars and API access' }, { status: 500 });
  }
}
