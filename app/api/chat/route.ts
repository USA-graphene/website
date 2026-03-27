import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { buildCarbonMessages, getRelevantKnowledge, type ChatMessage } from '@/lib/carbon'

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

async function ensureSession(db: Pool | null, body: any) {
  if (!db) return null
  const sessionId = firstString(body?.sessionId)
  if (sessionId) return sessionId

  const visitorId = firstString(body?.visitorId) || firstString(body?.visitor_id)
  const source = firstString(body?.source) || 'website'
  const landingPage = firstString(body?.landingPage) || firstString(body?.landing_page)
  const userAgent = firstString(body?.userAgent) || firstString(body?.user_agent)

  const result = await db.query<{ id: string }>(
    `insert into chat_sessions (visitor_id, source, landing_page, user_agent, status)
     values ($1, $2, $3, $4, 'active')
     returning id`,
    [visitorId, source, landingPage, userAgent]
  )

  return result.rows[0]?.id || null
}

async function saveMessage(
  db: Pool | null,
  sessionId: string | null,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model: string | null,
  metadata: Record<string, any>
) {
  if (!db || !sessionId) return null

  const result = await db.query<{ id: string }>(
    `insert into chat_messages (session_id, role, content, model, metadata)
     values ($1, $2, $3, $4, $5::jsonb)
     returning id`,
    [sessionId, role, content, model, JSON.stringify(metadata || {})]
  )

  return result.rows[0]?.id || null
}

async function saveSources(
  db: Pool | null,
  messageId: string | null,
  sources: any[]
) {
  if (!db || !messageId || !sources?.length) return

  for (const source of sources.slice(0, 12)) {
    await db.query(
      `insert into message_sources (message_id, source_id, chunk_id, score)
       values ($1, $2, $3, $4)`,
      [
        messageId,
        firstString(source?.source_id),
        firstString(source?.chunk_id),
        typeof source?.score === 'number' ? source.score : null,
      ]
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []

    const cleanedMessages: ChatMessage[] = messages
      .filter((message: any) => message && typeof message.content === 'string' && typeof message.role === 'string')
      .map((message: any) => ({
        role: message.role === 'assistant' ? 'assistant' : message.role === 'system' ? 'system' : 'user',
        content: message.content.slice(0, 4000),
      }))
      .slice(-10)

    const latestUserMessage = [...cleanedMessages].reverse().find((message) => message.role === 'user')

    if (!latestUserMessage?.content?.trim()) {
      return NextResponse.json({ error: 'A user message is required.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Missing OPENAI_API_KEY. Add it to your environment to enable Carbon chat.',
        },
        { status: 500 }
      )
    }

    const db = getDbPool()
    const sessionId = await ensureSession(db, body)
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const userMessageId = await saveMessage(db, sessionId, 'user', latestUserMessage.content, null, {
      user_agent: body?.userAgent || body?.user_agent || null,
      landing_page: body?.landingPage || body?.landing_page || null,
    })

    const { context, sources, intent } = await getRelevantKnowledge(latestUserMessage.content)
    const completionMessages = buildCarbonMessages(cleanedMessages, context, intent)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: completionMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `OpenAI error: ${errorText}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const answer = data?.choices?.[0]?.message?.content?.trim()

    if (!answer) {
      return NextResponse.json({ error: 'No response generated.' }, { status: 502 })
    }

    const assistantMessageId = await saveMessage(db, sessionId, 'assistant', answer, model, {
      retrieved_sources: sources,
      model,
      intent,
      usage: data?.usage || null,
    })

    if (db && assistantMessageId) {
      const sourceLinks = sources.map((source: any) => ({
        source_id: firstString(source?.source_id) || firstString(source?.id),
        chunk_id: firstString(source?.chunk_id),
        score: typeof source?.score === 'number' ? source.score : null,
      }))
      await saveSources(db, assistantMessageId, sourceLinks)
    }

    return NextResponse.json({
      answer,
      sources,
      model,
      intent,
      sessionId,
      userMessageId,
      assistantMessageId,
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request.' },
      { status: 500 }
    )
  }
}
