import ContactPage from '../contact/page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact USA Graphene - Get in Touch for Graphene Solutions',
    description: 'Contact USA Graphene for inquiries about graphene materials, production machinery, partnerships, and custom solutions. Email us at info@usa-graphene.com.',
    alternates: {
        canonical: '/contact-us/',
    },
    openGraph: {
        title: 'Contact Us - USA Graphene',
        description: 'Get in touch with USA Graphene for inquiries and partnerships.',
        url: 'https://www.usa-graphene.com/contact-us/',
    },
}

export default ContactPage
