
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function testFetch() {
    const slug = "Unraveling the Science of Stopping Projectiles and the Future of Body Armor";
    const query = `*[_type == "post" && slug.current == $slug][0]`;

    const post = await client.fetch(query, { slug });
    console.log('Fetch result:');
    console.log(post ? `Found post: ${post.title}` : 'Post not found!');

    // Try with encoded slug just in case
    const encodedSlug = encodeURIComponent(slug);
    const postEncoded = await client.fetch(query, { slug: encodedSlug });
    console.log('Fetch result (encoded):');
    console.log(postEncoded ? `Found post: ${postEncoded.title}` : 'Post not found!');
}

testFetch().catch(console.error);
