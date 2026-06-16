import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { seoClusters } from '@/lib/seoKeywords'
import { getSlugValue, selectIndexableBlogPosts } from '@/lib/blogSeo'

const SITEMAP_POST_LIMIT = Number(process.env.SITEMAP_POST_LIMIT || 240)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.usa-graphene.com'

  // Fetch only clean, indexable blog candidates. Older legacy posts remain
  // accessible, but we do not keep pushing them to Google as primary URLs.
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      _updatedAt,
      publishedAt,
      seoNoIndex,
      canonicalSlug
    }
  `)

  // Fetch all products
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  // NOTE: All URLs MUST include trailing slashes to match the canonical form
  // enforced by proxy.ts. Without trailing slashes, Google would see the sitemap
  // URL, get a 301 redirect to the trailing-slash version, and flag it as
  // "Page with redirect" in Google Search Console.
  const blogUrls = selectIndexableBlogPosts(posts, SITEMAP_POST_LIMIT).map((post: any) => ({
    url: `${baseUrl}/blog/${getSlugValue(post.slug)}/`,
    lastModified: post._updatedAt ? new Date(post._updatedAt) : (post.publishedAt ? new Date(post.publishedAt) : new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}/`,
    lastModified: product._updatedAt ? new Date(product._updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const staticRoutes = [
    '/',
    '/about/',
    '/applications/',
    '/products/',
    '/equipment/',
    '/market-research/',
    '/blog/',
    '/contact/',
    '/privacy/',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : 0.8,
  }))

  const categoryUrls = seoClusters.map((cluster) => ({
    url: `${baseUrl}/blog/category/${cluster.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...categoryUrls, ...productUrls, ...blogUrls]
}
