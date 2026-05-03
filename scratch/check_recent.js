const fs = require('fs');
const { createClient } = require('@sanity/client');

const envStr = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
}

const client = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...10]{ title, publishedAt }`);
  console.log(JSON.stringify(posts, null, 2));
}

main().catch(console.error);
