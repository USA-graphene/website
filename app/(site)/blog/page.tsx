import { Metadata } from 'next'
import BlogIndex from './BlogIndex'

export const metadata: Metadata = {
    title: 'Graphene News, Research & Industrial Applications | USA Graphene Blog',
    description: 'Follow graphene research, production equipment, batteries, sensors, coatings, aerospace, biomedical, and industrial graphene applications from USA Graphene.',
    keywords: ['graphene news', 'graphene research', 'graphene applications', 'graphene production', 'graphene batteries', 'graphene sensors', 'turbostratic graphene'],
    alternates: {
        canonical: '/blog/',
    },
    openGraph: {
        title: 'Graphene News, Research & Industrial Applications',
        description: 'Daily graphene research and industrial application briefs from USA Graphene.',
        url: 'https://www.usa-graphene.com/blog/',
        type: 'website',
    },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Blog() {
    return <BlogIndex page={1} />
}
