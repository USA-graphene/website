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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'
const token = process.env.SANITY_API_TOKEN

if (!token) {
    console.error('ERROR: SANITY_API_TOKEN is missing from .env.local')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: token,
})

async function uploadImage(url) {
    if (!url) return null
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const asset = await client.assets.upload('image', buffer, {
            filename: path.basename(url)
        })
        return asset
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }
}

function htmlToBlocks(html) {
    if (!html) return []
    const blocks = []
    // Simple regex to find block level elements
    const regex = /<(p|h[1-6]|li|blockquote)[^>]*>(.*?)<\/\1>/gs
    let match

    while ((match = regex.exec(html)) !== null) {
        const tag = match[1]
        const content = match[2].replace(/<[^>]+>/g, '').trim() // Strip inner tags

        if (!content) continue

        let style = 'normal'
        let listItem = undefined

        if (tag.startsWith('h')) {
            style = tag
        } else if (tag === 'blockquote') {
            style = 'blockquote'
        } else if (tag === 'li') {
            listItem = 'bullet'
        }

        blocks.push({
            _type: 'block',
            children: [{ _type: 'span', text: content }],
            markDefs: [],
            style: style,
            listItem: listItem
        })
    }

    // If no blocks found (maybe just text), return one block
    if (blocks.length === 0 && html.trim()) {
        blocks.push({
            _type: 'block',
            children: [{ _type: 'span', text: html.replace(/<[^>]+>/g, '').trim() }],
            markDefs: [],
            style: 'normal'
        })
    }

    return blocks
}

async function importPosts() {
    console.log('Fetching posts from WordPress...')
    try {
        const response = await fetch('https://usa-graphene.com/wp-json/wp/v2/posts?per_page=100&_embed')
        if (!response.ok) throw new Error(`Failed to fetch posts: ${response.statusText}`)
        const posts = await response.json()

        console.log(`Found ${posts.length} posts. Starting import...`)

        for (const post of posts) {
            const slug = post.slug

            // Skip if already exists (optional, but good for idempotency)
            // Actually, let's just overwrite or skip. Checking first is safer.
            const existing = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })
            if (existing) {
                console.log(`Post "${post.title.rendered}" already exists. Skipping...`)
                continue
            }

            console.log(`Importing: ${post.title.rendered}`)

            // Handle Image
            let imageAsset = null
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
            if (imageUrl) {
                console.log(`  Uploading image: ${imageUrl}`)
                imageAsset = await uploadImage(imageUrl)
            }

            // Handle Categories (create if needed)
            const categories = []
            if (post._embedded?.['wp:term']) {
                const cats = post._embedded['wp:term'].flat().filter(t => t.taxonomy === 'category')
                for (const cat of cats) {
                    // Create category if not exists
                    const catDoc = {
                        _type: 'category',
                        _id: `category-${cat.id}`,
                        title: cat.name,
                        description: cat.description
                    }
                    await client.createOrReplace(catDoc)
                    categories.push({
                        _type: 'reference',
                        _ref: catDoc._id
                    })
                }
            }

            // Handle Author (create if needed)
            let authorRef = null
            if (post._embedded?.['author']?.[0]) {
                const auth = post._embedded['author'][0]
                const authDoc = {
                    _type: 'author',
                    _id: `author-${auth.id}`,
                    name: auth.name,
                    slug: { _type: 'slug', current: auth.slug }
                }
                await client.createOrReplace(authDoc)
                authorRef = {
                    _type: 'reference',
                    _ref: authDoc._id
                }
            }

            // Create Post
            const doc = {
                _type: 'post',
                title: post.title.rendered,
                slug: { _type: 'slug', current: slug },
                publishedAt: post.date,
                excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').trim(),
                body: htmlToBlocks(post.content.rendered),
                mainImage: imageAsset ? {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: imageAsset._id
                    }
                } : undefined,
                categories: categories.length > 0 ? categories : undefined,
                author: authorRef
            }

            await client.createOrReplace({
                _id: slug, // Use slug as ID for easier tracking
                ...doc
            })
            console.log(`  Successfully imported: ${post.title.rendered}`)
        }
        console.log('Import completed!')

    } catch (error) {
        console.error('Import failed:', error)
    }
}

importPosts()
