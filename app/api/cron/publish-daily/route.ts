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
  try {
    const allPosts: any[] = await sanityClient.fetch(`*[_type == "post"]{ title, "slug": slug.current }`);
    const existingSlugs = new Set(allPosts.map(p => p.slug));
    let maxNumber = 0;
    allPosts.forEach(p => {
      const m = p.title.match(/^(\d+)\./);
      if (m) maxNumber = Math.max(maxNumber, parseInt(m[1]));
    });
    const nextNumber = maxNumber + 1;

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    let selected: any = null;
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      if (title && !Array.from(existingSlugs).some(s => s.includes(slugify(title).substring(0, 15)))) {
        selected = { title, abstract };
        break;
      }
    }

    if (!selected) return NextResponse.json({ message: 'No new articles' });

    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const prompt = `Write a TECHNICAL science article (2000 words) about: ${selected.title}. 
Context: ${selected.abstract}

FORMATTING RULES (STRICT):
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full 2000-word article here. Use ## for headings. No bolding. [/BODY]

DO NOT INCLUDE ANY OTHER TEXT.`;

    const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8192 } })
    });
    const gData = await gRes.json();
    const raw = gData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    const blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim() || selected.title;
    const blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();

    if (!blogBody || blogBody.length < 500) {
      throw new Error(`Gemini failed content check. Model used: gemini-pro-latest`);
    }

    const imgPrompt = `A high-end, futuristic 3D product render of ${blogTitle}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. No text.`;
    let assetId = '';
    const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiKey}`;
    const iRes = await fetch(imagenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt: imgPrompt }], parameters: { sampleCount: 1, aspectRatio: '16:9' } })
    });
    if (iRes.ok) {
      const iData = await iRes.json();
      const b64 = iData.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
        assetId = asset._id;
      }
    }

    const finalTitle = `${nextNumber}. ${blogTitle}`;
    const finalSlug = slugify(finalTitle);

    const created = await sanityClient.create({
      _type: 'post',
      title: finalTitle,
      slug: { _type: 'slug', current: finalSlug },
      excerpt: blogBody.substring(0, 160).replace(/\n/g, ' ') + '...',
      body: blogBody.split('\n\n').filter(p => p.trim() !== '').map(p => {
        let style = 'normal';
        let text = p.trim();
        if (text.startsWith('### ')) {
          style = 'h3';
          text = text.replace(/^###\s+/, '');
        } else if (text.startsWith('## ')) {
          style = 'h2';
          text = text.replace(/^##\s+/, '');
        } else if (text.startsWith('# ')) {
          style = 'h2';
          text = text.replace(/^#\s+/, '');
        }
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

    return NextResponse.json({ success: true, id: created._id, url: `https://usa-graphene.com/blog/${finalSlug}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
