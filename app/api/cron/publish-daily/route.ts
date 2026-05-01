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
    let nextNumber = maxNumber + 1;

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    let selectedList: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null && selectedList.length < 3) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      if (title && !Array.from(existingSlugs).some(s => s.includes(slugify(title).substring(0, 15)))) {
        selectedList.push({ title, abstract });
        existingSlugs.add(slugify(title).substring(0, 15));
      }
    }

    if (selectedList.length === 0) return NextResponse.json({ message: 'No new articles' });

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const results = [];

    for (const selected of selectedList) {
      const prompt = `Write a TECHNICAL science article (2000 words) about: ${selected.title}. 
Context: ${selected.abstract}

FORMATTING RULES (STRICT):
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full 2000-word article here. Use ## for headings. No bolding. [/BODY]

DO NOT INCLUDE ANY OTHER TEXT.`;

    // Use gemini-3.1-pro-preview as it is confirmed working in other scripts
    const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }], 
        generationConfig: { 
          temperature: 0.8,
          maxOutputTokens: 8192 
        } 
      })
    });

    if (!gRes.ok) {
      const errText = await gRes.text();
      throw new Error(`Gemini API error (${gRes.status}): ${errText.substring(0, 200)}`);
    }

    const gData = await gRes.json();
    const raw = gData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    // Improved regex that is more resilient to formatting issues or missing closing tags
    let blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim();
    if (!blogTitle) {
      blogTitle = raw.match(/\[TITLE\]([\s\S]*)$/)?.[1]?.trim() || selected.title;
    }

    let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
    if (!blogBody) {
      // Fallback: take everything after [BODY] if the closing tag is missing
      blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
    }

    if (!blogBody || blogBody.length < 500) {
      throw new Error(`Gemini failed content check. Response length: ${raw.length}. Model: gemini-3.1-pro-preview`);
    }

    const imgPrompt = `A high-end, futuristic 3D product render of ${blogTitle}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks.`;
    let assetId = '';
    const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiKey}`;
    try {
      const iRes = await fetch(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instances: [{ prompt: imgPrompt }], 
          parameters: { sampleCount: 1, aspectRatio: '16:9' } 
        })
      });
      if (iRes.ok) {
        const iData = await iRes.json();
        const b64 = iData.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
          assetId = asset._id;
        }
      } else {
        console.warn(`Imagen failed with status ${iRes.status}`);
      }
    } catch (iErr) {
      console.warn(`Imagen generation error: ${iErr}`);
    }

      const finalTitle = `${nextNumber}. ${blogTitle}`;
      const finalSlug = slugify(finalTitle);

      const created = await sanityClient.create({
        _type: 'post',
        title: finalTitle,
        slug: { _type: 'slug', current: finalSlug },
        excerpt: blogBody.substring(0, 200).replace(/\n/g, ' ') + '...',
        body: blogBody.split('\n\n').filter((p: string) => p.trim() !== '').map((p: string) => {
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

      results.push({
        id: created._id,
        title: finalTitle,
        url: `https://usa-graphene.com/blog/${finalSlug}`
      });
      
      nextNumber++;
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      posts: results
    });
  } catch (err: any) {
    console.error(`Cron Job Failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
