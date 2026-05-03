const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let token = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('SANITY_API_TOKEN=')) token = line.split('=')[1].trim();
}

async function run() {
  const query = encodeURIComponent(`*[_type == "post"] | order(_createdAt desc)[0...10] { title, _createdAt }`);
  const res = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/query/production?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
