import { Metadata } from 'next'
import { Microscope, Settings, Layers, Activity, Zap } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Industrial Graphene Production Equipment & Machinery | USA Graphene',
    description: 'Explore our advanced graphene production equipment, including automated Advanced Pulsed Electrical Reactor systems for bulk turbostratic graphene, CVD reactors, and characterization tools.',
    keywords: [
        'Graphene Production Equipment',
        'Advanced Pulsed Electrical Reactor',
        'Turbostratic Graphene Reactor',
        'CVD Graphene Systems',
        'Graphene Exfoliation Unit',
        'Industrial Graphene Machinery',
        'Bulk Graphene Synthesis'
    ],
    openGraph: {
        title: 'Industrial Graphene Production Equipment | USA Graphene',
        description: 'Automated Advanced Pulsed Electrical Reactor systems and CVD reactors for scalable graphene production.',
        url: 'https://www.usa-graphene.com/equipment/',
        siteName: 'USA Graphene',
        images: [
            {
                url: '/flash-graphene-machine.jpg',
                width: 1024,
                height: 1024,
                alt: 'Automated Pulsed Electrical Reactor Graphene Machine',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    alternates: {
        canonical: '/equipment/',
    },
}

const equipment = [
    {
        name: 'CVD Systems',
        description: 'High-precision Chemical Vapor Deposition (CVD) systems specifically engineered for growing high-quality monolayer graphene on copper and nickel substrates.',
        icon: Layers,
    },
    {
        name: 'Exfoliation Units',
        description: 'Industrial-scale liquid phase exfoliation systems designed for producing high-yield graphene nanoplatelets and conductive inks.',
        icon: Settings,
    },
    {
        name: 'Characterization Suite',
        description: 'Comprehensive analysis tools including Raman Spectroscopy, AFM, and SEM for precise quality control and material verification.',
        icon: Microscope,
    },
    {
        name: 'Transfer Systems',
        description: 'Automated polymer-assisted transfer systems for clean, damage-free deposition of graphene onto arbitrary substrates.',
        icon: Activity,
    },
    {
        name: 'Pulsed Electrical resistive carbon conversion system',
        description: 'A scalable pulsed electrical carbon conversion technology that transforms carbon feedstocks into turbostratic graphene using rapid high-temperature electrical pulses in modular reactors.',
        icon: Zap,
    },
]

export default function Equipment() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Pulsed Electrical Reactor Machine',
        'description': 'Fully automated Advanced Pulsed Electrical Reactor capable of producing 20g of turbostratic graphene in 20 seconds.',
        'brand': {
            '@type': 'Brand',
            'name': 'USA Graphene'
        },
        'image': 'https://www.usa-graphene.com/flash-graphene-machine.jpg',
        'category': 'Industrial Machinery',
        'offers': {
            '@type': 'Offer',
            'availability': 'https://schema.org/InStock',
            'price': '0',
            'priceCurrency': 'USD',
            'priceValidUntil': `${new Date().getFullYear() + 1}-12-31`,
            'url': 'https://www.usa-graphene.com/equipment/',
            'hasMerchantReturnPolicy': {
                '@type': 'MerchantReturnPolicy',
                'applicableCountry': 'US',
                'returnPolicyCategory': 'https://schema.org/MerchantReturnNotPermitted',
                'merchantReturnDays': 0
            },
            'shippingDetails': {
                '@type': 'OfferShippingDetails',
                'shippingDestination': {
                    '@type': 'DefinedRegion',
                    'addressCountry': 'US'
                },
                'shippingRate': {
                    '@type': 'MonetaryAmount',
                    'value': '0',
                    'currency': 'USD'
                },
                'deliveryTime': {
                    '@type': 'ShippingDeliveryTime',
                    'handlingTime': {
                        '@type': 'QuantitativeValue',
                        'minValue': 1,
                        'maxValue': 5,
                        'unitCode': 'DAY'
                    },
                    'transitTime': {
                        '@type': 'QuantitativeValue',
                        'minValue': 5,
                        'maxValue': 14,
                        'unitCode': 'DAY'
                    }
                }
            }
        },
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '5',
            'ratingCount': '24'
        }
    }

    return (
        <div className="relative isolate overflow-hidden bg-[#070d1a] min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(45,110,240,0.13)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
            />
            {/* Background image with dark overlay */}
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image src="/graphene_1.jpg" alt="Graphene Production Laboratory" fill className="object-cover opacity-10" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-[#070d1a]/80 via-[#070d1a]/95 to-[#070d1a]" />
            </div>

            <div className="py-24 sm:py-32 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <p className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5]">Technology</p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                            Advanced Graphene Production Equipment
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-[#8b9ab5]">
                            We manufacture and supply cutting-edge machinery designed specifically for the scalable production, processing, and analysis of industrial-grade graphene materials.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                            {equipment.map((item) => (
                                <div key={item.name} className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                                    <dt className="flex items-center gap-x-4 text-lg font-bold leading-7 text-white font-display">
                                        <div className="flex-shrink-0 p-3 bg-[#2d6ef0]/20 rounded-xl border border-[#2d6ef0]/30">
                                            <item.icon className="h-6 w-6 text-[#00c8ff]" aria-hidden="true" />
                                        </div>
                                        {item.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#8b9ab5]">
                                        <p className="flex-auto">{item.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Pulsed Electrical Reactor Section */}
                    <div className="mt-32 overflow-hidden rounded-3xl border border-[#2d6ef0]/30 bg-gradient-to-br from-[#0d1630] to-[#070d1a] shadow-[0_0_40px_rgba(45,110,240,0.15)] lg:grid lg:grid-cols-2 lg:gap-4 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2d6ef0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="px-6 pb-12 pt-10 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 lg:pl-20 relative z-10">
                            <div className="lg:self-center">
                                <div className="flex items-center gap-x-3 mb-6">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                                        <Zap className="h-5 w-5 text-amber-400" />
                                    </span>
                                    <h2 className="text-sm font-semibold tracking-widest uppercase text-amber-400">Pulsed Electrical Carbon Conversion</h2>
                                </div>
                                <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                                    High-Yield Graphene Conversion Reactor
                                </h3>
                                <p className="mt-6 text-lg leading-8 text-white/90">
                                    Advanced pulsed electrical reactor capable of converting 20 grams of carbon feedstock into high-purity turbostratic graphene in 20-second cycles using controlled high-temperature electrical pulses.
                                </p>
                                <div className="mt-8 text-base leading-7 text-[#8b9ab5] space-y-4">
                                    <p>
                                        Experience the next generation of material synthesis with our automated Pulsed Electrical Resistive Carbon Conversion System. This industrial reactor uses precisely controlled high-temperature electrical pulses to rapidly convert carbon materials into turbostratic few-layer graphene without the use of chemical reagents.
                                    </p>
                                    <ul className="list-none space-y-3 mt-6">
                                        {[
                                            { title: 'Rapid Production', desc: 'Produces 20 g graphene batches in ~20-second cycles.' },
                                            { title: 'Chemical-Free', desc: 'High-temperature electrical conversion without solvents.' },
                                            { title: 'Energy Efficient', desc: 'Electrical pulses deliver energy directly to the carbon feedstock.' },
                                            { title: 'Industrial Scalability', desc: 'Modular reactor architecture allows parallel operation.' },
                                        ].map((feature) => (
                                            <li key={feature.title} className="flex gap-x-3">
                                                <div className="h-1.5 w-1.5 mt-2.5 rounded-full bg-[#00c8ff] flex-shrink-0" />
                                                <span><strong className="text-white">{feature.title}:</strong> {feature.desc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-h-9 aspect-w-16 lg:aspect-none lg:h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1630] to-transparent z-10 hidden lg:block w-32" />
                            <Image
                                className="w-full h-full object-cover bg-gray-800 lg:h-full"
                                src="/flash-graphene-machine.jpg"
                                alt="Automated Pulsed Electrical Reactor Graphene Machine"
                                width={1024}
                                height={1024}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
