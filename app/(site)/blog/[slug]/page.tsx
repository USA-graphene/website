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
    "body": coalesce(body, content, articleBody),
    "author": coalesce(author->name, authors[0]->name),
    "categories": categories[]->title,
    seoTitle,
    seoDescription
  }`
    return client.fetch(query, { slug })
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
        <div className="bg-white px-6 py-32 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
                {filteredCategories.length > 0 && (
                    <p className="text-base font-semibold leading-7 text-primary-600">
                        {filteredCategories.join(', ')}
                    </p>
                )}
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
                <div className="mt-6 flex items-center gap-x-4 text-xs">
                    <time dateTime={post.publishedAt} className="text-gray-500">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                    </time>
                    <div className="text-gray-500">By {post.author}</div>
                </div>
                {post.mainImage && (
                    <div className="mt-10">
                        <Image
                            src={urlFor(post.mainImage).url()}
                            alt={post.title}
                            width={800}
                            height={500}
                            className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover"
                        />
                    </div>
                )}
                <div className="mt-10 max-w-2xl prose prose-lg prose-primary mx-auto">
                    {Array.isArray(post.body)
                        ? <PortableText value={post.body} />
                        : typeof post.body === 'string'
                            ? post.body.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)
                            : null}
                </div>
            </div>
        </div >
    )
}
