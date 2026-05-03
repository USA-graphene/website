const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let key = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('GOOGLE_AI_API_KEY=')) key = line.split('=')[1].trim();
}

async function testModel(path) {
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/${path}:generateContent?key=${key}`;
  const res = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: "A blue circle" }] }]
    })
  });
  const text = await res.text();
  console.log(`Response for ${path}:`, text.substring(0, 200));
}

testModel('tunedModels/nano-banana-pro-2');
testModel('models/gemini-1.5-pro');
