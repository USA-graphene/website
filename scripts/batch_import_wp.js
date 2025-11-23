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

    const paragraphs = text.split('\n\n').filter(p => p.trim())

    return paragraphs.map(paragraph => {
        const trimmed = paragraph.trim()

        const headingMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
        if (headingMatch) {
            return {
                _type: 'block',
                children: [{ _type: 'span', text: trimmed }],
                markDefs: [],
                style: 'h2'
            }
        }

        const subHeadingMatch = trimmed.match(/^([a-z])\.\s+(.+)$/)
        if (subHeadingMatch) {
            return {
                _type: 'block',
                children: [{ _type: 'span', text: trimmed }],
                markDefs: [],
                style: 'h3'
            }
        }

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

async function fetchAllWordPressPosts() {
    const allPosts = []
    let page = 1
    let hasMore = true

    console.log('Fetching all WordPress posts...')

    while (hasMore) {
        const url = `https://usa-graphene.com/wp-json/wp/v2/posts?page=${page}&per_page=10&_embed`
        const response = await fetch(url)

        if (!response.ok) {
            if (response.status === 400) {
                // No more pages
                hasMore = false
                break
            }
            throw new Error(`Failed to fetch page ${page}: ${response.statusText}`)
        }

        const posts = await response.json()
        if (posts.length === 0) {
            hasMore = false
        } else {
            allPosts.push(...posts)
            console.log(`Fetched page ${page}: ${posts.length} posts`)
            page++
        }
    }

    console.log(`Total posts fetched: ${allPosts.length}\n`)
    return allPosts
}

async function importPost(wpPost, index, total) {
    console.log(`\n[${index + 1}/${total}] Importing: ${wpPost.title.rendered}`)

    const title = wpPost.title.rendered
    const slug = wpPost.slug
    const content = wpPost.content.rendered
    const excerpt = wpPost.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/&hellip;/g, '...').replace(/\[…\]/g, '...').trim()
    const publishedAt = wpPost.date

    let imageUrl = null
    if (wpPost._embedded && wpPost._embedded['wp:featuredmedia'] && wpPost._embedded['wp:featuredmedia'][0]) {
        imageUrl = wpPost._embedded['wp:featuredmedia'][0].source_url
    }

    // Check if post already exists
    const existing = await client.fetch(`*[_type == "post" && slug.current == "${slug}"][0]`)
    if (existing) {
        console.log(`  ⏭️  Skipping (already exists)`)
        return { skipped: true }
    }

    // Upload Image if exists
    let imageAsset = null
    if (imageUrl) {
        imageAsset = await uploadImage(imageUrl)
    }

    // Get author and categories
    const author = await client.fetch('*[_type == "author" && name == "raimis2"][0]')
    let categories = await client.fetch('*[_type == "category" && title in ["Battery Tech", "Energy Storage"]]')

    if (categories.length === 0) {
        const cat1 = await client.create({ _type: 'category', title: 'Battery Tech' })
        const cat2 = await client.create({ _type: 'category', title: 'Energy Storage' })
        categories = [cat1, cat2]
    }

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
        console.log(`  ✅ Imported successfully`)
        return { success: true, id: result._id }
    } catch (err) {
        console.error(`  ❌ Error:`, err.message)
        return { error: true, message: err.message }
    }
}

async function batchImport() {
    console.log('=== WordPress to Sanity Batch Import ===\n')

    const posts = await fetchAllWordPressPosts()

    let imported = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < posts.length; i++) {
        const result = await importPost(posts[i], i, posts.length)

        if (result.skipped) skipped++
        else if (result.success) imported++
        else if (result.error) errors++

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n=== Import Summary ===')
    console.log(`Total posts: ${posts.length}`)
    console.log(`Imported: ${imported}`)
    console.log(`Skipped (already exist): ${skipped}`)
    console.log(`Errors: ${errors}`)
    console.log('\nView your blog at: http://localhost:3002/blog')
}

batchImport().catch(err => {
    console.error('Batch import failed:', err)
    process.exit(1)
})
