import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://usa-graphene.com'),
  title: {
    default: 'USA Graphene | Industrial Graphene Materials & Machinery',
    template: '%s | USA Graphene',
  },
  description: 'Leading US manufacturer of industrial-grade graphene materials and production machinery. Scalable, high-purity turbostratic graphene solutions for concrete, plastics, and energy storage.',
  keywords: [
    'Graphene',
    'Turbostratic Graphene',
    'Graphene Manufacturer USA',
    'Bulk Graphene Powder',
    'Graphene Production Machinery',
    'Flash Joule Heating',
    'Industrial Graphene Applications',
    'Conductive Additives',
    'Graphene Concrete',
    'Graphene Plastics',
    'Carbon Nanomaterials'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://usa-graphene.com',
    siteName: 'USA Graphene',
    title: 'USA Graphene | Industrial Graphene Materials & Machinery',
    description: 'Leading US manufacturer of industrial-grade graphene materials and production machinery. Scalable, high-purity turbostratic graphene solutions.',
    images: [
      {
        url: '/hero-graphene.jpg',
        width: 1200,
        height: 630,
        alt: 'USA Graphene Industrial Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'USA Graphene | Industrial Graphene Materials & Machinery',
    description: 'Leading US manufacturer of industrial-grade graphene materials and production machinery.',
    creator: '@USA_Graphene',
  },
  alternates: {
    canonical: 'https://usa-graphene.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE_HERE', // TODO: Add your verification code from GSC
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
