type BlogSeoPost = {
    title?: string | null
    slug?: string | { current?: string | null } | null
    publishedAt?: string | null
    _updatedAt?: string | null
    seoNoIndex?: boolean | null
    canonicalSlug?: string | null
}

const DEFAULT_BLOG_INDEX_CUTOFF = '2026-05-01T00:00:00.000Z'

export const BLOG_INDEX_CUTOFF = new Date(process.env.BLOG_INDEX_CUTOFF || DEFAULT_BLOG_INDEX_CUTOFF)

export function cleanNumberPrefix(title?: string | null) {
    return String(title || '').replace(/^\d+\.\s*/, '').trim()
}

export function getSlugValue(slug?: BlogSeoPost['slug']) {
    if (!slug) return ''
    if (typeof slug === 'string') return slug
    return slug.current || ''
}

export function normalizeBlogTitle(title?: string | null) {
    return cleanNumberPrefix(title)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\bthe\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export function isLegacyBlogPost(post: BlogSeoPost) {
    if (!post.publishedAt) return false
    const published = new Date(post.publishedAt)
    return !Number.isNaN(published.getTime()) && published < BLOG_INDEX_CUTOFF
}

export function shouldNoIndexBlogPost(post: BlogSeoPost) {
    return Boolean(post.seoNoIndex) || isLegacyBlogPost(post)
}

function hasDuplicateSuffix(post: BlogSeoPost) {
    return /-\d+$/.test(getSlugValue(post.slug))
}

function publishedTime(post: BlogSeoPost) {
    const rawDate = post.publishedAt || post._updatedAt
    const time = rawDate ? new Date(rawDate).getTime() : 0
    return Number.isNaN(time) ? 0 : time
}

function isBetterCanonicalCandidate(candidate: BlogSeoPost, current: BlogSeoPost) {
    const candidateHasCleanSlug = !hasDuplicateSuffix(candidate)
    const currentHasCleanSlug = !hasDuplicateSuffix(current)

    if (candidateHasCleanSlug !== currentHasCleanSlug) {
        return candidateHasCleanSlug
    }

    return publishedTime(candidate) > publishedTime(current)
}

export function selectIndexableBlogPosts<T extends BlogSeoPost>(posts: T[], limit: number) {
    const canonicalByTitle = new Map<string, T>()

    for (const post of posts) {
        const slug = getSlugValue(post.slug)
        const titleKey = normalizeBlogTitle(post.title)

        if (!slug || !titleKey) continue
        if (post.canonicalSlug) continue
        if (shouldNoIndexBlogPost(post)) continue

        const existing = canonicalByTitle.get(titleKey)
        if (!existing || isBetterCanonicalCandidate(post, existing)) {
            canonicalByTitle.set(titleKey, post)
        }
    }

    return [...canonicalByTitle.values()]
        .sort((a, b) => publishedTime(b) - publishedTime(a))
        .slice(0, limit)
}
