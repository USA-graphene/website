import { NextRequest, NextResponse } from 'next/server'
import { buildCarbonMessages, getRelevantKnowledge, type ChatMessage } from '@/lib/carbon'

export const runtime = 'nodejs'

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

    const { context, sources, intent } = await getRelevantKnowledge(latestUserMessage.content)
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
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

    return NextResponse.json({
      answer,
      sources,
      model,
      intent,
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request.' },
      { status: 500 }
    )
  }
}
