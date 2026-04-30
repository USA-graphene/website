import Hero from '@/components/Hero'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'USA Graphene | Industrial Graphene Powder & Production Machinery',
  description: 'USA Graphene produces high-quality turbostratic graphene using Advanced Pulsed Electrical Reactor Technology. We supply bulk graphene powder and industrial production machinery.',
  alternates: {
    canonical: 'https://www.usa-graphene.com/',
  },
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'USA Graphene',
    url: 'https://www.usa-graphene.com/',
    logo: 'https://www.usa-graphene.com/logo.png',
    sameAs: [
      'https://twitter.com/USA_Graphene',
      'https://www.linkedin.com/company/usa-graphene'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-555-5555',
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
    </main>
  )
}
