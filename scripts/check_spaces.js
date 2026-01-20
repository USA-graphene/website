
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function checkAllSlugs() {
    const query = `*[_type == "post"] {
    title,
    "slug": slug.current
  }`;

    const posts = await client.fetch(query);
    const postsWithSpaces = posts.filter(p => p.slug && p.slug.includes(' '));

    console.log('Posts with spaces in slugs:');
    console.log(JSON.stringify(postsWithSpaces, null, 2));
}

checkAllSlugs().catch(console.error);
