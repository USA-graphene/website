import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

async function getPost(slug: string) {
    const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    mainImage,
    publishedAt,
    body,
    "author": author->name,
    "categories": categories[]->title
  }`
    return client.fetch(query, { slug })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug)
    if (!post) return { title: 'Post Not Found' }
    return {
        title: `${post.title} - USA Graphene`,
    }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="bg-white px-6 py-32 lg:px-8">
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
        </div>
    )
}
