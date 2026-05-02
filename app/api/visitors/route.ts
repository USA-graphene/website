import { NextRequest, NextResponse } from 'next/server'
import { trackVisit, getCounts } from '@/lib/visitors'

export const runtime = 'edge' // fast, no cold start

// Owner IPs to exclude from counting
const OWNER_IPS = new Set([
  '208.104.64.198',
  // Add more IPs here if needed
])

// Bot user-agent patterns to exclude
const BOT_PATTERNS = /bot|crawler|spider|crawling|facebookexternalhit|slurp|mediapartners|bingpreview|applebot|duckduckbot|semrush|ahrefs|mj12bot|dotbot|rogerbot|yandex|baidu|sogou|exabot|ia_archiver|curl|wget|python|node-fetch|axios|postman|pingdom|uptimerobot|monitoring|health/i

export async function POST(req: NextRequest) {
  // Get visitor IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown'

  // Filter owner
  if (OWNER_IPS.has(ip)) {
    const counts = await getCounts()
    return NextResponse.json(counts)
  }

  // Filter bots
  const ua = req.headers.get('user-agent') || ''
  if (BOT_PATTERNS.test(ua)) {
    const counts = await getCounts()
    return NextResponse.json(counts)
  }

  const counts = await trackVisit()
  return NextResponse.json(counts)
}
