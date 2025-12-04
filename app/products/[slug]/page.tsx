import { client } from '@/lib/sanity'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type TechSpec = { label: string; value: string }
type Download = {
    asset: { url: string }
    description?: string
}

type Product = {
    title: string
    slug: { current: string }
    productType: string
    shortDescription?: string
    heroImage?: { asset: { url: string } }
    price?: number
    unit?: string
    primaryCtaType?: 'buy' | 'quote' | 'demo'
    primaryCtaLabel?: string
    primaryCtaUrl?: string
    featureBullets?: string[]
    techSpecs?: TechSpec[]
    downloads?: Download[]
    body?: any
    seoTitle?: string
    seoDescription?: string
}

export const revalidate = 60 // Revalidate every 60 seconds

export async function generateStaticParams() {
    const products = await client.fetch(
        `*[_type == "product" && defined(slug.current)]{
      "slug": slug.current
    }`
    )

    return products.map((p: any) => ({
        slug: p.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const product = await client.fetch(
        `*[_type == "product" && slug.current == $slug][0]{
      title,
      seoTitle,
      seoDescription,
      shortDescription,
      "heroImage": heroImage{asset->{url}}
    }`,
        { slug }
    )

    if (!product) {
        return {}
    }

    return {
        title: product.seoTitle || product.title,
        description: product.seoDescription || product.shortDescription,
        openGraph: {
            images: product.heroImage?.asset?.url ? [product.heroImage.asset.url] : [],
        },
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const product: Product | null = await client.fetch(
        `*[_type == "product" && slug.current == $slug][0]{
      title,
      slug,
      productType,
      shortDescription,
      "heroImage": heroImage{asset->{url}},
      price,
      unit,
      primaryCtaType,
      primaryCtaLabel,
      primaryCtaUrl,
      featureBullets,
      techSpecs,
      "downloads": downloads[]{
        "asset": asset->{url},
        description
      },
      seoTitle,
      seoDescription
    }`,
        { slug }
    )

    if (!product) {
        notFound()
    }

    const imageUrl = product.heroImage?.asset?.url
    const hasPrice = typeof product.price === 'number'
    const priceLabel = hasPrice
        ? `$${product.price?.toLocaleString()}${product.unit ? ' / ' + product.unit : ''}`
        : product.unit || ''

    const ctaLabel =
        product.primaryCtaLabel ||
        (product.primaryCtaType === 'buy'
            ? 'Buy Now'
            : product.primaryCtaType === 'demo'
                ? 'Book Demo'
                : 'Request Quote')

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: imageUrl,
        description: product.shortDescription || product.seoDescription,
        brand: {
            '@type': 'Brand',
            name: 'USA Graphene',
        },
        offers: {
            '@type': 'Offer',
            url: `https://usa-graphene.com/products/${product.slug.current}`,
            priceCurrency: 'USD',
            price: product.price,
            availability: 'https://schema.org/InStock',
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="min-h-screen bg-slate-950 text-slate-50">

                {/* HERO */}
                <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-[1.3fr,1fr] items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-sky-400 mb-3">
                            USA-Graphene • {product.productType === 'machine' ? 'Production Machine' : 'Graphene Materials'}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
                            {product.title}
                        </h1>
                        {product.shortDescription && (
                            <p className="text-slate-300 text-sm md:text-base max-w-xl mb-6">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            {hasPrice && (
                                <div className="text-lg font-medium text-sky-300">
                                    {priceLabel}
                                </div>
                            )}
                            {!hasPrice && priceLabel && (
                                <div className="text-sm font-medium text-slate-300">
                                    {priceLabel}
                                </div>
                            )}

                            {product.primaryCtaUrl && (
                                <Link
                                    href={product.primaryCtaUrl}
                                    className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-sky-500 hover:bg-sky-400 transition shadow-lg shadow-sky-500/30"
                                >
                                    {ctaLabel}
                                </Link>
                            )}
                        </div>

                        {product.featureBullets && product.featureBullets.length > 0 && (
                            <ul className="grid gap-2 text-sm text-slate-200">
                                {product.featureBullets.map((item, index) => (
                                    <li key={index} className="flex gap-2">
                                        <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 rounded-3xl bg-sky-500/10 blur-xl" />
                        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4">
                            {imageUrl ? (
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                                    <Image
                                        src={imageUrl}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[4/3] rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
                                    Product image coming soon
                                </div>
                            )}

                            <div className="mt-4 text-xs text-slate-400 space-y-1">
                                <p>
                                    Turbostratic graphene produced in the USA. Engineered for high
                                    dispersion and industrial scale.
                                </p>
                                <p>
                                    Need bulk orders or a custom application?{' '}
                                    <Link
                                        href="/contact"
                                        className="underline decoration-sky-400/60 hover:decoration-sky-300"
                                    >
                                        Talk to our team
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SPECS + STORY */}
                <section className="max-w-6xl mx-auto px-6 pb-24 grid gap-12 md:grid-cols-[1.1fr,1fr]">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Why this matters</h2>
                        <p className="text-sm text-slate-300 mb-4">
                            Most “graphene” on the market is poorly characterized carbon.
                            USA-Graphene machines use flash-joule heating to convert high
                            quality carbon into turbostratic graphene with excellent dispersion,
                            enabling real performance gains in rubber, plastics, cement and
                            energy storage.
                        </p>
                        <p className="text-sm text-slate-300">
                            When you work with us, you are not just buying powder or a machine.
                            You are getting process know-how from a team actually running
                            equipment and shipping graphene every day.
                        </p>
                    </div>

                    {product.techSpecs && product.techSpecs.length > 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                            <h3 className="text-sm font-semibold mb-3">Key Specifications</h3>
                            <dl className="space-y-2 text-xs text-slate-200">
                                {product.techSpecs.map((spec, index) => (
                                    <div key={index} className="flex justify-between gap-4 border-b border-slate-800/80 pb-1">
                                        <dt className="text-slate-400">{spec.label}</dt>
                                        <dd className="font-medium text-right">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {product.downloads && product.downloads.length > 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mt-6">
                            <h3 className="text-sm font-semibold mb-3">Downloads & Resources</h3>
                            <div className="space-y-2">
                                {product.downloads.map((download, index) => (
                                    <a
                                        key={index}
                                        href={download.asset.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                                    >
                                        <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
                                                {download.description || 'Download PDF'}
                                            </p>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </>
    )
}
