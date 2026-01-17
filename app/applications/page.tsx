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

const jsonLd = [
    {
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
                    text: 'Yes, graphene significantly enhances concrete performance. Real-world customer testing demonstrated compressive strength of 24.3 MPa at 28 days with less than 0.1% graphene dosage. Graphene-enhanced concrete shows improved durability, reduced cracking, and better overall structural performance for construction applications.',
                },
            },
        ],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: 'Graphene-Enhanced Concrete Sample Testing',
        description: 'Real-world customer testing reaching 24.3 MPa compressive strength at 28 days with graphene-enhanced concrete.',
        thumbnailUrl: [
            'https://usa-graphene.com/graphene_1.jpg'
        ],
        uploadDate: '2025-12-03T09:41:52-05:00',
        contentUrl: 'https://usa-graphene.com/VIDEO-2025-12-03-09-41-52.mp4',
        embedUrl: 'https://usa-graphene.com/applications',
        potentialAction: {
            '@type': 'SeekAction',
            'target': 'https://usa-graphene.com/applications?t={seek_to_second_number}',
            'startOffset-input': 'required name=seek_to_second_number'
        }
    },
    {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: 'Graphene Material Preparation Process',
        description: 'Step-by-step process showing how graphene is integrated into concrete mixtures for enhanced performance.',
        thumbnailUrl: [
            'https://usa-graphene.com/hero-graphene.jpg'
        ],
        uploadDate: '2025-12-03T09:41:56-05:00',
        contentUrl: 'https://usa-graphene.com/VIDEO-2025-12-03-09-41-56.mp4',
        embedUrl: 'https://usa-graphene.com/applications',
        potentialAction: {
            '@type': 'SeekAction',
            'target': 'https://usa-graphene.com/applications?t={seek_to_second_number}',
            'startOffset-input': 'required name=seek_to_second_number'
        }
    }
]

const applications = [
    {
        name: 'Electronics',
        description:
            'Graphene\'s exceptional conductivity makes it ideal for next-generation electronics, including flexible displays, high-frequency transistors, and advanced sensors.',
        icon: Zap,
    },
    {
        name: 'Energy Storage',
        description:
            'Enhance battery performance with graphene-based electrodes. Achieve faster charging times, higher capacity, and longer lifespans for batteries and supercapacitors.',
        icon: Battery,
    },
    {
        name: 'Concrete & Construction',
        description:
            'Real-world customer testing achieved 24.3 MPa compressive strength at 28 days, reaching 54% of design strength (44.8 MPa target). With less than 0.1% graphene dosage, enhance concrete durability, reduce cracking, and improve overall structural performance for construction applications.',
        icon: Building2,
        highlight: true,
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
                                    <div className={`flex flex-col ${application.highlight ? 'relative p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 shadow-lg' : ''}`}>
                                        {application.highlight && (
                                            <div className="absolute -top-3 right-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                                                ✓ Customer Verified
                                            </div>
                                        )}
                                        <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                            <application.icon className={`h-5 w-5 flex-none ${application.highlight ? 'text-primary-700' : 'text-primary-600'}`} aria-hidden="true" />
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

            {/* Video Evidence Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <FadeIn>
                        <div className="mx-auto max-w-2xl lg:text-center mb-16">
                            <h2 className="text-base font-semibold leading-7 text-primary-600">Real-World Evidence</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Graphene-Enhanced Concrete in Action
                            </p>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Watch actual customer testing demonstrations showing graphene-enhanced concrete performance and preparation.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <FadeIn delay={0.1}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl opacity-25 group-hover:opacity-40 blur transition duration-300"></div>
                                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                                    <video
                                        controls
                                        className="w-full aspect-video"
                                        preload="metadata"
                                    >
                                        <source src="/VIDEO-2025-12-03-09-41-52.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="p-6 bg-white">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Concrete Sample Testing
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Demonstration of graphene-enhanced concrete samples achieving verified compressive strength results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl opacity-25 group-hover:opacity-40 blur transition duration-300"></div>
                                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                                    <video
                                        controls
                                        className="w-full aspect-video"
                                        preload="metadata"
                                    >
                                        <source src="/VIDEO-2025-12-03-09-41-56.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="p-6 bg-white">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Material Preparation Process
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Step-by-step process showing how graphene is integrated into concrete mixtures for enhanced performance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Key Results Summary */}
                    <FadeIn delay={0.3}>
                        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
                                <div className="text-3xl font-bold text-primary-600 mb-2">24.3 MPa</div>
                                <div className="text-sm font-medium text-gray-900 mb-1">Compressive Strength</div>
                                <div className="text-xs text-gray-600">Achieved at 28 days</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
                                <div className="text-3xl font-bold text-primary-600 mb-2">&lt; 0.1%</div>
                                <div className="text-sm font-medium text-gray-900 mb-1">Graphene Dosage</div>
                                <div className="text-xs text-gray-600">Ultra-low concentration required</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
                                <div className="text-3xl font-bold text-primary-600 mb-2">54%</div>
                                <div className="text-sm font-medium text-gray-900 mb-1">Design Strength</div>
                                <div className="text-xs text-gray-600">Of 44.8 MPa target at 28 days</div>
                            </div>
                        </div>
                    </FadeIn>
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
            </div >
        </div >
    )
}
