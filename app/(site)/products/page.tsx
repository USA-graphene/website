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
        url: 'https://www.usa-graphene.com/products/',
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
        canonical: '/products/',
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
        <main className="relative isolate min-h-screen bg-[#070d1a] py-24 sm:py-32">
            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_20%,rgba(45,110,240,0.13)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 52,16 52,44 30,58 8,44 8,16' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}
            />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 mb-16">
                    <p className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5]">Catalog</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl font-display">
                        Our Products
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-[#8b9ab5]">
                        Industrial-grade graphene materials and production technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product: any) => (
                        <Link
                            key={product._id}
                            href={`/products/${product.slug.current}/`}
                            className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#0d1630]/80 backdrop-blur-md border border-white/10 hover:border-[#2d6ef0]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(45,110,240,0.15)] hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070d1a]">
                                {product.heroImage?.asset?.url ? (
                                    <Image
                                        src={product.heroImage.asset.url}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-[#8b9ab5]">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1630] via-transparent to-transparent opacity-80" />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center rounded-full bg-[#070d1a]/90 px-3 py-1 text-xs font-semibold text-[#00c8ff] border border-[#00c8ff]/30 backdrop-blur-sm">
                                        {product.productType === 'machine' ? 'Machine' : 'Material'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="text-xl font-bold text-white group-hover:text-[#00c8ff] transition-colors font-display">
                                    {product.title}
                                </h3>
                                {product.shortDescription && (
                                    <p className="mt-3 text-sm leading-6 text-[#8b9ab5] line-clamp-3">
                                        {product.shortDescription}
                                    </p>
                                )}

                                <div className="mt-auto pt-6 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">
                                        {product.price
                                            ? `$${product.price.toLocaleString()}${product.unit ? ` / ${product.unit}` : ''}`
                                            : 'Request Quote'
                                        }
                                    </p>
                                    <span className="text-sm font-semibold text-[#2d6ef0] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
