const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let token = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('SANITY_API_TOKEN=')) token = line.split('=')[1].trim();
}

async function run() {
  const query = encodeURIComponent(`*[_type == "post" && title match "408*" || title match "409*"]{_id, title}`);
  const res = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/query/production?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  
  const mutations = data.result.map(doc => ({ delete: { id: doc._id } }));
  
  if (mutations.length > 0) {
    const mutRes = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/mutate/production`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations })
    });
    const mutData = await mutRes.json();
    console.log("Deleted duplicates:", mutData);
  } else {
    console.log("No duplicates found");
  }
}
run();
