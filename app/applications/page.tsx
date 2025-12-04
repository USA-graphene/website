import { Metadata } from 'next'
import { Zap, Shield, Disc, Layers, Building2, Battery, ArrowRight, Activity, Droplet } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/FadeIn'

export const metadata: Metadata = {
    title: 'Graphene Applications - Electronics, Energy Storage, Composites | USA Graphene',
    description: 'Discover how graphene is revolutionizing electronics, energy storage, composites, coatings, biomedical devices, and water filtration. Industrial graphene solutions from USA Graphene.',
    alternates: {
        canonical: 'https://usa-graphene.com/applications',
    },
    openGraph: {
        title: 'Graphene Applications - USA Graphene',
        description: 'Discover the versatile applications of graphene in various industries.',
        url: 'https://usa-graphene.com/applications',
        images: [
            {
                url: '/applications-background.jpg',
                width: 1200,
                height: 630,
                alt: 'Graphene Applications',
            },
        ],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What are the main applications of graphene?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Graphene is used in electronics, energy storage, composites, coatings, biomedical devices, and water filtration. Its exceptional conductivity, strength, and versatility make it ideal for next-generation technologies.',
            },
        },
        {
            '@type': 'Question',
            name: 'How does graphene improve battery performance?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Graphene-based electrodes enable faster charging times, higher capacity, and longer lifespans for batteries and supercapacitors due to its high electrical conductivity and surface area.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can graphene be used in construction materials?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, graphene can reinforce materials to create lighter, stronger, and more durable composites for automotive, aerospace, and construction applications.',
            },
        },
    ],
}

const applications = [
    {
        name: 'Electronics',
        description:
            'Graphene’s exceptional conductivity makes it ideal for next-generation electronics, including flexible displays, high-frequency transistors, and advanced sensors.',
        icon: Zap,
    },
    {
        name: 'Energy Storage',
        description:
            'Enhance battery performance with graphene-based electrodes. Achieve faster charging times, higher capacity, and longer lifespans for batteries and supercapacitors.',
        icon: Battery,
    },
    {
        name: 'Composites',
        description:
            'Reinforce materials with graphene to create lighter, stronger, and more durable composites for automotive, aerospace, and construction applications.',
        icon: Shield,
    },
    {
        name: 'Coatings',
        description:
            'Protect surfaces with graphene-enhanced coatings that offer superior corrosion resistance, thermal management, and anti-fouling properties.',
        icon: Layers,
    },
    {
        name: 'Biomedical',
        description:
            'Utilize graphene in biomedical applications such as drug delivery systems, biosensors, and tissue engineering scaffolds due to its biocompatibility.',
        icon: Activity,
    },
    {
        name: 'Water Filtration',
        description:
            'Develop advanced filtration membranes using graphene oxide to efficiently remove contaminants and desalinate water.',
        icon: Droplet,
    },
]

export default function Applications() {
    return (
        <div className="bg-white relative isolate">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image
                    src="/applications-background.jpg"
                    alt="Graphene Applications Background"
                    fill
                    className="object-cover opacity-100"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
            </div>
            <div className="py-24 sm:py-32 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <FadeIn>
                        <div className="mx-auto max-w-2xl lg:text-center">
                            <h2 className="text-base font-semibold leading-7 text-primary-600">Versatility</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Unlimited Potential
                            </p>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Graphene is revolutionizing industries with its unique properties. Explore how our graphene solutions can be applied to your specific needs.
                            </p>
                        </div>
                    </FadeIn>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {applications.map((application, index) => (
                                <FadeIn key={application.name} delay={index * 0.1}>
                                    <div className="flex flex-col">
                                        <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                            <application.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                                            {application.name}
                                        </dt>
                                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                            <p className="flex-auto">{application.description}</p>
                                        </dd>
                                    </div>
                                </FadeIn>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-600">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Want to test graphene in your application?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
                            Discover how our materials can revolutionize your products.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/contact"
                                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white flex items-center gap-2"
                            >
                                Request a sample & call
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
