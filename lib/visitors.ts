/**
 * Visitor counter backed by Upstash Redis REST API.
 * No package needed — just plain fetch() calls.
 *
 * Keys used:
 *   visitors:d:{YYYY-MM-DD}  → daily unique-ish count  (TTL: 48h)
 *   visitors:m:{YYYY-MM}     → monthly count            (TTL: 35 days)
 */

// Read env vars inside functions to ensure runtime evaluation (not build-time)
function getUrl()   { return (process.env.UPSTASH_REDIS_REST_URL   || '').replace(/^["']|["']$/g, '') }
function getToken() { return (process.env.UPSTASH_REDIS_REST_TOKEN || '').replace(/^["']|["']$/g, '') }

/** Returns current date string in EST/EDT: "YYYY-MM-DD" */
function today(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()) // en-CA gives YYYY-MM-DD format natively
}

/** Returns current month string in EST/EDT: "YYYY-MM" */
function month(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const y = parts.find(p => p.type === 'year')!.value
  const m = parts.find(p => p.type === 'month')!.value
  return `${y}-${m}`
}

async function redisCmd(cmd: string[]): Promise<number | null> {
  const UPSTASH_URL   = getUrl()
  const UPSTASH_TOKEN = getToken()
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null
  try {
    const res = await fetch(`${UPSTASH_URL}/${cmd.map(encodeURIComponent).join('/')}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      next: { revalidate: 0 }, // always fresh
    })
    const json = await res.json()
    // Redis GET returns a string, INCR returns a number — handle both
    const val = json.result
    if (val === null || val === undefined) return null
    const n = Number(val)
    return isNaN(n) ? null : n
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
