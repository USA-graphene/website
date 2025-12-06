import { Metadata } from 'next'
import { Microscope, Settings, Layers, Activity, Zap } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Industrial Graphene Production Equipment & Machinery | USA Graphene',
    description: 'Explore our advanced graphene production equipment, including automated Flash Joule Heating systems for bulk turbostratic graphene, CVD reactors, and characterization tools.',
    keywords: [
        'Graphene Production Equipment',
        'Flash Joule Heating Machine',
        'Turbostratic Graphene Reactor',
        'CVD Graphene Systems',
        'Graphene Exfoliation Unit',
        'Industrial Graphene Machinery',
        'Bulk Graphene Synthesis'
    ],
    openGraph: {
        title: 'Industrial Graphene Production Equipment | USA Graphene',
        description: 'Automated Flash Joule Heating systems and CVD reactors for scalable graphene production.',
        url: 'https://usa-graphene.com/equipment',
        siteName: 'USA Graphene',
        images: [
            {
                url: '/flash-graphene-machine.jpg',
                width: 1024,
                height: 1024,
                alt: 'Automated Flash Joule Heating Graphene Machine',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    alternates: {
        canonical: '/equipment',
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
        name: 'Flash Graphene Reactors',
        description: 'Automated Flash Joule Heating (FJH) systems for rapid, solvent-free bulk production of high-purity turbostratic graphene.',
        icon: Zap,
    },
]

export default function Equipment() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Flash Graphene Production Machine',
        'description': 'Fully automated Flash Joule Heating machine capable of producing 20g of turbostratic graphene in 20 seconds.',
        'brand': {
            '@type': 'Brand',
            'name': 'USA Graphene'
        },
        'image': 'https://usa-graphene.com/flash-graphene-machine.jpg',
        'category': 'Industrial Machinery'
    }

    return (
        <div className="bg-white relative isolate">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image
                    src="/graphene_1.jpg"
                    alt="Graphene Production Laboratory"
                    fill
                    className="object-cover opacity-100"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white" />
            </div>
            <div className="py-24 sm:py-32 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-600">Technology</h2>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Advanced Graphene Production Equipment
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We manufacture and supply cutting-edge machinery designed specifically for the scalable production, processing, and analysis of industrial-grade graphene materials.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                            {equipment.map((item) => (
                                <div key={item.name} className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <item.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                                        {item.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{item.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Flash Graphene Machine Section */}
                    <div className="mt-32 overflow-hidden bg-gray-900 rounded-3xl shadow-2xl lg:grid lg:grid-cols-2 lg:gap-4">
                        <div className="px-6 pb-12 pt-10 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 lg:pl-20">
                            <div className="lg:self-center">
                                <div className="flex items-center gap-x-3 mb-4">
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                    <h2 className="text-base font-semibold leading-7 text-yellow-400">Flash Joule Heating Technology</h2>
                                </div>
                                <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    High-Yield Flash Graphene Reactor
                                </h3>
                                <p className="mt-6 text-lg leading-8 text-gray-300">
                                    Revolutionary FJH system capable of producing 20 grams of high-purity turbostratic graphene in just 20 seconds.
                                </p>
                                <div className="mt-4 text-base leading-7 text-gray-400 space-y-4">
                                    <p>
                                        Experience the future of material synthesis with our automated Flash Joule Heating (FJH) reactor. This powerhouse is engineered for unprecedented speed and precision, instantly converting carbon precursors into high-quality turbostratic graphene.
                                    </p>
                                    <p>
                                        <strong>Key Advantages:</strong>
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Rapid Production:</strong> Synthesizes 20g batches in 20-second cycles.</li>
                                        <li><strong>Eco-Friendly:</strong> Solvent-free, chemical-free process with low energy consumption.</li>
                                        <li><strong>Industrial Scalability:</strong> Designed for continuous operation to meet bulk demand.</li>
                                    </ul>
                                    <p>
                                        This technology redefines scalability, making industrial-grade graphene accessible for applications in concrete, composites, and energy storage.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="aspect-h-9 aspect-w-16 mask-gradient lg:aspect-none lg:h-full">
                            <Image
                                className="w-full h-full object-cover bg-gray-800 lg:h-full"
                                src="/flash-graphene-machine.jpg"
                                alt="Automated Flash Joule Heating Graphene Machine"
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
