import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that should NOT have a trailing slash appended (files, api routes, etc.)
const NO_TRAILING_SLASH = /\.(xml|txt|ico|png|jpg|jpeg|webp|svg|json|js|css|woff|woff2)$/i

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()
    let shouldRedirect = false;

    // 1. Normalize domain: graphene2026.com OR bare usa-graphene.com → www.usa-graphene.com
    if (host.includes('graphene2026.com') || host === 'usa-graphene.com') {
        url.host = 'www.usa-graphene.com'
        url.protocol = 'https'
        shouldRedirect = true;
    }

    // 2. Normalize pathname
    let pathname = url.pathname

    // 2a. WordPress date-based URL → /blog/:slug/  (must run before trailing slash fix)
    const wpDatePattern = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/?$/
    const match = pathname.match(wpDatePattern)

    if (match) {
        pathname = `/blog/${match[4]}/`
        url.pathname = pathname
        shouldRedirect = true;
    } else if (pathname === '/contact-us/' || pathname === '/contact-us' || pathname === '/contact') {
        // Redirect contact-us variants to canonical /contact/
        pathname = '/contact/'
        url.pathname = pathname
        shouldRedirect = true;
    } else if (pathname === '/about-us' || pathname === '/about-us-2' || pathname === '/about-us-2/') {
        // Redirect about-us variants to canonical /about/
        pathname = '/about/'
        url.pathname = pathname
        shouldRedirect = true;
    }

    // 2b. Ensure trailing slash for all page paths (mirrors next.config.js trailingSlash: true)
    //     We do this HERE so that domain changes + trailing-slash fixes are ONE hop, not two.
    if (
        !pathname.endsWith('/') &&
        !NO_TRAILING_SLASH.test(pathname)
    ) {
        url.pathname = pathname + '/'
        shouldRedirect = true;
    }

    if (shouldRedirect) {
        // IMPORTANT: Use an absolute string URL, NOT the NextURL object.
        // Next.js 16's NextURL normalizes trailing slashes away when you assign
        // url.pathname, causing an infinite redirect loop. Building the string
        // explicitly bypasses that internal normalization.
        const dest = `${url.protocol}//${url.host}${url.pathname}${url.search}`
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

