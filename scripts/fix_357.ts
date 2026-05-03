import { createClient } from '@sanity/client';

const sanity = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sk2xXoAc8mZArN3wBhEHt1k06l5HBQNOixYOvYuNwOg20aWlZDfQKVzrKzC2T8vGyJ74zG0Bv0ytYMgAl2Zd30YiXKBge2oKzlIW79rsdB2o0WMBbTFffPN9wOmwc2zyfKMzBmD72Wfpvhz9xxfn7imI7g6oYjGcwubpOOfRsa8k0C8nFii4',
  useCdn: false
});

async function fix357() {
  const title = 'Electronic and Vibrational Properties of On-Surface Synthesized Gulf-Edged Chiral Graphene Nanoribbons';
  const abstract = 'Comprehensive analysis of chiral graphene nanoribbons with gulf-edged geometry synthesized on metal surfaces. Discussion covers electronic band structures, vibrational modes, and potential for nanoelectronic applications.';
  
  const prompt = `Write a TECHNICAL 2000-word science article about: ${title}. 
Context: ${abstract}
FORMATTING RULES:
1. [TITLE] ${title} [/TITLE]
2. [BODY] Full article with ## headings. [/BODY]`;

  console.log('Generating content for 357...');
  const gRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=AIzaSyC5n4GiKdaglnPdHC_G4cC72Z7uxzIifaA', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8192 } })
  });
  
  const data = await gRes.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const blogBody = raw.match(/\[BODY\](.*?)\[\/BODY\]/s)?.[1]?.trim();

  if (!blogBody) throw new Error('Failed to generate body');

  console.log('Generating premium image...');
  const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(title)}?nologo=true&width=1408&height=800&model=flux-realism&seed=357`;
  const imgBuf = Buffer.from(await (await fetch(imgUrl)).arrayBuffer());
  const asset = await sanity.assets.upload('image', imgBuf, { filename: '357.jpg' });

  await sanity.create({
    _type: 'post',
    title: `357. ${title}`,
    slug: { _type: 'slug', current: '357-electronic-and-vibrational-properties-of-on-surface-synthesized-gulf-edged-chiral-graphene-nanoribbons' },
    excerpt: blogBody.substring(0, 160).replace(/\n/g, ' ') + '...',
    body: blogBody.split('\n\n').filter(p => p.trim() !== '').map(p => ({
      _type: 'block', _key: Math.random().toString(36).slice(2, 11),
      style: p.startsWith('## ') ? 'h2' : 'normal',
      children: [{ _type: 'span', text: p.replace(/^## /, ''), marks: [] }]
    })),
    publishedAt: '2026-04-26T01:00:00-04:00',
    mainImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' }
  });
  console.log('SUCCESS: Post 357 restored and fixed.');
}

fix357();
