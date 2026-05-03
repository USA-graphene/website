const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const sanityClient = createClient({
  projectId: 't9t7is4j',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function fixNumbering() {
  console.log(`[Fix] Fetching all posts...`);
  const posts = await sanityClient.fetch(`*[_type == "post"] | order(_createdAt asc)`);
  
  const toFix = posts.filter(p => !/^\d+\./.test(p.title));
  console.log(`[Fix] Found ${toFix.length} posts to fix.`);

  let nextNum = 432;
  for (const post of toFix) {
    const newTitle = `${nextNum}. ${post.title}`;
    const newSlug = slugify(newTitle);
    console.log(`[Fix] Renumbering "${post.title}" -> ${nextNum}`);
    await sanityClient.patch(post._id).set({
      title: newTitle,
      slug: { _type: 'slug', current: newSlug }
    }).commit();
    nextNum++;
  }

  console.log(`[Fix] Success.`);
}

fixNumbering();
