import { Metadata } from 'next'
import Image from 'next/image'
import { FadeIn } from '@/components/FadeIn'

export const metadata: Metadata = {
    title: 'About Us - USA Graphene',
    description: 'Learn about our mission to revolutionize industries with graphene. We are a team of makers and engineers building the future of carbon materials.',
    alternates: {
        canonical: 'https://usa-graphene.com/about',
    },
    openGraph: {
        title: 'About Us - USA Graphene',
        description: 'Learn about our mission to revolutionize industries with graphene.',
        url: 'https://usa-graphene.com/about',
        images: [
            {
                url: '/about-background.jpg',
                width: 1200,
                height: 630,
                alt: 'USA Graphene Team',
            },
        ],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://usa-graphene.com',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'About Us',
            item: 'https://usa-graphene.com/about',
        },
    ],
}

const stats = [
    { label: 'Founded', value: '2021' },
    { label: 'Employees', value: '50+' },
    { label: 'Countries', value: '12' },
    { label: 'Patents', value: '25+' },
]

export default function About() {
    return (
        <div className="relative isolate overflow-hidden bg-white px-6 py-32 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image
                    src="/about-background.jpg"
                    alt="Graphene Background"
                    fill
                    className="object-cover object-right opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white" />
            </div>
            <FadeIn>
                <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 relative">
                    <p className="text-base font-semibold leading-7 text-primary-600">About Us</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        We’re not just manufacturing graphene and graphene making equipment. <br />
                        <span className="text-primary-600">We’re believing in it.</span>
                    </h1>
                    <div className="mt-10 max-w-2xl space-y-8">
                        <p className="text-xl leading-8">
                            At USA-Graphene, we’re a team of makers, engineers, and dreamers united by one idea: carbon can change everything. We believe in the quiet power of a single atom arranged just right. We believe in breakthroughs born from black powder. We believe that the future isn’t found—it’s built.
                        </p>
                        <p>
                            We’re a startup rooted in the USA, driven not by hype, but by conviction—that this one material can unlock cleaner energy, stronger structures, faster electronics, and smarter design. And we’re here to make it real.
                        </p>
                        <p>
                            Our machines hum with purpose. Our hands carry the dust of ambition. Our mission? Bring this wonder material out of the lab and into the world—where it belongs.
                        </p>
                        <div className="border-l-4 border-primary-600 pl-6 italic bg-white/50 backdrop-blur-sm rounded-r-lg py-2">
                            <p className="font-semibold text-gray-900">
                                Graphene isn’t just a product to us.
                            </p>
                            <p className="mt-2 font-semibold text-gray-900">
                                It’s a movement.
                            </p>
                            <p className="mt-2 font-semibold text-gray-900">
                                And we’re all in.
                            </p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-gray-900 text-center pt-8">
                            Think Carbon. Think Big. Think Different.
                        </p>
                    </div>
                </div>
            </FadeIn>
            <FadeIn delay={0.2}>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col-reverse gap-y-4 border-l border-gray-200 pl-6">
                            <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                            <dd className="text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </div>
    )
}
