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

async function fixMissingKeys() {
    console.log('Fetching all posts...')

    // Fetch all posts with their categories
    const posts = await client.fetch(`*[_type == "post"]{_id, title, categories}`)

    console.log(`Found ${posts.length} posts`)

    let fixed = 0
    let skipped = 0

    for (const post of posts) {
        if (!post.categories || post.categories.length === 0) {
            skipped++
            continue
        }

        // Check if categories already have _key
        const needsFix = post.categories.some(cat => !cat._key)

        if (needsFix) {
            console.log(`Fixing: ${post.title}`)

            // Add _key to each category reference
            const fixedCategories = post.categories.map((cat, index) => ({
                ...cat,
                _key: cat._key || cat._ref || `category-${index}`
            }))

            // Update the post
            await client.patch(post._id)
                .set({ categories: fixedCategories })
                .commit()

            fixed++
        } else {
            skipped++
        }
    }

    console.log(`\n✅ Fixed ${fixed} posts`)
    console.log(`⏭️  Skipped ${skipped} posts (already have keys or no categories)`)
}

fixMissingKeys().catch(err => {
    console.error('Error:', err)
    process.exit(1)
})
