
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
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:graphene&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();
    
    let selected = null;
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(arxivXml)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
      const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').trim();
      selected = { title, abstract };
      break;
    }

    const geminiKey = 'AIzaSyC5n4GiKdaglnPdHC_G4cC72Z7uxzIifaA';
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
    
    console.log("Raw Response Length:", raw.length);
    const blogTitleMatch = raw.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/);
    const blogBodyMatch = raw.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/);

    console.log("Title Match:", blogTitleMatch ? "YES" : "NO");
    console.log("Body Match:", blogBodyMatch ? "YES" : "NO");

    if (!blogBodyMatch) {
        console.log("Raw output contains [BODY]?", raw.includes("[BODY]"));
        console.log("Raw output contains [/BODY]?", raw.includes("[/BODY]"));
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
