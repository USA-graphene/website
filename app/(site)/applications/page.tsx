import { Metadata } from 'next'
import ApplicationsClient from './ApplicationsClient'

export const metadata: Metadata = {
  title: 'Graphene Applications — 25 Industry Use Cases | USA Graphene',
  description: 'Explore 25 proven graphene applications across energy storage, electronics, construction, biomedical, defense, and environmental sectors. Real customer-verified results.',
  alternates: { canonical: '/applications/' },
  openGraph: {
    title: 'Graphene Applications — USA Graphene',
    description: 'Explore 25 proven graphene applications across energy, electronics, construction, biomedical, defense, and environmental industries.',
    url: 'https://www.usa-graphene.com/applications/',
    images: [{ url: '/applications-background.jpg', width: 1200, height: 630, alt: 'Graphene Applications' }],
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What are the main applications of graphene?', acceptedAnswer: { '@type': 'Answer', text: 'Graphene is used across 25+ application areas including energy storage (batteries, supercapacitors, solar cells), electronics (flexible displays, transistors, sensors), construction (concrete reinforcement, anti-corrosion coatings), biomedical (drug delivery, biosensors, neural interfaces), defense (lightweight armor, EMI shielding), and environmental (water filtration, CO₂ capture).' } },
      { '@type': 'Question', name: 'How does graphene improve battery performance?', acceptedAnswer: { '@type': 'Answer', text: 'Graphene-based electrodes enable 10× faster charging, higher capacity, and longer lifespans due to its exceptional electrical conductivity (1,000,000+ S/m) and surface area (2,630 m²/g).' } },
      { '@type': 'Question', name: 'Can graphene be used in construction materials?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Customer-verified testing demonstrated 24.3 MPa compressive strength at 28 days with less than 0.1% graphene dosage. Graphene-enhanced concrete shows improved durability, reduced cracking, and a 30% lower carbon footprint.' } },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Graphene-Enhanced Concrete Sample Testing',
    description: 'Real-world customer testing reaching 24.3 MPa compressive strength at 28 days with graphene-enhanced concrete.',
    thumbnailUrl: ['https://www.usa-graphene.com/graphene_1.jpg'],
    uploadDate: '2025-12-03T09:41:52-05:00',
    contentUrl: 'https://www.usa-graphene.com/VIDEO-2025-12-03-09-41-52.mp4',
    embedUrl: 'https://www.usa-graphene.com/applications/',
  },
]

export default function ApplicationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ApplicationsClient />
    </>
  )
}
