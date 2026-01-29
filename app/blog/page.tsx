import { client, urlFor } from '@/lib/sanity'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Graphene Production News & Industry Insights | USA Graphene Blog',
    description: 'Explore the latest breakthroughs in graphene technology, industrial applications in concrete and plastics, and graphene price trends for 2025 and beyond.',
    alternates: {
        canonical: '/blog',
    },
}

export const revalidate = 0

async function getPosts() {
    const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage {
      asset->{
        _id,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    },
    publishedAt,
    excerpt,
    "author": author->name,
    "categories": categories[]->title
  }`
    return client.fetch(query)
}

export default async function Blog() {
    const posts = await getPosts()

    return (
        <div className="bg-gray-50 py-24 sm:py-32 min-h-screen">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">From the Blog</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600">
                        Insights, updates, and breakthroughs from the world of graphene.
                    </p>
                </div>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {posts.map((post: any) => (
                        <article
                            key={post._id}
                            className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 mb-8"
                        >
                            <div className="relative w-full overflow-hidden rounded-xl">
                                {post.mainImage && (
                                    <Image
                                        src={urlFor(post.mainImage).url()}
                                        alt={post.title}
                                        width={post.mainImage.asset?.metadata?.dimensions?.width || 800}
                                        height={post.mainImage.asset?.metadata?.dimensions?.height || 600}
                                        className="w-full h-auto object-cover transform transition-transform duration-500 hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                )}
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center gap-x-4 text-xs mb-4">
                                    <time dateTime={post.publishedAt} className="text-gray-500">
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : ''}
                                    </time>
                                    {post.categories && post.categories.map((category: string) => (
                                        <span
                                            key={category}
                                            className="relative z-10 rounded-full bg-primary-50 px-3 py-1.5 font-medium text-primary-600"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                                <div className="group relative">
                                    <h3 className="text-xl font-bold leading-snug text-gray-900 group-hover:text-primary-600 transition-colors">
                                        <Link href={`/blog/${encodeURIComponent(post.slug.current)}`}>
                                            <span className="absolute inset-0" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                                </div>
                                <div className="relative mt-6 flex items-center gap-x-4 border-t border-gray-100 pt-4">
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-gray-900">
                                            {post.author}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    )
}
