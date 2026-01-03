const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

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
} catch (e) { }

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
    useCdn: false,
})

async function listSlugs() {
    const posts = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`);
    console.log(JSON.stringify(posts.map(p => p.slug), null, 2));
}

listSlugs();
