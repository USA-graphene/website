import { client } from '@/lib/sanity'
import { Pool } from 'pg'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type SourceItem = {
  type: 'product' | 'post' | 'application' | 'page' | 'download' | 'knowledge'
  title: string
  slug?: string
  url: string
  excerpt?: string
}

type KnowledgeBundle = {
  context: string
  sources: SourceItem[]
  intent: ReturnType<typeof detectIntent>
}

const CONTACT_EMAIL = 'info@usa-graphene.com'
const CONTACT_URL = '/contact/'

const SYNONYM_MAP: Record<string, string[]> = {
  concrete: ['cement', 'construction'],
  cement: ['concrete', 'construction'],
  battery: ['batteries', 'energy', 'supercapacitor', 'supercapacitors'],
  coating: ['coatings', 'anticorrosion', 'corrosion', 'paint'],
  polymer: ['polymers', 'plastic', 'plastics', 'composite', 'composites'],
  rubber: ['elastomer', 'tires', 'tyres'],
  machine: ['equipment', 'reactor', 'production'],
  price: ['cost', 'quote', 'pricing'],
  sample: ['samples', 'trial'],
}

let pool: Pool | null = null

function getDbPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
  }
  return pool
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    expanded.add(token.replace(/s$/, ''))
    for (const synonym of SYNONYM_MAP[token] || []) expanded.add(synonym)
  }
  return Array.from(expanded).filter(Boolean)
}

function weightedScore(queryTokens: string[], weightedFields: Array<{ text?: string; weight: number }>): number {
  let score = 0
  for (const { text, weight } of weightedFields) {
    if (!text) continue
    const haystack = text.toLowerCase()
    for (const token of queryTokens) {
      if (haystack.includes(token)) score += weight
    }
  }
  return score
}

type KnowledgeDbRow = {
  chunk_id: string
  source_path: string
  source_name: string
  source_group?: string | null
  source_type: string
  title: string
  content: string
  chunk_index?: number | null
  page_start?: number | null
  page_end?: number | null
  section_heading?: string | null
  extraction_status?: string | null
  source_metadata?: Record<string, any> | null
  distance?: number | null
}

type RankedKnowledgeRow = KnowledgeDbRow & {
  semanticScore: number
  keywordScore: number
  sourceWeight: number
  finalScore: number
}

type AggregatedKnowledgeRow = RankedKnowledgeRow & {
  sourceKey: string
  supportChunks: number
  bestChunkIndex?: number | null
  chunkIndexes: number[]
  combinedExcerpt: string
}

const TECHNICAL_SOURCE_HINTS = [
  'tds', 'datasheet', 'data sheet', 'spec', 'specification', 'raman', 'xrd', 'xps', 'ftir',
  'sem', 'tem', 'test', 'results', 'analysis', 'technical', 'production', 'reactor', 'equipment',
  'flash graphene', 'turbostratic', 'material', 'graphene grades', 'product sheet',
]

const BUSINESS_SOURCE_HINTS = [
  'price', 'pricing', 'quote', 'rfq', 'invoice', 'purchase', 'order', 'customer', 'sales',
  'commercial', 'business', 'market', 'brochure', 'proposal', 'cost',
]

function normalizeForMatching(text?: string | null): string {
  return (text || '').toLowerCase()
}

function tokenSet(text?: string | null): Set<string> {
  return new Set(expandTokens(tokenize(text || '')))
}

function buildContentSignature(text?: string | null): string {
  return normalizeForMatching(text)
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .slice(0, 240)
}

function countTokenHits(queryTokens: string[], text?: string | null): number {
  if (!text) return 0
  const haystack = normalizeForMatching(text)
  return Array.from(new Set(queryTokens)).filter((token) => haystack.includes(token)).length
}

function computeKeywordOverlapScore(queryTokens: string[], row: KnowledgeDbRow): number {
  const uniqueQueryTokens = Array.from(new Set(queryTokens))
  if (!uniqueQueryTokens.length) return 0

  const titleText = normalizeForMatching(row.title)
  const sourceNameText = normalizeForMatching(row.source_name)
  const groupText = normalizeForMatching(row.source_group)
  const pathText = normalizeForMatching(row.source_path)
  const contentText = normalizeForMatching(row.content)
  const contentTokens = tokenSet(`${row.title} ${row.source_name} ${row.source_group || ''} ${row.content}`)

  let score = 0
  for (const token of uniqueQueryTokens) {
    if (titleText.includes(token)) score += 5
    if (sourceNameText.includes(token)) score += 4
    if (groupText.includes(token)) score += 3
    if (pathText.includes(token)) score += 2
    if (contentTokens.has(token)) score += 2.5
    else if (contentText.includes(token)) score += 1.5
  }

  const overlapRatio = uniqueQueryTokens.filter((token) => contentTokens.has(token)).length / uniqueQueryTokens.length
  score += overlapRatio * 8

  return score
}

function computeSourceWeight(row: KnowledgeDbRow, intent: ReturnType<typeof detectIntent>, queryTokens: string[]): number {
  const metadataSource = normalizeForMatching(
    row.source_metadata?.original_source || row.source_metadata?.source || row.source_metadata?.path || ''
  )
  const sourceSignals = normalizeForMatching(`${row.source_group || ''} ${row.source_name} ${row.title} ${row.source_path} ${metadataSource}`)
  let weight = 0

  const technicalMatches = TECHNICAL_SOURCE_HINTS.filter((hint) => sourceSignals.includes(hint)).length
  const businessMatches = BUSINESS_SOURCE_HINTS.filter((hint) => sourceSignals.includes(hint)).length

  weight += Math.min(technicalMatches, 3) * 2
  weight += Math.min(businessMatches, 3) * 1.25

  if (intent.asksSpecs || queryTokens.some((token) => ['machine', 'machines', 'equipment', 'reactor', 'production'].includes(token))) {
    weight += technicalMatches * 1.5
  }

  if (intent.wantsQuote || intent.wantsSample || intent.asksAvailability) {
    weight += businessMatches * 1.75
  }

  const titleHits = countTokenHits(queryTokens, row.title)
  const sourceHits = countTokenHits(queryTokens, `${row.source_name} ${row.source_group || ''} ${metadataSource}`)
  weight += Math.min(titleHits, 3) * 1.5
  weight += Math.min(sourceHits, 3) * 1.25

  if (row.source_group) {
    if (/desktop__graphene-blog-posts/i.test(row.source_group)) weight -= 0.75
    if (/desktop__usa-graphene-images|pictures|images/i.test(row.source_group)) weight -= 2
    if (/pdf|documents|graphene production|graphene nano materials|downloads/i.test(row.source_group)) weight += 1.25
  }

  if (metadataSource) {
    if (/graphene-blog-posts/.test(metadataSource)) weight -= 1.25
    if (/graphene production|documents|downloads|technical|test results|spec|datasheet/.test(metadataSource)) weight += 1.75
  }

  if (row.extraction_status && row.extraction_status !== 'extracted') weight -= 1.5

  if (row.source_type === 'pdf') weight += 1.5
  if (['document', 'spreadsheet', 'presentation', 'text'].includes(row.source_type)) weight += 0.75
  if (['image', 'video', 'audio'].includes(row.source_type)) weight -= 2.5

  if (/\.png|\.jpg|\.jpeg|\.gif|\.webp|\.mov|\.mp4$/i.test(row.source_name)) weight -= 3
  if (/\.pdf|\.docx|\.doc|\.pptx|\.xlsx|\.csv|\.txt|\.md$/i.test(row.source_name)) weight += 0.75

  if (typeof row.chunk_index === 'number') {
    if (row.chunk_index === 0) weight += 0.6
    else if (row.chunk_index >= 6) weight -= Math.min((row.chunk_index - 5) * 0.2, 1.5)
  }

  return weight
}

function rerankKnowledgeRows(rows: KnowledgeDbRow[], queryTokens: string[], intent: ReturnType<typeof detectIntent>): RankedKnowledgeRow[] {
  if (!rows.length) return []

  const distances = rows
    .map((row) => row.distance)
    .filter((distance): distance is number => typeof distance === 'number' && Number.isFinite(distance))
  const minDistance = distances.length ? Math.min(...distances) : 0
  const maxDistance = distances.length ? Math.max(...distances) : 1
  const distanceRange = Math.max(maxDistance - minDistance, 0.0001)

  return rows
    .map((row) => {
      const semanticScore = typeof row.distance === 'number'
        ? (1 - (row.distance - minDistance) / distanceRange) * 20
        : 0
      const keywordScore = computeKeywordOverlapScore(queryTokens, row)
      const sourceWeight = computeSourceWeight(row, intent, queryTokens)
      const finalScore = semanticScore + keywordScore + sourceWeight

      return {
        ...row,
        semanticScore,
        keywordScore,
        sourceWeight,
        finalScore,
      }
    })
    .sort((a, b) => b.finalScore - a.finalScore)
}

function aggregateKnowledgeRows(rows: RankedKnowledgeRow[], limit = 8): AggregatedKnowledgeRow[] {
  const grouped = new Map<string, RankedKnowledgeRow[]>()

  for (const row of rows) {
    const sourceKey = row.source_path || row.source_name
    const existing = grouped.get(sourceKey) || []
    existing.push(row)
    grouped.set(sourceKey, existing)
  }

  const aggregated = Array.from(grouped.entries())
    .map(([sourceKey, sourceRows]) => {
      const sortedRows = sourceRows
        .slice()
        .sort((a, b) => b.finalScore - a.finalScore)
      const best = sortedRows[0]
      const supportingRows = sortedRows.slice(0, 3)
      const chunkIndexes = supportingRows
        .map((row) => row.chunk_index)
        .filter((index): index is number => typeof index === 'number')
      const excerptPieces: string[] = []
      const seenSignatures = new Set<string>()

      for (const row of supportingRows) {
        const signature = buildContentSignature(row.content)
        if (signature && seenSignatures.has(signature)) continue
        if (signature) seenSignatures.add(signature)
        excerptPieces.push(row.content.trim())
      }

      const supportBonus = Math.min(sortedRows.length - 1, 3) * 1.5
      const chunkSpreadBonus = Math.min(new Set(chunkIndexes).size, 3) * 0.35

      return {
        ...best,
        sourceKey,
        supportChunks: sortedRows.length,
        bestChunkIndex: best.chunk_index,
        chunkIndexes,
        combinedExcerpt: excerptPieces.join('\n\n---\n\n').slice(0, 2200),
        finalScore: best.finalScore + supportBonus + chunkSpreadBonus,
      }
    })
    .sort((a, b) => b.finalScore - a.finalScore)

  const selected: AggregatedKnowledgeRow[] = []
  const seenSignatures = new Set<string>()

  for (const row of aggregated) {
    const signature = buildContentSignature(`${row.title}\n${row.combinedExcerpt}`)
    if (signature && seenSignatures.has(signature)) continue
    selected.push(row)
    if (signature) seenSignatures.add(signature)
    if (selected.length >= limit) break
  }

  return selected
}

function portableTextToString(value: any): string {
  if (!Array.isArray(value)) return typeof value === 'string' ? value : ''
  return value
    .map((block: any) =>
      Array.isArray(block?.children)
        ? block.children.map((child: any) => child?.text || '').join(' ')
        : ''
    )
    .join(' ')
}

function detectIntent(question: string) {
  const q = question.toLowerCase()
  return {
    wantsQuote: /(quote|pricing|price|cost|buy|purchase|order|rfq)/i.test(q),
    wantsSample: /(sample|trial|test material|evaluation lot)/i.test(q),
    wantsDemo: /(demo|call|meeting|book|schedule)/i.test(q),
    asksSpecs: /(spec|specs|technical|datasheet|tds|properties)/i.test(q),
    asksComparison: /(vs\.?|versus|compare|comparison|difference)/i.test(q),
    asksAvailability: /(lead time|available|availability|in stock|ship)/i.test(q),
  }
}

async function getQuestionEmbedding(question: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        input: question,
      }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.data?.[0]?.embedding || null
  } catch {
    return null
  }
}

function vectorLiteral(values: number[]): string {
  return '[' + values.map((v) => Number(v).toFixed(8)).join(',') + ']'
}

function citationForRow(row: AggregatedKnowledgeRow): string {
  const pages = row.page_start
    ? `p. ${row.page_start}${row.page_end && row.page_end !== row.page_start ? `-${row.page_end}` : ''}`
    : null
  const section = row.section_heading ? `section: ${row.section_heading}` : null
  const file = row.source_name || row.title
  const bits = [file, pages, section].filter(Boolean).join(', ')
  return bits ? `[source: ${bits}]` : `[source: ${file}]`
}

async function getDatabaseKnowledge(
  question: string,
  queryTokens: string[],
  intent: ReturnType<typeof detectIntent>
): Promise<{ context: string; sources: SourceItem[] }> {
  const db = getDbPool()
  if (!db || queryTokens.length === 0) {
    return { context: '', sources: [] }
  }

  try {
    const mergedRows = new Map<string, KnowledgeDbRow>()
    const questionEmbedding = await getQuestionEmbedding(question)

    if (questionEmbedding) {
      const semanticSql = `
        select
          kc.id::text as chunk_id,
          kc.chunk_index,
          kc.page_start,
          kc.page_end,
          kc.section_heading,
          ks.source_path,
          ks.source_name,
          ks.source_group,
          ks.source_type,
          ks.extraction_status,
          ks.metadata as source_metadata,
          coalesce(kc.title, ks.title, ks.source_name) as title,
          left(kc.content, 1200) as content,
          (kc.embedding <=> $1::vector) as distance
        from knowledge_chunks kc
        join knowledge_sources ks on ks.id = kc.source_id
        where kc.embedding is not null
        order by kc.embedding <=> $1::vector asc
        limit 36
      `
      const semantic = await db.query<KnowledgeDbRow>(semanticSql, [vectorLiteral(questionEmbedding)])
      for (const row of semantic.rows || []) {
        mergedRows.set(row.chunk_id, row)
      }
    }

    const likeClauses = queryTokens.map((_, i) => `(
      lower(kc.content) like $${i + 1}
      or lower(coalesce(kc.title, '')) like $${i + 1}
      or lower(coalesce(ks.title, '')) like $${i + 1}
      or lower(ks.source_name) like $${i + 1}
      or lower(coalesce(ks.source_group, '')) like $${i + 1}
    )`)
    const values = queryTokens.map((token) => `%${token.toLowerCase()}%`)
    const keywordRankTerms = queryTokens.map((_, i) => `(
      case when lower(coalesce(kc.title, '')) like $${i + 1} then 7 else 0 end +
      case when lower(coalesce(ks.title, '')) like $${i + 1} then 6 else 0 end +
      case when lower(ks.source_name) like $${i + 1} then 5 else 0 end +
      case when lower(coalesce(ks.source_group, '')) like $${i + 1} then 3 else 0 end +
      case when lower(kc.content) like $${i + 1} then 2 else 0 end
    )`)

    if (likeClauses.length) {
      const keywordSql = `
        select
          kc.id::text as chunk_id,
          kc.chunk_index,
          kc.page_start,
          kc.page_end,
          kc.section_heading,
          ks.source_path,
          ks.source_name,
          ks.source_group,
          ks.source_type,
          ks.extraction_status,
          ks.metadata as source_metadata,
          coalesce(kc.title, ks.title, ks.source_name) as title,
          left(kc.content, 1200) as content,
          null::float as distance
        from knowledge_chunks kc
        join knowledge_sources ks on ks.id = kc.source_id
        where ${likeClauses.join(' or ')}
        order by ${keywordRankTerms.join(' + ')} desc, ks.source_group nulls last, ks.source_name, kc.chunk_index
        limit 36
      `

      const keyword = await db.query<KnowledgeDbRow>(keywordSql, values)
      for (const row of keyword.rows || []) {
        const existing = mergedRows.get(row.chunk_id)
        mergedRows.set(row.chunk_id, existing ? { ...row, distance: existing.distance } : row)
      }
    }

    const rankedRows = aggregateKnowledgeRows(
      rerankKnowledgeRows(Array.from(mergedRows.values()), queryTokens, intent),
      8
    )

    const sources: SourceItem[] = rankedRows.map((row) => ({
      type: 'knowledge',
      title: row.title,
      url: '#local-knowledge-base',
      excerpt: [
        row.source_group ? `${row.source_group}` : null,
        row.source_name,
        row.page_start ? `p.${row.page_start}${row.page_end && row.page_end !== row.page_start ? `-${row.page_end}` : ''}` : null,
        row.section_heading ? `section: ${row.section_heading}` : null,
        row.supportChunks > 1 ? `${row.supportChunks} matching chunks` : null,
      ].filter(Boolean).join(' · '),
    }))

    const context = rankedRows.length
      ? 'LOCAL KNOWLEDGE BASE (HYBRID RERANKED + SOURCE-AWARE AGGREGATION):\n' + rankedRows
          .map((row) => `- ${row.title}\n  ${citationForRow(row)}\n  Group: ${row.source_group || 'uncategorized'}\n  File: ${row.source_name}${row.chunkIndexes.length ? ` (chunks ${row.chunkIndexes.join(', ')})` : ''}${row.page_start ? `\n  Pages: ${row.page_start}${row.page_end && row.page_end !== row.page_start ? `-${row.page_end}` : ''}` : ''}${row.section_heading ? `\n  Section: ${row.section_heading}` : ''}\n  Hybrid score: ${row.finalScore.toFixed(2)} (semantic ${row.semanticScore.toFixed(2)} + keyword ${row.keywordScore.toFixed(2)} + source ${row.sourceWeight.toFixed(2)}${row.supportChunks > 1 ? ` + support bonus ${Math.max(row.finalScore - row.semanticScore - row.keywordScore - row.sourceWeight, 0).toFixed(2)}` : ''})${typeof row.distance === 'number' ? `\n  Best distance: ${Number(row.distance).toFixed(4)}` : ''}\n  Supporting chunks: ${row.supportChunks}\n  Excerpt: ${row.combinedExcerpt}`)
          .join('\n\n')
      : ''

    return { context, sources }
  } catch (error) {
    console.error('Database knowledge lookup failed:', error)
    return { context: '', sources: [] }
  }
}

export async function getRelevantKnowledge(question: string): Promise<KnowledgeBundle> {
  const queryTokens = expandTokens(tokenize(question))
  const intent = detectIntent(question)

  const [products, posts, applications, dbKnowledge] = await Promise.all([
    client.fetch(`*[_type == "product"]{
      _id,
      title,
      slug,
      productType,
      shortDescription,
      featureBullets,
      techSpecs,
      seoDescription,
      primaryCtaType,
      primaryCtaLabel,
      primaryCtaUrl,
      downloads[]{
        description,
        asset->{url, originalFilename}
      },
      body
    }`),
    client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...40]{
      _id,
      title,
      slug,
      excerpt,
      seoDescription,
      publishedAt,
      body
    }`),
    client.fetch(`*[_type == "application"]{
      _id,
      title,
      slug,
      tagline,
      industries,
      benefits,
      seoDescription,
      downloads[]{
        description,
        asset->{url, originalFilename}
      },
      body,
      recommendedProducts[]->{title, slug}
    }`),
    getDatabaseKnowledge(question, queryTokens, intent),
  ])

  const scoredProducts = (products || [])
    .map((item: any) => ({
      ...item,
      score: weightedScore(queryTokens, [
        { text: item.title, weight: 8 },
        { text: item.productType, weight: 5 },
        { text: item.shortDescription, weight: 5 },
        { text: item.seoDescription, weight: 4 },
        { text: portableTextToString(item.body), weight: 2 },
        { text: (item.featureBullets || []).join(' '), weight: 3 },
        { text: ((item.techSpecs || []).flatMap((spec: any) => [spec?.label, spec?.value]).join(' ')), weight: 4 },
        { text: (item.downloads || []).map((d: any) => `${d?.description || ''} ${d?.asset?.originalFilename || ''}`).join(' '), weight: 2 },
      ]),
    }))
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 4)

  const scoredPosts = (posts || [])
    .map((item: any) => ({
      ...item,
      score: weightedScore(queryTokens, [
        { text: item.title, weight: 7 },
        { text: item.excerpt, weight: 5 },
        { text: item.seoDescription, weight: 4 },
        { text: portableTextToString(item.body), weight: 2 },
      ]),
    }))
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5)

  const scoredApplications = (applications || [])
    .map((item: any) => ({
      ...item,
      score: weightedScore(queryTokens, [
        { text: item.title, weight: 7 },
        { text: item.tagline, weight: 5 },
        { text: (item.industries || []).join(' '), weight: 4 },
        { text: (item.benefits || []).join(' '), weight: 4 },
        { text: item.seoDescription, weight: 4 },
        { text: portableTextToString(item.body), weight: 2 },
        { text: (item.downloads || []).map((d: any) => `${d?.description || ''} ${d?.asset?.originalFilename || ''}`).join(' '), weight: 2 },
        { text: (item.recommendedProducts || []).map((p: any) => p?.title).join(' '), weight: 2 },
      ]),
    }))
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3)

  const sources: SourceItem[] = [
    ...scoredProducts.flatMap((item: any) => {
      const base = [{
        type: 'product' as const,
        title: item.title,
        slug: item.slug?.current,
        url: item.slug?.current ? `/products/${item.slug.current}/` : '/products/',
        excerpt: item.shortDescription || item.seoDescription,
      }]
      const downloads = (item.downloads || []).slice(0, 1).map((d: any) => ({
        type: 'download' as const,
        title: d?.description || d?.asset?.originalFilename || `${item.title} PDF`,
        url: d?.asset?.url,
        excerpt: `Download resource for ${item.title}`,
      })).filter((d: any) => d.url)
      return [...base, ...downloads]
    }),
    ...scoredPosts.map((item: any) => ({
      type: 'post' as const,
      title: item.title,
      slug: item.slug?.current,
      url: item.slug?.current ? `/blog/${item.slug.current}/` : '/blog/',
      excerpt: item.excerpt || item.seoDescription,
    })),
    ...scoredApplications.flatMap((item: any) => {
      const base = [{
        type: 'application' as const,
        title: item.title,
        slug: item.slug?.current,
        url: item.slug?.current ? `/applications/${item.slug.current}/` : '/applications/',
        excerpt: item.tagline || item.seoDescription,
      }]
      const downloads = (item.downloads || []).slice(0, 1).map((d: any) => ({
        type: 'download' as const,
        title: d?.description || d?.asset?.originalFilename || `${item.title} PDF`,
        url: d?.asset?.url,
        excerpt: `Download resource for ${item.title}`,
      })).filter((d: any) => d.url)
      return [...base, ...downloads]
    }),
    ...dbKnowledge.sources,
    {
      type: 'page' as const,
      title: 'Contact USA Graphene',
      url: CONTACT_URL,
      excerpt: CONTACT_EMAIL,
    },
  ].slice(0, 10)

  const sections: string[] = []

  if (scoredProducts.length) {
    sections.push(
      'PRODUCTS:\n' +
      scoredProducts
        .map((item: any) => {
          const specs = (item.techSpecs || [])
            .slice(0, 6)
            .map((spec: any) => `${spec.label}: ${spec.value}`)
            .join('; ')
          const bullets = (item.featureBullets || []).slice(0, 6).join('; ')
          const downloads = (item.downloads || [])
            .slice(0, 2)
            .map((d: any) => `${d?.description || d?.asset?.originalFilename || 'PDF'}: ${d?.asset?.url || 'n/a'}`)
            .join('; ')
          return `- ${item.title}${item.productType ? ` (${item.productType})` : ''}
  Summary: ${item.shortDescription || item.seoDescription || 'No summary available.'}
  Features: ${bullets || 'n/a'}
  Specs: ${specs || 'n/a'}
  CTA: ${item.primaryCtaLabel || item.primaryCtaType || 'contact'}${item.primaryCtaUrl ? ` (${item.primaryCtaUrl})` : ''}
  Downloads: ${downloads || 'n/a'}
  URL: ${item.slug?.current ? `/products/${item.slug.current}/` : '/products/'}`
        })
        .join('\n\n')
    )
  }

  if (scoredPosts.length) {
    sections.push(
      'BLOG POSTS:\n' +
      scoredPosts
        .map((item: any) =>
          `- ${item.title}
  Summary: ${item.excerpt || item.seoDescription || 'No summary available.'}
  URL: ${item.slug?.current ? `/blog/${item.slug.current}/` : '/blog/'}`
        )
        .join('\n\n')
    )
  }

  if (scoredApplications.length) {
    sections.push(
      'APPLICATIONS:\n' +
      scoredApplications
        .map((item: any) => {
          const downloads = (item.downloads || [])
            .slice(0, 2)
            .map((d: any) => `${d?.description || d?.asset?.originalFilename || 'PDF'}: ${d?.asset?.url || 'n/a'}`)
            .join('; ')
          const recommended = (item.recommendedProducts || [])
            .map((p: any) => p?.title)
            .join('; ')
          return `- ${item.title}
  Summary: ${item.tagline || item.seoDescription || 'No summary available.'}
  Benefits: ${(item.benefits || []).join('; ') || 'n/a'}
  Industries: ${(item.industries || []).join('; ') || 'n/a'}
  Recommended products: ${recommended || 'n/a'}
  Downloads: ${downloads || 'n/a'}
  URL: ${item.slug?.current ? `/applications/${item.slug.current}/` : '/applications/'}`
        })
        .join('\n\n')
    )
  }

  if (dbKnowledge.context) {
    sections.push(dbKnowledge.context)
  }

  const machineSignals = ['machine', 'machines', 'equipment', 'reactor', 'production']
  if (queryTokens.some((token) => machineSignals.includes(token))) {
    sections.push(
      'EQUIPMENT PAGE:\n' +
      '- USA Graphene has an equipment page describing a pulsed electrical resistive carbon conversion system for producing turbostratic graphene.\n' +
      '- The equipment messaging presents an industrial graphene production machine / reactor offering.\n' +
      '- Relevant URL: /equipment/'
    )
  }

  sections.push(`CONTACT:\n- Contact page: ${CONTACT_URL}\n- Email: ${CONTACT_EMAIL}`)

  return {
    context: sections.join('\n\n'),
    sources: queryTokens.some((token) => machineSignals.includes(token))
      ? ([{ type: 'page' as const, title: 'Graphene Production Equipment', url: '/equipment/', excerpt: 'Pulsed electrical carbon conversion technology and production machinery.' }, ...sources].slice(0, 10))
      : sources,
    intent,
  }
}

export function buildCarbonMessages(messages: ChatMessage[], context: string, intent?: ReturnType<typeof detectIntent>): ChatMessage[] {
  const systemPrompt = `You are Carbon, the USA Graphene technical sales and applications assistant.

Your job:
- Answer questions about USA Graphene products, applications, blog content, and graphene commercialization.
- Be technically credible, commercially aware, and concise.
- Prefer practical explanations over hype.
- If the user asks for pricing, custom quotes, samples, lead times, or machine purchases, invite them to contact the team at ${CONTACT_EMAIL} or ${CONTACT_URL}.
- If you are not sure, say so briefly and suggest contacting the team instead of inventing numbers.
- Do not claim certifications, specs, or test results unless they are present in the provided context.
- Use the provided context as your primary knowledge base.
- When useful, mention relevant pages, blog posts, downloadable PDFs, or internal knowledge-base findings naturally.
- If there is a directly relevant product, application, post, or knowledge-base source in the context, mention it.
- Keep most answers to 1-4 short paragraphs plus bullets when helpful.
- When you cite knowledge-base material, format citations inline like [source: filename, p. 12, section: Title].

Behavior rules:
- For comparison questions, give a balanced practical comparison.
- For technical spec questions, stick tightly to listed specs/features.
- For quote/sample/demo/availability questions, answer helpfully but end with a contact handoff.
- Never fabricate price, lead time, MOQ, certifications, or test data.
- If the site context is thin, use the local knowledge base context when available.
- If both site context and local knowledge base context are thin, give a cautious high-level answer and offer contact handoff.

Tone:
- Confident, helpful, direct
- No corporate fluff
- No exaggerated claims like “revolutionary” unless the user says it first

Detected intent:
${JSON.stringify(intent || {}, null, 2)}

Relevant site context:
${context || 'No matching internal context found. Answer conservatively and keep guidance high-level.'}`

  const trimmed = messages.slice(-8)
  return [{ role: 'system', content: systemPrompt }, ...trimmed]
}

export type { ChatMessage, SourceItem }
