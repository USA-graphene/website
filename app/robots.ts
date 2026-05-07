import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: [
                '/',
                '/_next/static/',
                '/_next/image/',
            ],
            disallow: [
                '/studio/',
                '/results/',
                '/api/',
            ],
        },
        sitemap: 'https://www.usa-graphene.com/sitemap.xml',
    }
}
