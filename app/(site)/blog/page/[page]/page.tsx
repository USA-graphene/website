import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogIndex from '../../BlogIndex'

type BlogPageProps = {
    params: Promise<{
        page: string
    }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    const { page } = await params
    const pageNumber = Number(page)

    return {
        title: `Graphene Blog Articles - Page ${pageNumber} | USA Graphene`,
        description: 'Browse older USA Graphene articles on graphene research, industrial applications, production, sensors, batteries, coatings, and advanced materials.',
        alternates: {
            canonical: `/blog/page/${pageNumber}/`,
        },
        openGraph: {
            title: `Graphene Blog Articles - Page ${pageNumber}`,
            description: 'Browse older USA Graphene research and industrial application articles.',
            url: `https://www.usa-graphene.com/blog/page/${pageNumber}/`,
            type: 'website',
        },
    }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PaginatedBlog({ params }: BlogPageProps) {
    const { page } = await params
    const pageNumber = Number(page)

    if (!Number.isInteger(pageNumber) || pageNumber < 2) {
        notFound()
    }

    return <BlogIndex page={pageNumber} />
}
