import { client } from '@/lib/sanity'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Products - USA Graphene',
    description: 'High-quality turbostratic graphene materials and production equipment.',
    openGraph: {
        title: 'Graphene Materials & Machinery | USA Graphene Products',
        description: 'Browse our catalog of turbostratic graphene powder, conductive inks, and industrial production machinery.',
        url: 'https://usa-graphene.com/products',
        siteName: 'USA Graphene',
        images: [
            {
                url: '/hero-graphene.jpg', // Using hero image as fallback for listing page
                width: 1200,
                height: 800,
                alt: 'USA Graphene Products Catalog',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    alternates: {
        canonical: '/products',
    },
}

export const revalidate = 60

async function getProducts() {
    return client.fetch(`
    *[_type == "product"] | order(sortOrder asc, _createdAt desc) {
      _id,
      title,
      slug,
      productType,
      shortDescription,
      "heroImage": heroImage{asset->{url}},
      price,
      unit
    }
  `)
}

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="max-w-2xl mx-auto lg:mx-0 mb-16">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Our Products</h1>
                    <p className="mt-4 text-lg leading-8 text-slate-300">
                        Industrial-grade graphene materials and production technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product: any) => (
                        <Link
                            key={product._id}
                            href={`/products/${product.slug.current}`}
                            className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-colors duration-300"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                                {product.heroImage?.asset?.url ? (
                                    <Image
                                        src={product.heroImage.asset.url}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center rounded-full bg-slate-950/90 px-2.5 py-0.5 text-xs font-medium text-sky-400 ring-1 ring-inset ring-sky-400/20 backdrop-blur-sm">
                                        {product.productType === 'machine' ? 'Machine' : 'Material'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="text-xl font-semibold text-white group-hover:text-sky-400 transition-colors">
                                    {product.title}
                                </h3>
                                {product.shortDescription && (
                                    <p className="mt-3 text-sm leading-6 text-slate-400 line-clamp-3">
                                        {product.shortDescription}
                                    </p>
                                )}

                                <div className="mt-auto pt-6 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-300">
                                        {product.price
                                            ? `$${product.price.toLocaleString()}${product.unit ? ` / ${product.unit}` : ''}`
                                            : 'Request Quote'
                                        }
                                    </p>
                                    <span className="text-sm font-semibold text-sky-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        View Details <span aria-hidden="true">&rarr;</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
