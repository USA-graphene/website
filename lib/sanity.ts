import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    // useCdn: true enables Sanity's global CDN, reducing latency and allowing
    // Next.js to treat these fetches as cacheable (ISR). Without this, every
    // request hits Sanity's API directly and Next.js returns no-cache headers,
    // preventing Googlebot from caching pages and hurting indexing.
    useCdn: true,
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}
