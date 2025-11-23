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
})

async function checkPosts() {
    const posts = await client.fetch(`*[_type == "post"]{title, slug, "author": author->name, "categories": categories[]->title}`);
    console.log(`Found ${posts.length} posts.`);
    let missingDataCount = 0;
    posts.forEach(post => {
        const missing = [];
        if (!post.author) missing.push('Author');
        if (!post.categories || post.categories.length === 0) missing.push('Categories');

        if (missing.length > 0) {
            console.log(`Post "${post.title}" is missing: ${missing.join(', ')}`);
            missingDataCount++;
        }
    });
    if (missingDataCount === 0) {
        console.log('All posts have authors and categories.');
    } else {
        console.log(`${missingDataCount} posts have missing data.`);
    }
}

checkPosts();

