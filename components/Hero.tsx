'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Atom, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const stats = [
  { value: '200×', label: 'Stronger than steel' },
  { value: '99.9%', label: 'Material purity' },
  { value: '5,300', label: 'W/m·K thermal cond.' },
  { value: 'US', label: 'Manufactured' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#070d1a] pt-16">

      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_60%_40%,rgba(45,110,240,0.14)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(0,200,255,0.07)_0%,transparent_60%)]" />

      {/* Hex grid */}
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 52,16 52,44 30,58 8,44 8,16' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left: text */}
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
                <Atom className="h-3.5 w-3.5" />
                Industrial Graphene — Made in USA
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Industrial Graphene,{' '}
                <span className="bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] bg-clip-text text-transparent">
                  Delivered on Your Terms.
                </span>
              </h1>

              <p className="mt-6 text-lg text-[#8b9ab5] leading-relaxed">
                Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — ready to deploy.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/products/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2d6ef0] to-[#1a55d0] hover:from-[#3a7af5] hover:to-[#2d6ef0] transition-all shadow-[0_4px_20px_rgba(45,110,240,0.4)] hover:shadow-[0_8px_32px_rgba(45,110,240,0.55)]"
                >
                  View Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/applications/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white border border-white/15 hover:border-[#2d6ef0]/50 hover:bg-[#2d6ef0]/10 transition-all"
                >
                  Explore Applications
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="rounded-xl bg-white/5 border border-white/8 px-3 py-3 text-center"
                  >
                    <div className="text-xl font-bold text-white font-display">{s.value}</div>
                    <div className="mt-0.5 text-xs text-[#8b9ab5]">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mt-16 lg:mt-0"
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#2d6ef0]/20 to-[#00c8ff]/10 rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <Image
                src="/hero-graphene.jpg"
                alt="Industrial graphene production machinery and turbostratic graphene materials from USA Graphene"
                width={900}
                height={600}
                className="w-full object-cover"
                priority
              />
              {/* Overlay gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070d1a]/60 via-transparent to-transparent" />

              {/* Floating badge on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#070d1a]/85 backdrop-blur-sm border border-white/10 px-4 py-2.5 text-xs text-white">
                  <Zap className="h-3.5 w-3.5 text-[#00c8ff]" />
                  <span className="font-semibold">Advanced Pulsed Electrical Reactor Technology</span>
                  <span className="text-[#8b9ab5]">— 1g in &lt; 100ms</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
