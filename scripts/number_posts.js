import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

async function main() {
  console.log("Fetching all posts sorted by publishedAt (oldest first)...")
  // Fallback to _createdAt if publishedAt is missing
  const posts = await client.fetch(`*[_type == "post"] | order(coalesce(publishedAt, _createdAt) asc) { _id, title, publishedAt, _createdAt }`)
  console.log(`Found ${posts.length} posts. Applying numbers...`)
  
  let updatedCount = 0;
  for (let i = 0; i < posts.length; i++) {
    const num = i + 1;
    let title = posts[i].title || "";
    
    // Strip existing leading numbers like "1. ", "123. ", "[1] ", "1 - " to avoid double numbering
    let cleanTitle = title.replace(/^\[?\d+\]?[\.\-]?\s*/, '');
    
    const newTitle = `${num}. ${cleanTitle}`;
    
    if (title !== newTitle) {
      console.log(`[${num}/${posts.length}] ${newTitle}`);
      try {
        await client.patch(posts[i]._id).set({ title: newTitle }).commit();
        updatedCount++;
      } catch (err) {
        console.error(`Failed to patch post ${posts[i]._id}:`, err.message);
      }
    }
  }
  console.log(`\n✅ Done! Updated ${updatedCount} posts.`);
}

main().catch(console.error);
