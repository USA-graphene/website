'use client'

import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import {
    TrendingUp,
    Globe,
    Zap,
    BarChart3,
    ShieldCheck,
    Microchip,
    Beaker,
    Building2,
    Scale,
    Users,
    ChevronRight,
    Database,
    Wind,
    Droplets,
    HardHat
} from 'lucide-react'

export default function MarketResearchClient() {
    const stats = [
        {
            label: 'Market Value (2026)',
            value: '$1.28B - $2.91B',
            description: 'Projected global market capitalization.',
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Growth Rate (CAGR)',
            value: '20.31% - 39.18%',
            description: 'Compound annual growth through 2032.',
            icon: BarChart3,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
        },
        {
            label: 'Long-term Forecast',
            value: '$15.57B',
            description: 'Estimated market reach by 2034.',
            icon: Globe,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ]

    const drivers = [
        { title: 'Material Advancements', text: 'Superior conductivity and strength redefining electronics and medical devices.', icon: Microchip },
        { title: 'Processing Tech', text: 'Innovations like OF-CVD making graphene cost-effective for large-scale integration.', icon: Database },
        { title: 'Energy Storage', text: 'High-performance batteries in EVs and renewable systems driving massive demand.', icon: Zap },
        { title: 'R&D Investment', text: 'Significant funding in US and Europe expanding sensor and energy applications.', icon: Beaker },
        { title: 'Graphene Composites', text: 'Enhancing plastics, metals, and ceramics for aerospace and automotive sectors.', icon: Wind },
        { title: 'Government Support', text: 'Global initiatives fostering market expansion and rapid commercialization.', icon: Building2 },
    ]

    const applicationAreas = [
        { name: 'Electronics & Telecom', share: '53.21%', detail: 'Commanded the majority of 2025 revenue (displays, 5G).', icon: Microchip },
        { name: 'Energy & Power', share: '46.20% CAGR', detail: 'Fastest growing sector for supercapacitors and solar.', icon: Zap },
        { name: 'Healthcare', share: '46.07% CAGR', detail: 'Biosensors, drug delivery, and cancer treatment.', icon: Beaker },
        { name: 'Automotive', share: 'Next-Gen EV', detail: '80% charge in 10 mins, 800km range by 2026.', icon: TrendingUp },
        { name: 'Aerospace', share: 'High Strength', detail: 'Lightweight composites for drones and spacecraft.', icon: ShieldCheck },
        { name: 'Construction', share: 'Sustainable', detail: 'Strengthening concrete and improving insulation.', icon: Building2 },
        { name: 'Water Purification', share: '99.9% Efficiency', detail: 'Advanced membranes for salt and impurity removal.', icon: Droplets },
        { name: 'Coatings', share: 'Anti-Corrosion', detail: 'Superior chemical resistance and EMI shielding.', icon: HardHat },
    ]

    const players = [
        'USA Graphene', 'NanoXplore Inc.', 'Graphene Manufacturing Group (GMG)', 'First Graphene Ltd.',
        'Haydale Graphene Industries', 'Zentek Ltd.', 'Black Swan Graphene', 'Directa Plus',
        'Graphenea', 'Versarien plc', 'CVD Equipment Corp.', 'Global Graphene Group'
    ]

    return (
        <div className="bg-[#0f172a] min-h-screen text-slate-300">

            {/* Premium Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent -z-10" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <FadeIn>
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary-500/10 text-primary-400 ring-1 ring-inset ring-primary-500/20 mb-8">
                            Strategic Research Report 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
                            Graphene Market <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary-500">
                                Outlook 2026
                            </span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-slate-400 leading-relaxed font-light">
                            Global Growth and USA's Strategic Role in the Future of Materials Science.
                            As of 2026, graphene is re-defining industries from energy to aerospace.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Market Cards */}
            <section className="pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FadeInStagger>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stats.map((stat, idx) => (
                                <FadeIn key={idx}>
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-700 hover:border-primary-500/50 transition-all group">
                                        <div className={`p-3 rounded-2xl bg-slate-900 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                                            <stat.icon className={`w-8 h-8 ${stat.color.replace('text-', 'text-opacity-90 ')}`} />
                                        </div>
                                        <p className="text-slate-400 font-medium mb-2">{stat.label}</p>
                                        <p className={`text-3xl font-bold text-white mb-4`}>{stat.value}</p>
                                        <p className="text-slate-500 text-sm leading-relaxed">{stat.description}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </FadeInStagger>
                </div>
            </section>

            {/* USA Strategic Section */}
            <section className="py-24 bg-slate-950/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <h2 className="text-4xl font-bold text-white mb-6">USA: Strategic Rise in a Competitive Landscape</h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                The USA is carving out a specialized niche in advanced manufacturing. With North America's CAGR projected at 36.98%, the strategic focus is on Energy Leadership and Semiconductor innovation.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { label: '2023 Market Value', value: '$65.1M' },
                                    { label: '2030 Projection', value: '$400.1M' },
                                    { label: '2034 Potential', value: '$2.3B+' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                                        <span className="text-slate-400 font-medium">{item.label}</span>
                                        <span className="text-2xl font-bold text-primary-400">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                        <FadeIn>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-primary-600 rounded-[2.5rem] blur opacity-25" />
                                <div className="relative bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Scale className="text-primary-500" />
                                        US Government Support
                                    </h3>
                                    <ul className="space-y-4">
                                        {[
                                            'Department of Energy (DOE): $50M+ annual funding',
                                            'CHIPS and Science Act: Semiconductor materials',
                                            'Department of Defense (DoD): $43M+ in research contracts',
                                            'Critical Minerals Strategy: Domestic supply chain security'
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                                <ChevronRight className="w-4 h-4 text-primary-500 mt-1 shrink-0" />
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Global Drivers Grid */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FadeIn className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Key Global Growth Drivers</h2>
                        <p className="text-slate-500">Multiple vectors converging to drive market expansion.</p>
                    </FadeIn>
                    <FadeInStagger>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {drivers.map((driver, idx) => (
                                <FadeIn key={idx}>
                                    <div className="p-8 bg-slate-900/30 rounded-3xl border border-slate-800 hover:bg-slate-900/60 transition-colors flex gap-6">
                                        <div className="shrink-0 p-3 bg-slate-800 rounded-xl h-fit">
                                            <driver.icon className="w-6 h-6 text-primary-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-2">{driver.title}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">{driver.text}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </FadeInStagger>
                </div>
            </section>

            {/* Application Table */}
            <section className="py-24 bg-slate-950/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FadeIn className="mb-12">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Zap className="text-yellow-500" />
                            Industrial Applications (2025-2026)
                        </h2>
                    </FadeIn>
                    <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {applicationAreas.map((area, idx) => (
                            <FadeIn key={idx} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex justify-between items-center group hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-950 rounded-lg">
                                        <area.icon className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{area.name}</h4>
                                        <p className="text-xs text-slate-500">{area.detail}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-primary-400 font-bold">{area.share}</span>
                                </div>
                            </FadeIn>
                        ))}
                    </FadeInStagger>
                </div>
            </section>

            {/* Industry Players */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <FadeIn>
                        <h2 className="text-3xl font-bold text-white mb-12 flex items-center justify-center gap-3">
                            <Users className="text-blue-500" />
                            Innovation Ecosystem
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {players.map((player, idx) => (
                                <span key={idx} className="px-5 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-sm hover:border-primary-500 hover:text-white transition-all cursor-default">
                                    {player}
                                </span>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Stay Ahead CTA */}
            <section className="py-24 pb-40">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-12 md:p-20 text-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                                    Stay Ahead in the <br /> Graphene Revolution
                                </h2>
                                <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-12 font-light">
                                    The market is moving faster than ever. Contact our experts to discuss how graphene can power your next innovation or explore our latest insights.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                    <a href="/market-research-2026.pdf" download className="px-8 py-4 bg-white text-primary-700 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-black/20 scale-100 hover:scale-105 flex items-center justify-center gap-2">
                                        <Database className="w-5 h-5" />
                                        Download Full Report (PDF)
                                    </a>
                                    <a href="/contact" className="px-8 py-4 bg-primary-500/20 border border-white/30 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                                        Contact Our Experts
                                    </a>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

        </div>
    )
}
