import { NextResponse } from 'next/server'

// Temporary debug route — delete after fixing env vars
export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL || 'NOT SET'
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || 'NOT SET'
  return NextResponse.json({
    url_length: url.length,
    url_preview: url.slice(0, 30),
    token_length: token.length,
    token_preview: token.slice(0, 10),
  })
}
