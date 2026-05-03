import { createClient } from '@sanity/client';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fixPost357() {
  const query = '*[_type == "post" && title match "357*"][0]{_id, title, body}';
  const post = await sanity.fetch(query);
  
  if (!post) {
    console.log("Post 357 not found.");
    return;
  }

  let bodyChanged = false;
  const newBody = post.body.map((block: any) => {
    if (block._type === 'block' && block.children && block.children.length > 0) {
      const text = block.children[0].text;
      if (text.startsWith('### ')) {
        bodyChanged = true;
        // Make it an h3 or h2. Let's make it h3.
        return {
          ...block,
          style: 'h3',
          children: [
            {
              ...block.children[0],
              text: text.replace(/^### /, '')
            }
          ]
        };
      } else if (text.startsWith('## ')) {
         bodyChanged = true;
         return {
          ...block,
          style: 'h2',
          children: [
            {
              ...block.children[0],
              text: text.replace(/^## /, '')
            }
          ]
        };
      }
    }
    return block;
  });

  if (bodyChanged) {
    console.log("Updating body for post:", post._id);
    await sanity.patch(post._id).set({ body: newBody }).commit();
    console.log("Body updated.");
  } else {
    console.log("No ### headings found in body.");
  }

  // Now fix image
  console.log('Generating premium image using Imagen 4.0...');
  const title = post.title.replace('357. ', '');
  const imgPrompt = `A high-end, futuristic 3D product render of ${title}. Set in a sterile, modern research facility. Soft studio lighting, glossy reflections, clean geometry, 8k resolution, highly detailed. No text.`;
  
  const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`;
  const iRes = await fetch(imagenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt: imgPrompt }], parameters: { sampleCount: 1, aspectRatio: '16:9' } })
  });

  if (iRes.ok) {
    const iData = await iRes.json();
    const b64 = iData.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      console.log('Image generated. Uploading to Sanity...');
      const asset = await sanity.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'cover_357_fixed.png' });
      await sanity.patch(post._id).set({ mainImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit();
      console.log('Image updated for post 357.');
    } else {
      console.log('Imagen returned no bytes.');
    }
  } else {
    console.log('Imagen request failed:', iRes.status, await iRes.text());
  }
}

fixPost357().catch(console.error);
