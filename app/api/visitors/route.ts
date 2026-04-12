import { NextResponse } from 'next/server'
import { trackVisit } from '@/lib/visitors'

export const runtime = 'edge' // fast, no cold start

export async function POST() {
  const counts = await trackVisit()
  return NextResponse.json(counts)
}
