import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CANONICAL_HOST = 'www.usa-graphene.com'
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()
    let shouldRedirect = false;

    // 1. Normalize every non-canonical host to www.usa-graphene.com.
    // Google Search Console was seeing usa-graphene.com variants as temporary
    // redirects. Emit one permanent hop to the canonical host instead.
    if (host && host !== CANONICAL_HOST) {
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
    } else if (pathname === '/contact-us' || pathname === '/contact-us/') {
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
        // ALWAYS redirect to canonical origin so every redirect is a single hop.
        // This prevents chains like: usa-graphene.com/contact-us/ → www/contact-us/ → www/contact/
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
