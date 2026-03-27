import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'

let pool: Pool | null = null

function getDbPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
  }
  return pool
}

function firstString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function toRating(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.max(1, Math.min(5, Math.round(value)))
    return rounded
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      const rounded = Math.max(1, Math.min(5, Math.round(parsed)))
      return rounded
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getDbPool()

    if (!db) {
      return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 500 })
    }

    const sessionId = firstString(body?.sessionId)
    const messageId = firstString(body?.messageId)
    const rating = toRating(body?.rating)
    const useful = typeof body?.useful === 'boolean' ? body.useful : rating ? rating >= 4 : null
    const notes = firstString(body?.notes)

    if (!sessionId || !messageId) {
      return NextResponse.json({ error: 'sessionId and messageId are required.' }, { status: 400 })
    }

    const result = await db.query(
      `insert into answer_feedback (session_id, message_id, rating, useful, notes)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [sessionId, messageId, rating, useful, notes]
    )

    return NextResponse.json({ ok: true, id: result.rows[0]?.id || null })
  } catch (error) {
    console.error('Feedback route error:', error)
    return NextResponse.json({ error: 'Failed to save feedback.' }, { status: 500 })
  }
}
