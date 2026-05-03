const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let sanityToken = '';
let geminiKey = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('SANITY_API_TOKEN=')) sanityToken = line.split('=')[1].trim();
  if (line.startsWith('GEMINI_API_KEY=')) geminiKey = line.split('=')[1].trim();
  if (!geminiKey && line.startsWith('GOOGLE_AI_API_KEY=')) geminiKey = line.split('=')[1].trim();
}

async function run() {
  // Query the last 3 posts (399, 400, 401)
  const query = encodeURIComponent(`*[_type == "post" && title match "399*" || title match "400*" || title match "401*"]{_id, title, excerpt, seoDescription, body, mainImage}`);
  const res = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/query/production?query=${query}`, {
    headers: { Authorization: `Bearer ${sanityToken}` }
  });
  const data = await res.json();
  const posts = data.result;

  for (const post of posts) {
    console.log(`Processing: ${post.title}`);
    const mutations = [];

    // Fix Excerpt
    if (post.excerpt && post.excerpt.includes('#')) {
      mutations.push({ patch: { id: post._id, set: { excerpt: post.excerpt.replace(/#+\s*/g, '') } } });
    }
    
    // Fix SEO Description
    if (post.seoDescription && post.seoDescription.includes('#')) {
      mutations.push({ patch: { id: post._id, set: { seoDescription: post.seoDescription.replace(/#+\s*/g, '') } } });
    }

    // Fix Body Blocks (just in case)
    if (post.body) {
      let bodyChanged = false;
      const newBody = post.body.map(block => {
        if (block._type === 'block' && block.children) {
          block.children.forEach(child => {
            if (child.text && child.text.includes('#')) {
              child.text = child.text.replace(/#+\s*/g, '');
              bodyChanged = true;
            }
          });
        }
        return block;
      });
      if (bodyChanged) {
        mutations.push({ patch: { id: post._id, set: { body: newBody } } });
      }
    }

    // Generate Image if missing
    if (!post.mainImage || !post.mainImage.asset) {
      console.log('Generating image for', post.title);
      const cleanTitle = post.title.replace(/^\d+\.\s*/, '');
      const imgPrompt = `A hyper-realistic, professional 3D scientific visualization of ${cleanTitle}. Featuring elegant molecular structures and futuristic industrial applications of graphene. Cinematic lighting with deep shadows and glowing highlights, metallic and carbon textures, 8k resolution, masterfully composed, clean and premium aesthetic. Absolutely no text, no labels, no watermarks.`;
      
      const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${geminiKey}`;
      const iRes = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: imgPrompt }] }] })
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
          console.log('Image generated! Uploading to Sanity...');
          // Upload to Sanity
          const uploadRes = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/assets/images/production`, {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${sanityToken}`,
              'Content-Type': 'image/png'
            },
            body: Buffer.from(b64, 'base64')
          });
          const uploadData = await uploadRes.json();
          const assetId = uploadData._id || uploadData.document._id;
          
          if (assetId) {
            mutations.push({
              patch: {
                id: post._id,
                set: {
                  mainImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: assetId }
                  }
                }
              }
            });
          }
        }
      } else {
        const txt = await iRes.text();
        console.log('Image Gen Error:', txt);
      }
    }

    // Execute mutations
    if (mutations.length > 0) {
      const mutRes = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/mutate/production`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sanityToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mutations })
      });
      const mutData = await mutRes.json();
      console.log('Updated post:', mutData);
    } else {
      console.log('No updates needed for', post.title);
    }
  }
}
run().catch(console.error);
