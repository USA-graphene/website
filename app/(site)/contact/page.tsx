import { Metadata } from 'next'
import { getCounts } from '@/lib/visitors'

export const dynamic = 'force-dynamic' // always fresh counts — v2

export const metadata: Metadata = {
    title: 'Contact USA Graphene - Get in Touch for Graphene Solutions',
    description: 'Contact USA Graphene for inquiries about graphene materials, production machinery, partnerships, and custom solutions. Email us at info@usa-graphene.com.',
    alternates: {
        canonical: '/contact/',
    },
    openGraph: {
        title: 'Contact Us - USA Graphene',
        description: 'Get in touch with USA Graphene for inquiries and partnerships.',
        url: 'https://www.usa-graphene.com/contact/',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'USA Graphene',
    url: 'https://www.usa-graphene.com/',
    email: 'info@usa-graphene.com',
    address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
    },
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@usa-graphene.com',
        contactType: 'customer service',
    },
}

export default async function Contact() {
    const { daily, monthly } = await getCounts()

    return (
        <div className="relative isolate min-h-screen bg-[#070d1a] px-6 py-24 sm:py-32 lg:px-8 overflow-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,110,240,0.1)_0%,transparent_70%)]" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
            />

            <div className="relative mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold tracking-widest uppercase text-[#5b9af5] mb-2">Connect</p>
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">Contact Us</h2>
                <p className="mt-4 text-lg leading-8 text-[#8b9ab5]">
                    Interested in partnering with us or learning more about our graphene solutions? Send us a message at{' '}
                    <a href="mailto:info@usa-graphene.com" className="font-semibold text-[#00c8ff] hover:text-[#2d6ef0] transition-colors">
                        info@usa-graphene.com
                    </a>
                    {' '}or use the form below.
                </p>
            </div>

            <form action="mailto:info@usa-graphene.com" method="POST" encType="text/plain" className="relative mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="p-8 rounded-3xl border border-white/10 bg-[#0d1630]/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-white">
                                First name
                            </label>
                            <div className="mt-2.5">
                                <input
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="given-name"
                                    className="block w-full rounded-xl border-0 bg-white/5 px-4 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#2d6ef0] sm:text-sm sm:leading-6 placeholder:text-[#8b9ab5]"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-white">
                                Last name
                            </label>
                            <div className="mt-2.5">
                                <input
                                    type="text"
                                    name="last-name"
                                    id="last-name"
                                    autoComplete="family-name"
                                    className="block w-full rounded-xl border-0 bg-white/5 px-4 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#2d6ef0] sm:text-sm sm:leading-6 placeholder:text-[#8b9ab5]"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                Email
                            </label>
                            <div className="mt-2.5">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="email"
                                    className="block w-full rounded-xl border-0 bg-white/5 px-4 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#2d6ef0] sm:text-sm sm:leading-6 placeholder:text-[#8b9ab5]"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-medium leading-6 text-white">
                                Message
                            </label>
                            <div className="mt-2.5">
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    className="block w-full rounded-xl border-0 bg-white/5 px-4 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#2d6ef0] sm:text-sm sm:leading-6 placeholder:text-[#8b9ab5]"
                                    defaultValue={''}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="block w-full rounded-xl bg-gradient-to-r from-[#2d6ef0] to-[#1a55d0] px-4 py-3.5 text-center text-sm font-semibold text-white shadow-[0_4px_20px_rgba(45,110,240,0.35)] hover:shadow-[0_8px_32px_rgba(45,110,240,0.5)] transition-all hover:-translate-y-0.5"
                        >
                            Send message
                        </button>
                    </div>

                    {/* Visitor counter — no labels, just numbers. Hidden until first real visit. */}
                    {(monthly > 0 || daily > 0) && (
                        <p className="mt-6 text-center font-mono text-xs text-[#8b9ab5]/50 tracking-widest select-none">
                            M{monthly} D{daily}
                        </p>
                    )}
                </div>
            </form>
        </div>
    )
}
