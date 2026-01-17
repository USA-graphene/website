import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || ''

    // 1. ONLY handle the old domain redirect (graphene2026.com)
    // We leave the usa-graphene.com vs www choice to the Vercel Domain Settings
    // to prevent the "307 Redirect Error" loop.
    if (host.includes('graphene2026.com')) {
        const url = request.nextUrl.clone()
        url.host = 'usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next|static|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
