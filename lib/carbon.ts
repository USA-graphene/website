import { client } from '@/lib/sanity'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type SourceItem = {
  type: 'product' | 'post' | 'application' | 'page' | 'download'
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

export async function getRelevantKnowledge(question: string): Promise<KnowledgeBundle> {
  const queryTokens = expandTokens(tokenize(question))
  const intent = detectIntent(question)

  const [products, posts, applications] = await Promise.all([
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
    {
      type: 'page' as const,
      title: 'Contact USA Graphene',
      url: CONTACT_URL,
      excerpt: CONTACT_EMAIL,
    },
  ].slice(0, 8)

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
          return `- ${item.title}${item.productType ? ` (${item.productType})` : ''}\n  Summary: ${item.shortDescription || item.seoDescription || 'No summary available.'}\n  Features: ${bullets || 'n/a'}\n  Specs: ${specs || 'n/a'}\n  CTA: ${item.primaryCtaLabel || item.primaryCtaType || 'contact'}${item.primaryCtaUrl ? ` (${item.primaryCtaUrl})` : ''}\n  Downloads: ${downloads || 'n/a'}\n  URL: ${item.slug?.current ? `/products/${item.slug.current}/` : '/products/'}`
        })
        .join('\n\n')
    )
  }

  if (scoredPosts.length) {
    sections.push(
      'BLOG POSTS:\n' +
      scoredPosts
        .map((item: any) =>
          `- ${item.title}\n  Summary: ${item.excerpt || item.seoDescription || 'No summary available.'}\n  URL: ${item.slug?.current ? `/blog/${item.slug.current}/` : '/blog/'}`
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
          return `- ${item.title}\n  Summary: ${item.tagline || item.seoDescription || 'No summary available.'}\n  Benefits: ${(item.benefits || []).join('; ') || 'n/a'}\n  Industries: ${(item.industries || []).join('; ') || 'n/a'}\n  Recommended products: ${recommended || 'n/a'}\n  Downloads: ${downloads || 'n/a'}\n  URL: ${item.slug?.current ? `/applications/${item.slug.current}/` : '/applications/'}`
        })
        .join('\n\n')
    )
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
      ? ([{ type: 'page' as const, title: 'Graphene Production Equipment', url: '/equipment/', excerpt: 'Pulsed electrical carbon conversion technology and production machinery.' }, ...sources].slice(0, 8))
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
- When useful, mention relevant pages, blog posts, or downloadable PDFs naturally.
- If there is a directly relevant product, application, or post in the context, mention it.
- Keep most answers to 1-4 short paragraphs plus bullets when helpful.

Behavior rules:
- For comparison questions, give a balanced practical comparison.
- For technical spec questions, stick tightly to listed specs/features.
- For quote/sample/demo/availability questions, answer helpfully but end with a contact handoff.
- Never fabricate price, lead time, MOQ, certifications, or test data.
- If the site context is thin, give a cautious high-level answer and offer contact handoff.

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
