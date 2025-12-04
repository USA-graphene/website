import Hero from '@/components/Hero'
import Features from '@/components/Features'
import CTA from '@/components/CTA'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'USA Graphene | Premier Graphene Manufacturer & Machinery Supplier',
  description: 'USA Graphene produces high-quality turbostratic graphene using flash joule heating. We supply bulk graphene powder and industrial production machinery.',
  alternates: {
    canonical: 'https://usa-graphene.com',
  },
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'USA Graphene',
    url: 'https://usa-graphene.com',
    logo: 'https://usa-graphene.com/logo.png', // Ensure this exists or update
    sameAs: [
      'https://twitter.com/USA_Graphene',
      'https://www.linkedin.com/company/usa-graphene'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-555-5555', // Update with real number if available
      contactType: 'sales',
      areaServed: 'US',
      availableLanguage: 'en'
    },
    description: 'Leading US manufacturer of industrial-grade graphene materials and production machinery.'
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}

