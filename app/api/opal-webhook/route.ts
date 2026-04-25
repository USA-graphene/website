import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Initialize Sanity Client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    // 1. Security Check (Loose coupling with an API key)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.OPAL_SECRET_KEY || 'dev-secret-key'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Opal Payload
    const body = await req.json();
    const { title, content, seoTitle, seoDescription, imagePrompt } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    // 3. Image Generation (using the Pollinations fallback logic for speed/reliability)
    // Opal can pass a specific prompt, or we use a fallback.
    const prompt = imagePrompt || `A high-end, futuristic 3D product render of ${title}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed.`;
    const safePrompt = encodeURIComponent(prompt.substring(0, 400));
    const seed = Math.floor(Math.random() * 1000000);
    const imgUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&width=1408&height=800&model=flux-realism&seed=${seed}&enhance=true`;

    // Fetch the image from Pollinations to upload to Sanity
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) throw new Error('Failed to generate image');
    const imgBuffer = await imgRes.arrayBuffer();

    // 4. Upload Image to Sanity
    const imageAsset = await client.assets.upload('image', Buffer.from(imgBuffer), {
      filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`,
    });

    // 5. Create the Sanity Document
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newPost = {
      _type: 'post',
      title: title,
      slug: { _type: 'slug', current: slug },
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || `${title} - Published via Opal`,
      body: content, // Assuming Opal formats it as a markdown string or simple text block
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      publishedAt: new Date().toISOString(),
      // Adding it to the Science Category by default
      categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju' }],
      author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' }
    };

    const createdPost = await client.create(newPost);

    return NextResponse.json({
      success: true,
      message: 'Post successfully created from Opal!',
      url: `https://usa-graphene.com/blog/${slug}`,
      id: createdPost._id
    });

  } catch (error: any) {
    console.error('Opal Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
