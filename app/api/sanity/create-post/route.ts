import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import crypto from 'crypto'

export const runtime = 'nodejs'

function firstString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function textToBlocks(body: string) {
  return body
    .split(/\n\s*\n/g)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => ({
      _type: 'block',
      _key: crypto.randomBytes(8).toString('hex'),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: crypto.randomBytes(8).toString('hex'),
          text: para,
          marks: [],
        },
      ],
    }))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const secret = firstString(body?.secret)
    const expectedSecret = process.env.SANITY_CREATE_POST_SECRET || process.env.SANITY_API_TOKEN

    if (!secret || !expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const title = firstString(body?.title)
    const rawSlug = firstString(body?.slug)
    const excerpt = firstString(body?.excerpt)
    const contentBody = firstString(body?.body)
    const draft = body?.draft === true

    if (!title || !excerpt || !contentBody) {
      return NextResponse.json({ error: 'title, excerpt, and body are required.' }, { status: 400 })
    }

    const slug = rawSlug ? slugify(rawSlug) : slugify(title)

    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't9t7is4j'
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'
    const token = process.env.SANITY_API_TOKEN

    if (!token) {
      return NextResponse.json({ error: 'Missing SANITY_API_TOKEN.' }, { status: 500 })
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    })

    const docId = draft ? `drafts.${slug}` : slug;
    const doc = {
      _id: docId,
      _type: 'post',
      title,
      slug: { _type: 'slug', current: slug },
      excerpt,
      body: textToBlocks(contentBody),
      publishedAt: new Date().toISOString(),
      mainImage: body?.mainImage || undefined,
    }

    const created = await client.createOrReplace(doc as any)

    return NextResponse.json({
      ok: true,
      documentId: created._id,
      slug,
      draft,
      createdId: created._id,
      publishedId: draft ? null : created._id,
    })
  } catch (error) {
    console.error('create-post route error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create post.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
