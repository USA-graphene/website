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

async function deleteDuplicate() {
    const duplicateId = 'unlocking-the-sodium-revolution-the-high-tech-recipes-for-graphene-powder-in-next-gen-batteries'

    console.log(`Deleting duplicate post: ${duplicateId}`)

    try {
        await client.delete(duplicateId)
        console.log('✅ Duplicate post deleted successfully!')
    } catch (err) {
        console.error('❌ Error deleting post:', err)
    }
}

deleteDuplicate()
