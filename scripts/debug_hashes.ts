import { createClient } from '@sanity/client';
const sanity = createClient({ projectId: 't9t7is4j', dataset: 'production', apiVersion: '2023-05-03', token: process.env.SANITY_API_TOKEN, useCdn: false });
async function run() {
  const posts = await sanity.fetch('*[_type == "post" && body[].children[].text match "###*"]{title, body}');
  for (const p of posts) {
    if (!p.body) continue;
    for (const b of p.body) {
      if (b.children && b.children.length > 0 && b.children[0].text && b.children[0].text.includes('###')) {
         console.log(p.title, "->", b.children[0].text.substring(0, 50));
      }
    }
  }
}
run();
