const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

// Manually load env vars from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8')
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                process.env[key.trim()] = value.trim()
            }
        })
    }
} catch (e) {
    console.error('Error loading .env.local', e)
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function fixPost() {
    const slug = 'unlocking-sodium-revolution-graphene-batteries';
    console.log(`Fixing metadata for post: ${slug}`);

    // Fetch author and categories to get their IDs
    const author = await client.fetch('*[_type == "author" && name == "raimis2"][0]');
    let categories = await client.fetch('*[_type == "category" && title in ["Battery Tech", "Energy Storage"]]');

    if (categories.length === 0) {
        console.log('Categories not found. Creating them...');
        const cat1 = await client.create({ _type: 'category', title: 'Battery Tech' });
        const cat2 = await client.create({ _type: 'category', title: 'Energy Storage' });
        categories = [cat1, cat2];
    }

    console.log(`Found author: ${author.name} (${author._id})`);
    console.log(`Found ${categories.length} categories: ${categories.map(c => c.title).join(', ')}`);

    try {
        // Find the post by slug
        const post = await client.fetch(`*[_type == "post" && slug.current == "${slug}"][0]`);
        if (!post) {
            console.error('Post not found.');
            return;
        }

        // Update the post
        const result = await client.patch(post._id)
            .set({
                author: {
                    _type: 'reference',
                    _ref: author._id
                },
                categories: categories.map(c => ({
                    _type: 'reference',
                    _ref: c._id,
                    _key: c._id // Add a key for the array item
                }))
            })
            .commit();

        console.log('Post updated successfully:', result._id);
    } catch (err) {
        console.error('Error updating post:', err);
    }
}

fixPost();
