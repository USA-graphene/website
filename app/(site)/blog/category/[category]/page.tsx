import { client, urlFor } from '@/lib/sanity'
import { clusterBySlug, seoClusters } from '@/lib/seoKeywords'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

const CATEGORY_POST_LIMIT = 24

export function generateStaticParams() {
    return seoClusters.map((cluster) => ({ category: cluster.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params
    const cluster = clusterBySlug(category)
    if (!cluster) return {}

    return {
        title: `${cluster.title} | USA Graphene`,
        description: cluster.description,
        keywords: cluster.keywords,
        alternates: {
            canonical: `/blog/category/${cluster.slug}/`,
        },
        openGraph: {
            title: `${cluster.title} | USA Graphene`,
            description: cluster.description,
            url: `https://www.usa-graphene.com/blog/category/${cluster.slug}/`,
            type: 'website',
        },
    }
}

async function getCategoryPosts(category: string) {
    const query = `*[_type == "post" && $category in categories[]->title] | order(publishedAt desc)[0...${CATEGORY_POST_LIMIT}] {
        _id,
        title,
        slug,
        mainImage {
            asset->{ _id }
        },
        publishedAt,
        excerpt,
        "author": author->name,
        "categories": categories[]->title
    }`
    return client.fetch(query, { category }, { next: { revalidate } })
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const cluster = clusterBySlug(category)
    if (!cluster) notFound()

    const posts = await getCategoryPosts(cluster.category)
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: cluster.title,
            description: cluster.description,
            url: `https://www.usa-graphene.com/blog/category/${cluster.slug}/`,
            keywords: cluster.keywords.join(', '),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.usa-graphene.com/' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.usa-graphene.com/blog/' },
                { '@type': 'ListItem', position: 3, name: cluster.title, item: `https://www.usa-graphene.com/blog/category/${cluster.slug}/` },
            ],
        },
    ]

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-[#070d1a] py-24 sm:py-32">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,110,240,0.1)_0%,transparent_70%)]" />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-3xl lg:mx-0">
                    <Link href="/blog/" className="text-sm font-semibold text-[#00c8ff] hover:text-white">
                        Blog
                    </Link>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">
                        {cluster.title}
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-[#8b9ab5]">{cluster.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {cluster.keywords.slice(0, 8).map((keyword) => (
                            <span key={keyword} className="rounded-full border border-[#2d6ef0]/25 bg-[#2d6ef0]/10 px-3 py-1 text-xs font-medium text-[#00c8ff]">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post: any) => (
                        <article key={post._id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1630]/70">
                            {post.mainImage && (
                                <Image
                                    src={urlFor(post.mainImage).width(640).height(360).fit('crop').quality(72).auto('format').url()}
                                    alt={post.title}
                                    width={640}
                                    height={360}
                                    className="aspect-video w-full object-cover"
                                />
                            )}
                            <div className="p-6">
                                <time dateTime={post.publishedAt} className="text-xs font-medium text-[#8b9ab5]">
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                </time>
                                <h2 className="mt-3 text-xl font-bold leading-snug text-white">
                                    <Link href={`/blog/${post.slug.current}/`} className="hover:text-[#00c8ff]">
                                        {post.title}
                                    </Link>
                                </h2>
                                {post.excerpt && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#8b9ab5]">{post.excerpt}</p>}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    )
}
