import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const revalidate = 60
export const dynamicParams = true

async function getPost(slug: string) {
    const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    "mainImage": coalesce(mainImage, image, coverImage),
    publishedAt,
    excerpt,
    "body": coalesce(body, content, articleBody)[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset-> { _id, url }
      }
    },
    "author": coalesce(author->name, authors[0]->name),
    "categories": categories[]->title,
    seoTitle,
    seoDescription
  }`
    return client.fetch(query, { slug }, { next: { revalidate: 60 } })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return { title: 'Post Not Found' }

    const title = post.seoTitle || `${post.title} - USA Graphene Blog`

    // Clean up excerpt: remove literal [...] and trim
    const cleanExcerpt = post.excerpt ? post.excerpt.replace(/\[\.\.\.\]/g, '').trim() : ''
    const description = post.seoDescription || cleanExcerpt || (post.body ? 'Read our latest article on graphene technology and applications.' : 'USA Graphene Blog')
    const imageUrl = post.mainImage ? urlFor(post.mainImage).url() : '/hero-graphene.jpg'
    const canonicalUrl = `https://www.usa-graphene.com/blog/${slug}/`

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        }
    }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        notFound()
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.mainImage ? urlFor(post.mainImage).url() : 'https://www.usa-graphene.com/hero-graphene.jpg',
        datePublished: post.publishedAt,
        dateModified: post._updatedAt || post.publishedAt,
        author: {
            '@type': 'Person',
            name: post.author || 'USA Graphene Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'USA Graphene',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.usa-graphene.com/logo.png'
            }
        },
    }

    const filteredCategories = post.categories?.filter((cat: string) => cat.toLowerCase() !== 'p') || []

    return (
        <div className="relative isolate min-h-screen bg-[#070d1a] px-6 py-32 lg:px-8 overflow-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,110,240,0.1)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
            />

            <div className="relative mx-auto max-w-3xl text-base leading-7 text-[#8b9ab5]">
                {filteredCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filteredCategories.map((cat: string) => (
                            <span key={cat} className="inline-flex items-center rounded-full bg-[#2d6ef0]/10 border border-[#2d6ef0]/20 px-3 py-1 text-sm font-semibold text-[#00c8ff]">
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">{post.title}</h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm border-b border-white/10 pb-6">
                    <time dateTime={post.publishedAt} className="text-[#8b9ab5] font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#2d6ef0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </time>
                    <div className="text-white font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2d6ef0] to-[#00c8ff] flex items-center justify-center text-xs text-white font-bold">
                            {post.author ? post.author.charAt(0) : 'U'}
                        </div>
                        {post.author}
                    </div>
                </div>
                {post.mainImage && (
                    <div className="mt-10 relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                        <div className="absolute inset-0 bg-[#2d6ef0]/20 blur-xl mix-blend-overlay" />
                        <Image
                            src={urlFor(post.mainImage).url()}
                            alt={post.title}
                            width={800}
                            height={500}
                            className="aspect-[16/9] w-full bg-[#0d1630] object-cover relative z-10"
                        />
                    </div>
                )}
                <div className="mt-12 max-w-2xl mx-auto prose prose-lg prose-invert prose-p:text-[#8b9ab5] prose-headings:text-white prose-headings:font-display prose-a:text-[#00c8ff] hover:prose-a:text-[#2d6ef0] prose-strong:text-white prose-blockquote:border-[#2d6ef0] prose-blockquote:bg-[#0d1630]/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-li:text-[#8b9ab5] prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl">
                    {Array.isArray(post.body)
                        ? <PortableText
                            value={post.body}
                            components={{
                                types: {
                                    image: ({ value }: { value: { asset?: { url?: string }; alt?: string } }) => {
                                        const src = value?.asset?.url || (value?.asset ? urlFor(value).url() : null)
                                        if (!src) return null
                                        return (
                                            <figure className="my-10 relative">
                                                <div className="absolute -inset-4 bg-gradient-to-r from-[#2d6ef0]/10 to-[#00c8ff]/10 rounded-3xl blur-xl" />
                                                <Image
                                                    src={src}
                                                    alt={value?.alt || ''}
                                                    width={800}
                                                    height={450}
                                                    className="w-full rounded-2xl object-cover relative z-10"
                                                />
                                            </figure>
                                        )
                                    },
                                },
                            }}
                          />
                        : typeof post.body === 'string'
                            ? post.body.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)
                            : null}
                </div>
            </div>
        </div >
    )
}
