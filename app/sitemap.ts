import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://usa-graphene.com'

    // Fetch all blog posts
    const posts = await client.fetch(`
    *[_type == "post"] {
      "slug": slug.current,
      publishedAt
    }
  `)

    const blogUrls = posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const staticRoutes = [
        '',
        '/about',
        '/applications',
        '/blog',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...staticRoutes, ...blogUrls]
}
