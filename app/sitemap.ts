import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://usa-graphene.com'

  // Fetch all blog posts
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt,
      publishedAt
    }
  `)

  // Fetch all products
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  const blogUrls = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post._updatedAt ? new Date(post._updatedAt) : (post.publishedAt ? new Date(post.publishedAt) : new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product._updatedAt ? new Date(product._updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const staticRoutes = [
    '',
    '/about',
    '/applications',
    '/products',
    '/equipment',
    '/market-research',
    '/blog',
    '/contact',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...staticRoutes, ...productUrls, ...blogUrls]
}
