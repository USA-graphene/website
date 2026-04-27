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
      productType,
      price,
      "heroImage": heroImage{asset->{url}}
    }`,
        { slug }
    )

    if (!product) {
        return {}
    }

    const title = product.seoTitle || `${product.title} - USA Graphene`
    const description = product.seoDescription || product.shortDescription || `High-quality ${product.title} from USA Graphene. Industrial-grade graphene solutions.`

    return {
        title,
        description,
        alternates: {
            canonical: `/products/${slug}/`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://www.usa-graphene.com/products/${slug}/`,
            images: product.heroImage?.asset?.url ? [
                {
                    url: product.heroImage.asset.url,
                    width: 1200,
                    height: 630,
                    alt: product.title,
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
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
            url: `https://www.usa-graphene.com/products/${product.slug.current}/`,
            priceCurrency: 'USD',
            price: product.price || '0',
            priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: 'https://schema.org/InStock',
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'US',
                returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
                merchantReturnDays: 0,
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'US',
                },
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: '0',
                    currency: 'USD',
                },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 1,
                        maxValue: 5,
                        unitCode: 'DAY',
                    },
                    transitTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 5,
                        maxValue: 14,
                        unitCode: 'DAY',
                    },
                },
            },
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            ratingCount: '18',
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="relative isolate min-h-screen bg-[#070d1a] text-[#e8edf5]">
                {/* Background layers */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(45,110,240,0.13)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.035]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 52,16 52,44 30,58 8,44 8,16' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}
                />

                {/* HERO */}
                <section className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 grid gap-12 lg:grid-cols-[1.3fr,1fr] items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#00c8ff] mb-6">
                            USA-Graphene • {product.productType === 'machine' ? 'Production Machine' : 'Graphene Materials'}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white font-display">
                            {product.title}
                        </h1>
                        {product.shortDescription && (
                            <p className="text-[#8b9ab5] text-lg max-w-xl mb-8 leading-8">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-6 mb-10">
                            {hasPrice && (
                                <div className="text-2xl font-bold text-white font-display">
                                    {priceLabel}
                                </div>
                            )}
                            {!hasPrice && priceLabel && (
                                <div className="text-lg font-semibold text-[#8b9ab5]">
                                    {priceLabel}
                                </div>
                            )}

                            {product.primaryCtaUrl && (
                                <Link
                                    href={product.primaryCtaUrl}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2d6ef0] to-[#1a55d0] hover:from-[#3a7af5] hover:to-[#2d6ef0] transition-all shadow-[0_4px_20px_rgba(45,110,240,0.35)] hover:shadow-[0_8px_32px_rgba(45,110,240,0.5)] hover:-translate-y-0.5"
                                >
                                    {ctaLabel}
                                </Link>
                            )}
                        </div>

                        {product.featureBullets && product.featureBullets.length > 0 && (
                            <ul className="grid gap-3 text-sm text-white/90">
                                {product.featureBullets.map((item, index) => (
                                    <li key={index} className="flex gap-3 items-start">
                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#00c8ff] flex-shrink-0" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#2d6ef0]/20 to-[#00c8ff]/10 rounded-3xl blur-2xl" />
                        <div className="relative rounded-3xl border border-white/10 bg-[#0d1630]/80 backdrop-blur-xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                            {imageUrl ? (
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#070d1a]">
                                    <Image
                                        src={imageUrl}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070d1a]/80 via-transparent to-transparent opacity-60" />
                                </div>
                            ) : (
                                <div className="aspect-[4/3] rounded-2xl border border-dashed border-white/10 bg-white/5 flex items-center justify-center text-sm text-[#8b9ab5]">
                                    Product image coming soon
                                </div>
                            )}

                            <div className="mt-6 text-sm text-[#8b9ab5] space-y-2 px-2 pb-2">
                                <p>
                                    Turbostratic graphene produced in the USA. Engineered for high
                                    dispersion and industrial scale.
                                </p>
                                <p>
                                    Need bulk orders or a custom application?{' '}
                                    <Link
                                        href="/contact/"
                                        className="text-[#2d6ef0] hover:text-[#00c8ff] font-medium transition-colors"
                                    >
                                        Talk to our team →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SPECS + STORY */}
                <section className="relative max-w-7xl mx-auto px-6 pb-32 grid gap-12 lg:grid-cols-[1.1fr,1fr]">
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-6 text-white font-display">Why this matters</h2>
                        <p className="text-base leading-7 text-[#8b9ab5] mb-6">
                            Most “graphene” on the market is poorly characterized carbon.
                            USA-Graphene machines use flash-joule heating to convert high
                            quality carbon into turbostratic graphene with excellent dispersion,
                            enabling real performance gains in rubber, plastics, cement and
                            energy storage.
                        </p>
                        <p className="text-base leading-7 text-[#8b9ab5]">
                            When you work with us, you are not just buying powder or a machine.
                            You are getting process know-how from a team actually running
                            equipment and shipping graphene every day.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {product.techSpecs && product.techSpecs.length > 0 && (
                            <div className="rounded-3xl border border-[#2d6ef0]/20 bg-[#0d1630]/60 backdrop-blur-md p-8">
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5] mb-6">Key Specifications</h3>
                                <dl className="space-y-3 text-sm">
                                    {product.techSpecs.map((spec, index) => (
                                        <div key={index} className="flex justify-between gap-4 border-b border-white/10 pb-3">
                                            <dt className="text-[#8b9ab5]">{spec.label}</dt>
                                            <dd className="font-semibold text-white text-right">{spec.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {product.downloads && product.downloads.length > 0 && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5] mb-6">Downloads & Resources</h3>
                                <div className="space-y-3">
                                    {product.downloads.map((download, index) => (
                                        <a
                                            key={index}
                                            href={download.asset.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#2d6ef0]/50 hover:bg-[#2d6ef0]/10 transition-all group"
                                        >
                                            <div className="flex-shrink-0 p-2 rounded-lg bg-[#2d6ef0]/20 text-[#00c8ff]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-white group-hover:text-[#00c8ff] transition-colors">
                                                    {download.description || 'Download PDF'}
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-[#8b9ab5] group-hover:text-[#00c8ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    )
}
