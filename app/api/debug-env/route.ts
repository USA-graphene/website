import { NextResponse } from 'next/server'
import { getCounts } from '@/lib/visitors'

// Temporary debug route — delete after fixing
export const runtime = 'nodejs'

export async function GET() {
  const counts = await getCounts()
  return NextResponse.json(counts)
}
