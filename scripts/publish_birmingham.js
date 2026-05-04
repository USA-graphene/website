const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function publishCustomPost() {
  const geminiKey = process.env.GOOGLE_AI_API_KEY;

  const allPosts = await sanityClient.fetch('*[_type == "post"]{ title }');
  let maxNumber = 0;
  allPosts.forEach(p => {
    const m = p.title.match(/^(\d+)\./);
    if (m) maxNumber = Math.max(maxNumber, parseInt(m[1]));
  });
  const nextNumber = maxNumber + 1;
  console.log("[Publish] Next article number: " + nextNumber);

  const prompt = 'You are a senior science and industry journalist for usa-graphene.com.\n\nRewrite the following press release into a deeply detailed, 2000+ word original article. Do NOT copy the original text. Rephrase everything in your own words while preserving the technical accuracy.\n\nSOURCE MATERIAL (do not copy verbatim — rephrase entirely):\n"""\nResearchers at the University of Birmingham have demonstrated a groundbreaking technique for producing graphene and other two-dimensional materials at room temperature using high-intensity vibrational exfoliation. The method, led by Dr. Jason Stafford from the Department of Mechanical Engineering, increases production rates by up to tenfold compared to conventional approaches such as sonication and shear mixing, while eliminating the need for toxic solvents.\n\nThe team used a resonant acoustic mixing system to process graphite and other bulk precursors in water with tannic acid, producing atomically thin nanosheets of graphene, hexagonal boron nitride (h-BN), molybdenum disulfide (MoS2), and tungsten disulfide (WS2). The research combined electron microscopy, spectroscopic analysis, and multiphase computational fluid dynamics simulations to reveal that high-intensity vibrations cause graphite particles to fold at the edges, split into thinner layers, and then undergo high strain rates in the liquid phase to form few-layer and monolayer graphene sheets.\n\nThe research was published in the journal Small on April 24, 2026, under the title "Vibrational Exfoliation of 2D Materials" (DOI: 10.1002/smll.202511652). Co-authors include Aadam Rabani, Faysal A. Khaleel, Fahad S. Al-Gburi, Irwing Ramirez, and Tomislav Friscic.\n\nDr. Stafford is a co-inventor on 20 patents and the main inventor on a patent application filed by University of Birmingham Enterprise for a high-throughput method for 2D and nanomaterial processing. The patent application details are managed by University of Birmingham Enterprise.\n\nCurrent industrial methods for graphene production face high costs, inconsistent quality, long processing times, contamination risks (ball milling), high solvent waste (sonication, shear mixing), and reliance on non-renewable raw materials.\n"""\n\nWRITING RULES:\n1. MANDATORY: Credit the researchers by name in the first paragraph: Dr. Jason Stafford, Aadam Rabani, Faysal A. Khaleel, Fahad S. Al-Gburi, Irwing Ramirez, and Tomislav Friscic.\n2. MANDATORY: Include the journal reference: Published in Small, April 2026 (DOI: 10.1002/smll.202511652).\n3. MANDATORY: Mention that Dr. Stafford holds 20 patents and has filed a patent application via University of Birmingham Enterprise for this specific high-throughput 2D nanomaterial processing method.\n4. Length: Minimum 2000 words.\n5. Structure: Introduction then 5-7 sections with ## H2 headings then FAQ (5 Q&A) then Conclusion.\n6. Every paragraph: 4-7 sentences. NO bullet points, NO numbered lists, NO bolding (**).\n7. Tone: expert, technical, industry-focused. Emphasize commercial and industrial implications.\n8. NO AI cliches. NO bolded labels.\n\nReturn ONLY a JSON object:\n{\n  "title": "SEO-optimized title about vibrational exfoliation graphene breakthrough",\n  "excerpt": "Short 2-sentence summary",\n  "body": "Full 2000+ word article with ## headings",\n  "imagePrompt": "A photorealistic 16:9 scientific visualization of graphene nanosheets being produced through vibrational exfoliation in a liquid medium, showing layers peeling off a graphite crystal, with molecular-scale detail. No text, no labels, no watermarks."\n}';

  console.log("[Publish] Generating article with Gemini 3.1 Pro...");
  const gRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + geminiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 16384, response_mime_type: "application/json" }
    })
  });

  const gData = await gRes.json();
  if (!gData.candidates || !gData.candidates[0]) {
    console.error("[Publish] Gemini returned no candidates:", JSON.stringify(gData).substring(0, 500));
    console.log("[Publish] Retrying with shorter prompt...");
    
    const shortPrompt = 'Write a 2000+ word original technical article about vibrational exfoliation of graphene developed by Dr. Jason Stafford, Aadam Rabani, Faysal A. Khaleel, Fahad S. Al-Gburi, Irwing Ramirez, and Tomislav Friscic at University of Birmingham. Published in Small journal April 2026 (DOI: 10.1002/smll.202511652). Dr. Stafford holds 20 patents and filed a patent via University of Birmingham Enterprise. The method uses resonant acoustic mixing at room temperature with water and tannic acid instead of toxic solvents, achieving 10x production rates over sonication/shear mixing. It produces graphene, h-BN, MoS2, WS2 nanosheets. Use ## H2 headings. Include FAQ. No bullet points, no bold text. Return JSON: {"title":"...","excerpt":"...","body":"...","imagePrompt":"..."}';
    
    const gRes2 = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + geminiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: shortPrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 16384, response_mime_type: "application/json" }
      })
    });
    const gData2 = await gRes2.json();
    if (!gData2.candidates || !gData2.candidates[0]) {
      console.error("[Publish] Retry also failed:", JSON.stringify(gData2).substring(0, 500));
      process.exit(1);
    }
    var p = JSON.parse(gData2.candidates[0].content.parts[0].text);
  } else {
    var p = JSON.parse(gData.candidates[0].content.parts[0].text);
  }
  const wordCount = p.body.trim().split(/\s+/).length;
  console.log("[Publish] Article generated: " + wordCount + " words");

  console.log("[Publish] Generating cover image with Nano Banana Pro...");
  let assetId = '';
  try {
    const iRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=" + geminiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: p.imagePrompt }] }] })
    });
    if (iRes.ok) {
      const iData = await iRes.json();
      const b64 = iData.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
      if (b64) {
        const asset = await sanityClient.assets.upload('image', Buffer.from(b64, 'base64'), { filename: 'vibrational-exfoliation.png', contentType: 'image/png' });
        assetId = asset._id;
        console.log("[Publish] Image uploaded: " + assetId);
      }
    }
  } catch (e) { console.warn("[Publish] Image error: " + e); }

  const finalTitle = nextNumber + ". " + p.title;
  const finalSlug = slugify(finalTitle);

  console.log("[Publish] Publishing: " + finalTitle);
  const created = await sanityClient.create({
    _type: 'post',
    title: finalTitle,
    slug: { _type: 'slug', current: finalSlug },
    excerpt: p.excerpt,
    body: p.body.replace(/\r\n/g, '\n').split(/\n{2,}/).filter(para => para.trim() !== '').map(para => {
      let style = 'normal';
      let text = para.trim();
      text = text.replace(/^\d+\.\s*\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
      text = text.replace(/^\*\*(.*?)\*\*[:\-]?\s*/, '$1 ');
      text = text.replace(/\*\*/g, '');
      if (text.startsWith('### ')) { style = 'h3'; text = text.replace(/^###\s+/, ''); }
      else if (text.startsWith('## ')) { style = 'h2'; text = text.replace(/^##\s+/, ''); }
      return {
        _type: 'block', _key: Math.random().toString(36).slice(2, 11),
        style: style,
        children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 11), text: text, marks: [] }]
      };
    }),
    publishedAt: new Date().toISOString(),
    mainImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
    categories: [{ _type: 'reference', _ref: '7QyVE6fI6HWfwHJOF8VGju', _key: 'cat1' }],
    author: { _type: 'reference', _ref: '0fbb5f25-9a9b-40ee-a727-0a900e3152f1' },
  });

  console.log("[Publish] SUCCESS! https://usa-graphene.com/blog/" + finalSlug);
}

publishCustomPost();
