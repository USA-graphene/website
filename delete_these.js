const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
let token = '';
for (const line of envStr.split('\n')) {
  if (line.startsWith('SANITY_API_TOKEN=')) token = line.split('=')[1].trim();
}

async function run() {
  const idsToDelete = [
    'Mhssgs6mzl7NECPsW96Lis',
    '9RGFevtC80HFW1nDZDjM9H',
    'bTFby1bMt1lCldXSe88NvC'
  ];
  
  const mutations = idsToDelete.map(id => ({ delete: { id } }));
  
  const mutRes = await fetch(`https://t9t7is4j.api.sanity.io/v2023-05-03/data/mutate/production`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations })
  });
  const mutData = await mutRes.json();
  console.log("Deleted duplicates:", mutData);
}
run();
