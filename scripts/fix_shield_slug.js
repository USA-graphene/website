
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 't9t7is4j',
    dataset: 'production',
    token: 'sk7AJSa6EshtiDiH5iro2YG4XCKXPiG4OqmeZ8Elf3O2o9eTUMrOFH2QtKnB1ds0SlTMBntaEHY62lNGPMNDdLj1HAk7m7jKisgFggByaxhOvBD8EiSmuPQuvzhzGoybkHnvvFlXL11cZExFjBmRkmeyqxRm1ZR02Vpwat675lw2oUk1yI9W',
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
