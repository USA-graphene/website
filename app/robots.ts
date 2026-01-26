import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/studio/',
                '/_next/',
            ],
        },
        sitemap: 'https://www.usa-graphene.com/sitemap.xml',
    }
}
