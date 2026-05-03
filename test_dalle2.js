const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let key = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('OPENAI_API_KEY=')) key = line.split('=')[1].trim();
}

async function run() {
  console.log("Testing DALL-E 2...");
  const iRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({ 
      model: 'dall-e-2',
      prompt: "A high-end, futuristic 3D product render of a graphene cube. Soft studio lighting.",
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    })
  });
  if (!iRes.ok) {
    const text = await iRes.text();
    console.log("Error:", text);
  } else {
    console.log("Success! Image generated.");
  }
}
run();
