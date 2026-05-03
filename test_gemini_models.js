const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let key = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('GOOGLE_AI_API_KEY=')) key = line.split('=')[1].trim();
}
if (!key) {
  console.log("No GOOGLE_AI_API_KEY");
  process.exit(1);
}

async function testModel(modelName) {
  console.log(`Testing ${modelName}...`);
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  const res = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: "A blue circle" }] }]
    })
  });
  const text = await res.text();
  console.log(`Response for ${modelName}:`, text.substring(0, 200));
}

testModel('nano-banana-pro-2');
testModel('nano-banana-pro-preview');
testModel('imagen-3.0-generate-001');
