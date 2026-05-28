export type SeoCluster = {
  slug: string
  title: string
  category: string
  description: string
  keywords: string[]
}

export const seoClusters: SeoCluster[] = [
  {
    slug: 'graphene-production',
    title: 'Graphene Production and Manufacturing',
    category: 'Science',
    description: 'Graphene production research, scalable manufacturing methods, reactor design, carbon conversion, and industrial process development.',
    keywords: ['graphene production', 'graphene manufacturing', 'graphene reactor', 'bulk graphene synthesis', 'turbostratic graphene production', 'industrial graphene equipment'],
  },
  {
    slug: 'energy-storage',
    title: 'Graphene Batteries and Supercapacitors',
    category: 'Energy Storage',
    description: 'Graphene battery materials, supercapacitor electrodes, hydrogen production, photocatalysts, and energy-storage research.',
    keywords: ['graphene batteries', 'graphene supercapacitors', 'graphene electrode', 'energy storage materials', 'hydrogen production graphene', 'battery materials'],
  },
  {
    slug: 'electronics-photonics',
    title: 'Graphene Electronics and Photonics',
    category: 'Electronics & Photonics',
    description: 'Graphene electronics, photonics, semiconductor interfaces, spintronics, sensors, and device-level research.',
    keywords: ['graphene electronics', 'graphene photonics', 'graphene semiconductor', 'graphene spintronics', 'graphene transistor', 'graphene quantum sensor'],
  },
  {
    slug: 'sensors',
    title: 'Graphene Sensors',
    category: 'Graphene Sensors',
    description: 'Graphene chemical sensors, biosensors, environmental sensors, tactile sensing, and high-sensitivity detection technologies.',
    keywords: ['graphene sensors', 'graphene biosensor', 'graphene environmental sensor', 'graphene tactile sensor', 'gas sensing graphene', 'molecular detection graphene'],
  },
  {
    slug: 'coatings-materials',
    title: 'Graphene Coatings and Composite Materials',
    category: 'Coatings & Materials',
    description: 'Graphene coatings, composite additives, corrosion protection, plastics, concrete, films, and engineered materials.',
    keywords: ['graphene coatings', 'graphene composites', 'graphene additive', 'graphene concrete', 'graphene plastics', 'anti corrosion graphene coating'],
  },
  {
    slug: 'biomedical',
    title: 'Graphene Biomedical Research',
    category: 'Sensors & Biomedical',
    description: 'Graphene biomedical materials, drug delivery, biosensing, cancer research, tissue interfaces, and medical device applications.',
    keywords: ['graphene biomedical', 'graphene drug delivery', 'graphene biosensors', 'graphene oxide cancer therapy', 'medical graphene', 'graphene nanocarriers'],
  },
  {
    slug: 'aerospace-defense',
    title: 'Graphene Aerospace and Defense',
    category: 'Transport, Aerospace & Defense',
    description: 'Graphene aerospace materials, radiation shielding, lightweight composites, thermal management, and defense applications.',
    keywords: ['graphene aerospace', 'graphene radiation shielding', 'graphene defense materials', 'lightweight graphene composites', 'thermal management graphene'],
  },
  {
    slug: 'water-environment',
    title: 'Graphene Water and Environmental Applications',
    category: 'Water & Environment',
    description: 'Graphene membranes, water filtration, pollutant detection, environmental remediation, and clean technology research.',
    keywords: ['graphene water filtration', 'graphene membranes', 'environmental graphene', 'graphene pollutant detection', 'water treatment graphene'],
  },
]

const categoryMap = new Map(seoClusters.map((cluster) => [cluster.category.toLowerCase(), cluster]))

export function clusterForCategory(category?: string | null) {
  if (!category) return null
  return categoryMap.get(category.toLowerCase()) || null
}

export function clusterBySlug(slug: string) {
  return seoClusters.find((cluster) => cluster.slug === slug) || null
}

export function keywordStringForCategories(categories: string[] = []) {
  const keywords = new Set<string>([
    'graphene',
    'turbostratic graphene',
    'USA graphene',
    'industrial graphene',
  ])

  for (const category of categories) {
    const cluster = clusterForCategory(category)
    if (cluster) {
      cluster.keywords.forEach((keyword) => keywords.add(keyword))
    }
  }

  return Array.from(keywords)
}
