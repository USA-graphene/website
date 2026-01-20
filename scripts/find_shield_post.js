
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function findShieldPost() {
    const query = `*[_type == "post" && title match "*Shield*"] {
    _id,
    title,
    slug,
    _createdAt,
    _updatedAt
  }`;

    const posts = await client.fetch(query);
    console.log('Search Results for "Shield":');
    console.log(JSON.stringify(posts, null, 2));
}

findShieldPost().catch(console.error);
