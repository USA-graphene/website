const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let key = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('GOOGLE_AI_API_KEY=')) key = line.split('=')[1].trim();
}

async function testModel(modelName) {
  console.log(`Testing ${modelName}...`);
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  try {
    const res = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
    });
    const data = await res.json();
    if (data.error) {
      console.log(`❌ ${modelName}: ${data.error.message}`);
    } else {
      console.log(`✅ ${modelName}: OK`);
    }
  } catch (e) {
    console.log(`💥 ${modelName}: ${e.message}`);
  }
}

async function main() {
  await testModel('gemini-3.1-pro-preview');
  await testModel('gemini-1.5-pro');
  await testModel('nano-banana-pro-preview');
}
main();
