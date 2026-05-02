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

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    let selectedList: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null && selectedList.length < 3) {
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

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) throw new Error('OPENAI_API_KEY is not configured in Vercel');

    const results = [];

    for (const selected of selectedList) {
      const prompt = `Write a TECHNICAL science article (2000 words) about: ${selected.title}. 
Context: ${selected.abstract}

FORMATTING RULES (STRICT):
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full 2000-word article here. Use ## for headings. No bolding. [/BODY]

IMPORTANT: Focus heavily on the Graphene aspect of the technology, its properties, and its industrial or scientific implications.

DO NOT INCLUDE ANY OTHER TEXT.`;

      // Use OpenAI GPT-4o since OPENAI_API_KEY is available
      const oRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({ 
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });

      if (!oRes.ok) {
        const errText = await oRes.text();
        throw new Error(`OpenAI API error (${oRes.status}): ${errText.substring(0, 200)}`);
      }

      const oData = await oRes.json();
      const raw = oData.choices?.[0]?.message?.content ?? '';
      
      let blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim();
      if (!blogTitle) {
        blogTitle = raw.match(/\[TITLE\]([\s\S]*)$/)?.[1]?.trim() || selected.title;
      }

      let blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();
      if (!blogBody) {
        blogBody = raw.match(/\[BODY\]([\s\S]*)$/)?.[1]?.trim();
      }

      if (!blogBody || blogBody.length < 500) {
        throw new Error(`OpenAI failed content check. Response length: ${raw.length}.`);
      }

      const imgPrompt = `A hyper-realistic, professional 3D scientific visualization of ${blogTitle}. Featuring elegant molecular structures and futuristic industrial applications of graphene. Cinematic lighting with deep shadows and glowing highlights, metallic and carbon textures, 8k resolution, masterfully composed, clean and premium aesthetic. Absolutely no text, no labels, no watermarks.`;
      let assetId = '';
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      
      if (geminiKey) {
        try {
          const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`;
          const iRes = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: [{ parts: [{ text: imgPrompt }] }]
            })
          });
          if (iRes.ok) {
            const iData = await iRes.json();
            const parts = iData.candidates?.[0]?.content?.parts || [];
            let b64 = '';
            for (const p of parts) {
              if (p.inlineData && p.inlineData.data) {
                b64 = p.inlineData.data;
                break;
              }
            }
            if (b64) {
              const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover.png' });
              assetId = asset._id;
            } else {
              console.warn(`Nano Banana Pro 2 returned no image data`);
            }
          } else {
            console.warn(`Nano Banana Pro 2 failed with status ${iRes.status}`);
          }
        } catch (iErr) {
          console.warn(`Nano Banana Pro 2 generation error: ${iErr}`);
        }
      } else {
        console.warn('Skipping Nano Banana Pro 2: GEMINI_API_KEY or GOOGLE_AI_API_KEY not found in Vercel');
      }

      const finalTitle = `${nextNumber}. ${blogTitle}`;
      const finalSlug = slugify(finalTitle);

      const created = await sanityClient.create({
        _type: 'post',
        title: finalTitle,
        seoTitle: finalTitle,
        seoDescription: blogBody.substring(0, 160).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...',
        slug: { _type: 'slug', current: finalSlug },
        excerpt: blogBody.substring(0, 200).replace(/\n/g, ' ').replace(/#+\s*/g, '').trim() + '...',
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
