import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'www.usa-graphene.com'
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`
const LEGACY_HOSTS = new Set(['graphene2026.com', 'www.graphene2026.com'])

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()
    let shouldRedirect = false;
    const isLocalDevHost =
        process.env.NODE_ENV === 'development' &&
        (/^localhost(?::\d+)?$/.test(host) || /^127\.0\.0\.1(?::\d+)?$/.test(host))

    // 1. Only normalize retired domains. The apex usa-graphene.com host is
    // crawlable; canonical tags point Google to the preferred www URLs.
    const hostWithoutPort = host.split(':')[0]
    if (LEGACY_HOSTS.has(hostWithoutPort) && !isLocalDevHost) {
        shouldRedirect = true;
    }

    // 2. Specific path rewrites (run before Next.js router)
    const pathname = url.pathname

    // 2a. WordPress date-based URL → /blog/:slug/
    const wpDatePattern = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/?$/
    const match = pathname.match(wpDatePattern)

    if (match) {
        url.pathname = `/blog/${match[4]}/`
        shouldRedirect = true;
    } else if (pathname === '/contact') {
        url.pathname = '/contact/'
        shouldRedirect = true;
    } else if (pathname === '/about-us' || pathname === '/about-us/' || pathname === '/about-us-2' || pathname === '/about-us-2/') {
        url.pathname = '/about/'
        shouldRedirect = true;
    }

    // Note: trailing-slash enforcement is intentionally NOT done here.
    // next.config.js trailingSlash:true handles this natively.
    // Doing it in the proxy too caused infinite redirect loops.

    if (shouldRedirect) {
        // Retired domains and legacy paths still land on the preferred www host.
        const dest = `${CANONICAL_ORIGIN}${url.pathname}${url.search}`
        return NextResponse.redirect(dest, 301)
    }

    return NextResponse.next()
}


export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
