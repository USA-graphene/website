
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function fixSlug() {
    const docId = 'f27e1668-dfe8-41a1-96c7-a38dd244db33';
    const newSlug = 'the-graphene-shield';

    console.log(`Updating slug for document ${docId} to "${newSlug}"...`);

    try {
        await client
            .patch(docId)
            .set({
                slug: {
                    _type: 'slug',
                    current: newSlug
                }
            })
            .commit();
        console.log('Successfully updated slug!');
    } catch (err) {
        console.error('Failed to update slug.');
        console.error(err.message);
    }
}

fixSlug().catch(console.error);
