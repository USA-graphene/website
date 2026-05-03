
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sk2xXoAc8mZArN3wBhEHt1k06l5HBQNOixYOvYuNwOg20aWlZDfQKVzrKzC2T8vGyJ74zG0Bv0ytYMgAl2Zd30YiXKBge2oKzlIW79rsdB2o0WMBbTFffPN9wOmwc2zyfKMzBmD72Wfpvhz9xxfn7imI7g6oYjGcwubpOOfRsa8k0C8nFii4',
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function test() {
  try {
    console.log("Fetching posts from Sanity...");
    const allPosts = await sanityClient.fetch(`*[_type == "post"]{ title, "slug": slug.current }`);
    console.log(`Found ${allPosts.length} posts.`);
    
    const existingSlugs = new Set(allPosts.map(p => p.slug));
    
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    console.log("Fetching from ArXiv...");
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    
    let selected = null;
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      
      const slugified = slugify(title);
      const shortSlug = slugified.substring(0, 15);
      const alreadyExists = Array.from(existingSlugs).some(s => s.includes(shortSlug));
      
      console.log(`Checking: ${title}`);
      console.log(`  Slug prefix: ${shortSlug}`);
      console.log(`  Already exists: ${alreadyExists}`);
      
      if (title && !alreadyExists) {
        selected = { title, abstract };
        console.log("  SELECTED!");
        break;
      }
    }

    if (!selected) {
      console.log("No new articles found.");
      return;
    }

    console.log("Generating with Gemini...");
    const geminiKey = 'AIzaSyC5n4GiKdaglnPdHC_G4cC72Z7uxzIifaA';
    const prompt = `Write a TECHNICAL science article (2000 words) about: ${selected.title}. 
Context: ${selected.abstract}

FORMATTING RULES (STRICT):
1. [TITLE] Write only the title here [/TITLE]
2. [BODY] Write the full 2000-word article here. Use ## for headings. No bolding. [/BODY]

DO NOT INCLUDE ANY OTHER TEXT.`;

    // Try with gemini-1.5-flash instead of gemini-pro-latest to see if it makes a difference
    const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8192 } })
    });
    
    const gData = await gRes.json();
    console.log("Gemini Response Status:", gRes.status);
    if (!gRes.ok) {
        console.log("Gemini Error:", JSON.stringify(gData, null, 2));
        return;
    }
    
    const raw = gData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log("Raw Response Length:", raw.length);
    console.log("Raw Response Start:", raw.substring(0, 200));

    const blogTitle = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/)?.[1]?.trim() || selected.title;
    const blogBody = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/)?.[1]?.trim();

    if (!blogBody || blogBody.length < 500) {
      console.log("FAIL: blogBody is missing or too short.");
      return;
    }

    console.log("Success! Blog body extracted. Length:", blogBody.length);

  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
