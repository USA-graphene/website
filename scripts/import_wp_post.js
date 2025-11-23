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

// Helper function to convert HTML to Portable Text blocks
function htmlToPortableText(html) {
    // Remove HTML tags and convert to plain text
    const text = html
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#038;/g, '&')
        .replace(/&hellip;/g, '...')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .trim()

    // Split into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    // Convert to Portable Text blocks
    return paragraphs.map(paragraph => {
        const trimmed = paragraph.trim()

        // Check if it's a numbered heading (e.g., "1. Introduction")
        const headingMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
        if (headingMatch) {
            return {
                _type: 'block',
                children: [{ _type: 'span', text: trimmed }],
                markDefs: [],
                style: 'h2'
            }
        }

        // Check if it's a lettered heading (e.g., "a. Material Synthesis")
        const subHeadingMatch = trimmed.match(/^([a-z])\.\s+(.+)$/)
        if (subHeadingMatch) {
            return {
                _type: 'block',
                children: [{ _type: 'span', text: trimmed }],
                markDefs: [],
                style: 'h3'
            }
        }

        // Regular paragraph
        return {
            _type: 'block',
            children: [{ _type: 'span', text: trimmed }],
            markDefs: [],
            style: 'normal'
        }
    })
}

async function uploadImage(url) {
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

async function fetchWordPressPost(postId) {
    const url = `https://usa-graphene.com/wp-json/wp/v2/posts/${postId}?_embed`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch WordPress post ${postId}: ${response.statusText}`)
    }
    return response.json()
}

async function importPost(postId) {
    console.log(`\n=== Importing WordPress post ${postId} ===\n`)

    // Fetch the WordPress post data
    const wpPost = await fetchWordPressPost(postId)

    // Extract data
    const title = wpPost.title.rendered
    const slug = wpPost.slug
    const content = wpPost.content.rendered
    const excerpt = wpPost.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/&hellip;/g, '...').replace(/\[…\]/g, '...').trim()
    const publishedAt = wpPost.date

    // Get featured image URL
    let imageUrl = null
    if (wpPost._embedded && wpPost._embedded['wp:featuredmedia'] && wpPost._embedded['wp:featuredmedia'][0]) {
        imageUrl = wpPost._embedded['wp:featuredmedia'][0].source_url
    }

    console.log('Title:', title)
    console.log('Slug:', slug)
    console.log('Published:', publishedAt)
    console.log('Image URL:', imageUrl || 'No image')

    // Upload Image if exists
    let imageAsset = null
    if (imageUrl) {
        console.log('Uploading image...')
        imageAsset = await uploadImage(imageUrl)
        if (imageAsset) {
            console.log('Image uploaded:', imageAsset._id)
        }
    }

    // Get author and categories
    const author = await client.fetch('*[_type == "author" && name == "raimis2"][0]')
    let categories = await client.fetch('*[_type == "category" && title in ["Battery Tech", "Energy Storage"]]')

    if (categories.length === 0) {
        console.log('Categories not found. Creating them...')
        const cat1 = await client.create({ _type: 'category', title: 'Battery Tech' })
        const cat2 = await client.create({ _type: 'category', title: 'Energy Storage' })
        categories = [cat1, cat2]
    }

    // Create Post Document
    const doc = {
        _type: 'post',
        title: title,
        slug: { _type: 'slug', current: slug },
        publishedAt: publishedAt,
        excerpt: excerpt,
        body: htmlToPortableText(content),
        author: {
            _type: 'reference',
            _ref: author._id
        },
        categories: categories.map(c => ({
            _type: 'reference',
            _ref: c._id,
            _key: c._id
        }))
    }

    // Add image if it exists
    if (imageAsset) {
        doc.mainImage = {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: imageAsset._id
            }
        }
    }

    try {
        const result = await client.createOrReplace({
            _id: slug,
            ...doc
        })
        console.log('✅ Post created successfully:', result._id)
        console.log('View at: http://localhost:3002/blog/' + slug)
        return result
    } catch (err) {
        console.error('❌ Error creating post:', err)
        throw err
    }
}

// Get post ID from command line argument
const postId = process.argv[2]

if (!postId) {
    console.error('Usage: node import_wp_post.js <POST_ID>')
    console.error('Example: node import_wp_post.js 829')
    process.exit(1)
}

importPost(postId).catch(err => {
    console.error('Import failed:', err)
    process.exit(1)
})
