import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const maxDuration = 60; // Allow up to 60 seconds for AI generation
export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Secret (Security) - TEMPORARILY DISABLED FOR DEBUGGING
    /*
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */

    console.log("Fetching recent papers from ArXiv...");
    // 2. Fetch recent Graphene papers from ArXiv API (Atom XML format)
    const searchRes = await fetch('http://export.arxiv.org/api/query?search_query=all:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending');
    const xmlText = await searchRes.text();
    
    // 3. Extract papers from XML using Regex (lightweight, no extra dependencies)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const papers = [];
    let match;
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entry = match[1];
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      if (titleMatch && summaryMatch) {
        papers.push({
          title: titleMatch[1].replace(/\n/g, ' ').trim(),
          abstract: summaryMatch[1].replace(/\n/g, ' ').trim(),
        });
      }
    }

    if (papers.length === 0) {
      return NextResponse.json({ error: 'No papers found on ArXiv' }, { status: 404 });
    }

    // 4. Find an unpublished paper
    const existingPosts = await sanityClient.fetch(`*[_type == "post"]{title}`);
    const existingTitles = new Set(existingPosts.map((p: any) => p.title.toLowerCase()));

    let selectedPaper = null;
    for (const paper of papers) {
      if (paper.abstract.length > 200 && !existingTitles.has(paper.title.toLowerCase())) {
        selectedPaper = paper;
        break;
      }
    }

    if (!selectedPaper) {
      return NextResponse.json({ message: 'All recent ArXiv papers are already published.' });
    }

    console.log(`Selected Paper: ${selectedPaper.title}`);

    // 5. Generate Post using Gemini 2.5 Flash
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const prompt = `You are an elite SEO blog writer for USA Graphene.
Analyze the following scientific research paper and write a highly engaging, scientific yet accessible blog post.
Paper Title: ${selectedPaper.title}
Paper Abstract: ${selectedPaper.abstract}

Rules:
1. NEVER use cliché AI phrases like "Delve into", "Tapestry", "Testament", "Crucial", or "In conclusion".
2. Use H2 and H3 headings.
3. Keep paragraphs short and punchy.

Output the result strictly as a raw JSON object (NO markdown code blocks, just raw JSON text) with these keys:
{
  "title": "A catchy, click-worthy title",
  "seoTitle": "A concise SEO title (max 60 chars)",
  "seoDescription": "A compelling meta description (max 155 chars)",
  "content": "The full blog post content formatted with markdown. Use \n\n for paragraphs."
}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });
    const geminiData = await geminiRes.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
       throw new Error(`Gemini API Error: ${JSON.stringify(geminiData)}`);
    }

    let rawJson = geminiData.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting from Gemini
    rawJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const blogData = JSON.parse(rawJson);

    console.log(`Generated Title: ${blogData.title}`);

    // 5. Generate Futuristic Cover Image
    const imgPrompt = `A high-end, futuristic 3D product render of ${blogData.title}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. Absolutely no text, no labels, no watermarks.`;
    const safePrompt = encodeURIComponent(imgPrompt.substring(0, 400));
    const seed = Math.floor(Math.random() * 1000000);
    const imgUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&width=1408&height=800&model=flux-realism&seed=${seed}&enhance=true`;

    const imgFetch = await fetch(imgUrl);
    if (!imgFetch.ok) throw new Error('Image generation failed');
    const imgBuffer = await imgFetch.arrayBuffer();

    // 6. Upload to Sanity
    console.log("Uploading image to Sanity...");
    const imageAsset = await sanityClient.assets.upload('image', Buffer.from(imgBuffer), {
      filename: `${blogData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`,
    });

    const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newPost = {
      _type: 'post',
      title: blogData.title,
      slug: { _type: 'slug', current: slug },
      seoTitle: blogData.seoTitle,
      seoDescription: blogData.seoDescription,
      body: blogData.content,
      mainImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id },
      },
      publishedAt: new Date().toISOString(),
      categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju' }],
      author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' }
    };

    console.log("Creating post in Sanity...");
    const createdPost = await sanityClient.create(newPost);

    return NextResponse.json({
      success: true,
      message: 'Automated Daily Post Published!',
      originalPaper: selectedPaper.title,
      url: `https://usa-graphene.com/blog/${slug}`,
      debug: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
        createdId: createdPost._id
      }
    });

  } catch (error: any) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
