
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function checkSlugs() {
    const query = `*[_type == "post"] {
    _id,
    title,
    slug,
    _createdAt
  } | order(_createdAt desc)`;

    const posts = await client.fetch(query);
    console.log('Recent Blog Posts:');
    posts.slice(0, 10).forEach(post => {
        console.log(`- Title: ${post.title}`);
        console.log(`  Slug structure: ${JSON.stringify(post.slug)}`);
        console.log(`  Slug: ${post.slug?.current}`);
    });
}

checkSlugs().catch(console.error);
