import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

const targetNums = [
  225, 222, 343, 221, 342, 220, 341, 340, 339, 217, 338, 216, 337, 215, 336, 214, 335, 213, 
  334, 333, 212, 211, 332, 331, 209, 329, 328, 327, 206, 326, 205, 325, 324, 203, 323, 322, 
  201, 321, 200, 320, 199, 319, 198, 318, 197, 317, 196, 316, 195, 315, 194, 314, 313, 193, 
  312, 192, 311, 191, 310, 190, 309, 189, 308, 188, 306, 305, 304, 303, 302, 183, 301, 182, 
  300, 299, 298, 297, 296, 295, 176, 294, 293, 292, 291, 173, 290, 289, 288, 287, 286, 169, 
  285, 284, 283, 167, 282, 166, 165, 277, 274, 160, 159, 272, 158, 157, 156, 154, 153, 35, 
  261, 148, 258, 257, 255, 144, 23, 248, 247, 245, 239, 238, 237, 236, 234, 126, 233, 229, 
  228, 227, 226, 1
];

async function main() {
  console.log("Fetching posts to map numbers to IDs...")
  const posts = await client.fetch(`*[_type == "post"] { _id, title }`)
  
  const toProcess = [];
  
  for (const post of posts) {
    const match = post.title.match(/^(\d+)\./);
    if (match) {
      const num = parseInt(match[1], 10);
      if (targetNums.includes(num)) {
        toProcess.push({
          id: post._id,
          title: post.title,
          num: num
        });
      }
    }
  }
  
  console.log(`Found ${toProcess.length} posts matching the requested numbers.`);
  
  for (let i = 0; i < toProcess.length; i++) {
    const post = toProcess[i];
    console.log(`\n[${i+1}/${toProcess.length}] Processing Post #${post.num}: ${post.title}`);
    
    try {
      const safeTitle = post.title.replace(/"/g, '\\"');
      const { stdout, stderr } = await execAsync(`./remake_image "${post.id}" "${safeTitle}"`, {
        cwd: resolve(__dirname, 'singlepublisher'),
        env: {
          ...process.env,
          SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
          GEMINI_API_KEY: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
        }
      });
      console.log(stdout.trim());
      if (stderr) console.error(stderr.trim());
    } catch (err) {
      console.error(`Error processing post #${post.num}:`, err.message);
    }
    
    // Add a small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("\n✅ All requested images have been updated!");
}

main().catch(console.error);
