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

function generateKey() {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

async function fixAllBodyKeys() {
    console.log('Fetching all posts to check for missing keys...')

    const posts = await client.fetch(`*[_type == "post"]{_id, title, body}`)

    console.log(`Found ${posts.length} posts. Checking data integrity...`)

    let totalFixed = 0

    for (const post of posts) {
        if (!post.body || !Array.isArray(post.body)) continue

        let postNeedsUpdate = false

        const fixedBody = post.body.map(block => {
            let blockNeedsUpdate = false
            
            // 1. Check top-level block key
            if (!block._key) {
                block._key = generateKey()
                blockNeedsUpdate = true
            }

            // 2. Check children (spans)
            if (block.children && Array.isArray(block.children)) {
                block.children = block.children.map(child => {
                    if (!child._key) {
                        blockNeedsUpdate = true
                        return { ...child, _key: generateKey() }
                    }
                    return child
                })
            }

            if (blockNeedsUpdate) postNeedsUpdate = true
            return block
        })

        if (postNeedsUpdate) {
            console.log(`Healing post: "${post.title}" (${post._id})`)
            try {
                await client.patch(post._id)
                    .set({ body: fixedBody })
                    .commit()
                totalFixed++
            } catch (err) {
                console.error(`Failed to update ${post._id}:`, err.message)
            }
        }
    }

    console.log(`\n✅ Data healing complete.`)
    console.log(`Posts fixed: ${totalFixed}`)
    console.log(`Posts checked: ${posts.length}`)
}

fixAllBodyKeys().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
