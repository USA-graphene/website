import { TrendingUp, Globe, Zap, BarChart3, ShieldCheck, Microchip, Beaker, Building2, Scale, Users, ChevronRight, Database, Wind, Droplets, HardHat } from 'lucide-react'
import { Metadata } from 'next'
import MarketResearchClient from './MarketResearchClient'

export const metadata: Metadata = {
    title: "Graphene Market Outlook 2026: Global Growth & USA Strategy | USA Graphene",
    description: "Explore the comprehensive Graphene Market Outlook for 2026. Discover global growth projections ($2.9B by 2026), USA's strategic role, and key drivers in energy, electronics, and aerospace.",
    keywords: ["Graphene Market Outlook 2026", "Graphene Market Size", "USA Graphene Strategy", "Graphene Industry Growth", "Graphene Applications 2026", "Materials Science Research"],
    openGraph: {
        title: "Graphene Market Outlook 2026: Global Growth Report",
        description: "Official market research on the future of graphene. Projections, investment surge, and USA's tactical leadership in advanced materials.",
        images: [{ url: '/market-research-og.png', width: 1200, height: 630, alt: 'Graphene Market Outlook 2026' }],
    },
}

export default function MarketResearchPage() {
    return <MarketResearchClient />
}
