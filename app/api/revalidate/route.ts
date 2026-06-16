import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_SECRET = process.env.REVALIDATE_SECRET || process.env.SANITY_REVALIDATE_SECRET || process.env.SANITY_API_TOKEN

function isAuthorized(request: NextRequest) {
    const headerSecret = request.headers.get('x-revalidate-secret')
    const urlSecret = request.nextUrl.searchParams.get('secret')
    const candidate = headerSecret || urlSecret
    return Boolean(DEFAULT_SECRET) && candidate === DEFAULT_SECRET
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    let payload: { slug?: string; paths?: string[] } = {}
    try {
        payload = await request.json()
    } catch {
        // Allow empty POST bodies so callers can still revalidate the blog index.
    }

    const slug = payload.slug?.trim()
    const paths = Array.isArray(payload.paths)
        ? payload.paths.filter((path): path is string => typeof path === 'string' && path.startsWith('/'))
        : []

    revalidatePath('/blog')
    for (const path of paths) {
        revalidatePath(path)
    }
    if (slug) {
        revalidatePath(`/blog/${slug}`)
    }

    const revalidated = Array.from(new Set([
        '/blog',
        ...paths,
        ...(slug ? [`/blog/${slug}`] : []),
    ]))

    return NextResponse.json({
        ok: true,
        revalidated,
        now: new Date().toISOString(),
    })
}
