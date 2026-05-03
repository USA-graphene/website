import { createClient } from '@sanity/client';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fixAllHashHeadings() {
  console.log("Fetching all posts with '###' in their body...");
  const query = '*[_type == "post" && body[].children[].text match "###*"]{_id, title, body}';
  const posts = await sanity.fetch(query);
  
  console.log(`Found ${posts.length} posts with '###' headings. Processing...`);

  let fixCount = 0;

  for (const post of posts) {
    if (!post.body) continue;
    let bodyChanged = false;
    const newBody = post.body.map((block: any) => {
      if (block._type === 'block' && block.children && block.children.length > 0) {
        const text = block.children[0].text;
        if (text && text.startsWith('### ')) {
          bodyChanged = true;
          return {
            ...block,
            style: 'h3',
            children: [
              {
                ...block.children[0],
                text: text.replace(/^###\s+/, '')
              }
            ]
          };
        } else if (text && text.startsWith('## ')) {
           bodyChanged = true;
           return {
            ...block,
            style: 'h2',
            children: [
              {
                ...block.children[0],
                text: text.replace(/^##\s+/, '')
              }
            ]
          };
        }
      }
      return block;
    });

    if (bodyChanged) {
      try {
        await sanity.patch(post._id).set({ body: newBody }).commit();
        console.log(`Fixed body for post: ${post.title}`);
        fixCount++;
      } catch (err: any) {
         console.error(`Failed to patch post ${post._id} (${post.title}):`, err.message);
      }
    }
  }

  console.log(`Successfully fixed ${fixCount} posts.`);
}

fixAllHashHeadings().catch(console.error);
