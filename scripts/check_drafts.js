
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function checkDrafts() {
    const query = `*[_id in ["f27e1668-dfe8-41a1-96c7-a38dd244db33", "drafts.f27e1668-dfe8-41a1-96c7-a38dd244db33"]] {
    _id,
    title,
    slug,
    _createdAt,
    _updatedAt
  }`;

    const results = await client.fetch(query);
    console.log('Document results (including drafts):');
    console.log(JSON.stringify(results, null, 2));
}

checkDrafts().catch(console.error);
