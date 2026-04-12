/**
 * Visitor counter backed by Upstash Redis REST API.
 * No package needed — just plain fetch() calls.
 *
 * Keys used:
 *   visitors:d:{YYYY-MM-DD}  → daily unique-ish count  (TTL: 48h)
 *   visitors:m:{YYYY-MM}     → monthly count            (TTL: 35 days)
 */

const UPSTASH_URL   = (process.env.UPSTASH_REDIS_REST_URL   || '').replace(/^["']|["']$/g, '')
const UPSTASH_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || '').replace(/^["']|["']$/g, '')

function today()  { return new Date().toISOString().slice(0, 10)  } // YYYY-MM-DD
function month()  { return new Date().toISOString().slice(0, 7)   } // YYYY-MM

async function redisCmd(cmd: string[]): Promise<number | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null
  try {
    const res = await fetch(`${UPSTASH_URL}/${cmd.map(encodeURIComponent).join('/')}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      next: { revalidate: 0 }, // always fresh
    })
    const json = await res.json()
    return typeof json.result === 'number' ? json.result : null
  } catch {
    return null
  }
}

/** Increment daily + monthly counters and set TTLs. Returns { daily, monthly }. */
export async function trackVisit(): Promise<{ daily: number; monthly: number }> {
  const dKey = `visitors:d:${today()}`
  const mKey = `visitors:m:${month()}`

  const [daily, monthly] = await Promise.all([
    redisCmd(['INCR', dKey]),
    redisCmd(['INCR', mKey]),
  ])

  // Set TTL on first increment (EXPIRE is idempotent-ish, harmless to call again)
  if (daily === 1)   await redisCmd(['EXPIRE', dKey, '172800'])  // 48 hours
  if (monthly === 1) await redisCmd(['EXPIRE', mKey, '3024000']) // 35 days

  return { daily: daily ?? 0, monthly: monthly ?? 0 }
}

/** Read current counts without incrementing. Returns { daily, monthly }. */
export async function getCounts(): Promise<{ daily: number; monthly: number }> {
  const dKey = `visitors:d:${today()}`
  const mKey = `visitors:m:${month()}`

  const [daily, monthly] = await Promise.all([
    redisCmd(['GET', dKey]),
    redisCmd(['GET', mKey]),
  ])

  return { daily: daily ?? 0, monthly: monthly ?? 0 }
}
