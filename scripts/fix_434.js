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

async function fixPost434() {
  const authors = "E. E. Bashmakova, M. S. Savelyev, P. N. Vasilevsky, and A. Yu. Gerasimenko";
  const post = await sanityClient.fetch(`*[_type == "post" && title match "434."][0]`);
  
  if (post && post.body) {
    const firstBlock = post.body[0];
    if (firstBlock && firstBlock.children) {
      const originalText = firstBlock.children[0].text;
      const newText = `Research led by ${authors} has recently explored how graphene substrates can dramatically enhance the thermal stability of hydrogen-bonded molecular systems. ${originalText}`;
      
      console.log(`[Fix] Adding authors to Post 434...`);
      const newBody = [...post.body];
      newBody[0] = {
        ...firstBlock,
        children: [{ ...firstBlock.children[0], text: newText }]
      };
      
      await sanityClient.patch(post._id).set({ body: newBody }).commit();
      console.log(`[Fix] Success.`);
    }
  }
}

fixPost434();
