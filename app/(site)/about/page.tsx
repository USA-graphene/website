import { Metadata } from 'next'
import Image from 'next/image'
import { FadeIn } from '@/components/FadeIn'

export const metadata: Metadata = {
    title: 'About Us - USA Graphene',
    description: 'Learn about our mission to revolutionize industries with graphene. We are a team of makers and engineers building the future of carbon materials.',
    alternates: {
        canonical: '/about/',
    },
    openGraph: {
        title: 'About Us - USA Graphene',
        description: 'Learn about our mission to revolutionize industries with graphene.',
        url: 'https://www.usa-graphene.com/about/',
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
            item: 'https://www.usa-graphene.com/',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'About Us',
            item: 'https://www.usa-graphene.com/about/',
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
        <div className="relative isolate overflow-hidden bg-[#070d1a] px-6 py-32 lg:px-8 min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_20%,rgba(45,110,240,0.13)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
            />
            {/* Background image with dark overlay */}
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image src="/about-background.jpg" alt="Graphene Background" fill className="object-cover object-right opacity-8" priority />
                <div className="absolute inset-0 bg-[#070d1a]/90" />
            </div>

            <FadeIn>
                <div className="mx-auto max-w-3xl text-base leading-7 relative">
                    <p className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5]">About Us</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                        We&apos;re not just manufacturing graphene.{' '}
                        <span className="bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] bg-clip-text text-transparent">We&apos;re believing in it.</span>
                    </h1>
                    <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff]" />
                    <div className="mt-8 max-w-2xl space-y-6 text-[#a8b8d8]">
                        <p className="text-lg leading-8">
                            At USA-Graphene, we&apos;re a team of makers, engineers, and dreamers united by one idea: carbon can change everything. We believe in the quiet power of a single atom arranged just right. We believe in breakthroughs born from black powder. We believe that the future isn&apos;t found—it&apos;s built.
                        </p>
                        <p>
                            We&apos;re a startup rooted in the USA, driven not by hype, but by conviction—that this one material can unlock cleaner energy, stronger structures, faster electronics, and smarter design. And we&apos;re here to make it real.
                        </p>
                        <p>
                            Our machines hum with purpose. Our hands carry the dust of ambition. Our mission? Bring this wonder material out of the lab and into the world—where it belongs.
                        </p>
                        <div className="border-l-2 border-[#2d6ef0] pl-6 py-3 bg-white/3 rounded-r-xl">
                            <p className="font-semibold text-white text-lg">Graphene isn&apos;t just a product to us.</p>
                            <p className="mt-1 font-semibold text-white">It&apos;s a movement.</p>
                            <p className="mt-1 font-semibold text-[#00c8ff]">And we&apos;re all in.</p>
                        </div>
                        <p className="text-xl font-bold tracking-tight text-white text-center pt-4">
                            Think Carbon. Think Big. Think Different.
                        </p>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
                            <dd className="text-3xl font-bold text-white font-display">{stat.value}</dd>
                            <dt className="mt-1 text-sm text-[#8b9ab5]">{stat.label}</dt>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </div>
    )
}
