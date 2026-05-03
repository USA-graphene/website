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

async function testImagen() {
  console.log(`Testing imagen-3.0-generate-001:predict...`);
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${key}`;
  const res = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      instances: [{ prompt: "A blue circle" }],
      parameters: { sampleCount: 1, aspectRatio: '1:1' }
    })
  });
  const text = await res.text();
  console.log(`Response:`, text.substring(0, 300));
}

testImagen();
