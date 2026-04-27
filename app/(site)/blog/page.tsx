import { client, urlFor } from '@/lib/sanity'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Graphene Production News & Industry Insights | USA Graphene Blog',
    description: 'Explore the latest breakthroughs in graphene technology, industrial applications in concrete and plastics, and graphene price trends for 2025 and beyond.',
    alternates: {
        canonical: '/blog/',
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
        <div className="relative isolate min-h-screen bg-[#070d1a] py-24 sm:py-32 overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,110,240,0.1)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
            />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 mb-16">
                    <p className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5] mb-2">Knowledge Base</p>
                    <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">From the Blog</h2>
                    <p className="mt-4 text-lg leading-8 text-[#8b9ab5]">
                        Insights, updates, and breakthroughs from the world of graphene.
                    </p>
                </div>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {posts.map((post: any) => (
                        <article
                            key={post._id}
                            className="break-inside-avoid rounded-3xl bg-[#0d1630]/60 backdrop-blur-md p-6 border border-white/10 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(45,110,240,0.15)] hover:border-[#2d6ef0]/50 hover:-translate-y-1 mb-8 group"
                        >
                            <div className="relative w-full overflow-hidden rounded-2xl bg-[#070d1a]">
                                {post.mainImage ? (
                                    <Image
                                        src={urlFor(post.mainImage).url()}
                                        alt={post.title}
                                        width={post.mainImage.asset?.metadata?.dimensions?.width || 800}
                                        height={post.mainImage.asset?.metadata?.dimensions?.height || 600}
                                        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-white/5 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                                        <span className="text-sm text-[#8b9ab5]">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs mb-4">
                                    <time dateTime={post.publishedAt} className="text-[#8b9ab5] font-medium">
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : ''}
                                    </time>
                                    <div className="flex gap-2">
                                        {post.categories && post.categories.map((category: string) => (
                                            <span
                                                key={category}
                                                className="relative z-10 rounded-full bg-[#2d6ef0]/10 border border-[#2d6ef0]/20 px-3 py-1 font-medium text-[#00c8ff]"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="group/title relative">
                                    <h3 className="text-xl font-bold leading-snug text-white group-hover/title:text-[#00c8ff] transition-colors font-display">
                                        <Link href={`/blog/${post.slug.current}/`}>
                                            <span className="absolute inset-0" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#8b9ab5]">{post.excerpt}</p>
                                </div>
                                <div className="relative mt-6 flex items-center gap-x-4 border-t border-white/10 pt-4">
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-white">
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
