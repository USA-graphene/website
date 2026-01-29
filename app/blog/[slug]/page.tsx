import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const revalidate = 0

async function getPost(slug: string) {
    const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    mainImage,
    publishedAt,
    excerpt,
    body,
    "author": author->name,
    "categories": categories[]->title
  }`
    return client.fetch(query, { slug })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return { title: 'Post Not Found' }

    const title = `${post.title} - USA Graphene Blog`
    const description = post.excerpt || (post.body ? 'Read our latest article on graphene technology and applications.' : 'USA Graphene Blog')
    const imageUrl = post.mainImage ? urlFor(post.mainImage).url() : '/hero-graphene.jpg'

    return {
        title,
        description,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title,
            description,
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
        dateModified: post.publishedAt, // Should ideally be _updatedAt
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

    return (
        <div className="bg-white px-6 py-32 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
                <p className="text-base font-semibold leading-7 text-primary-600">
                    {post.categories && post.categories.join(', ')}
                </p>
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
                    <PortableText value={post.body} />
                </div>
            </div>
        </div >
    )
}
