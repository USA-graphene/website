'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Battery, Plane, Sun } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// CONCEPT 5: "POWERS EVERYTHING" — Applications-focused
// Center-positioned text over a stunning tech applications montage.
// Scrolling application ticker. Enterprise buyer immediately understands:
// "This material goes into my product." Bold ROI-focused headline.

const apps = [
  { icon: Battery, label: 'EV Batteries', sub: '3× faster charging' },
  { icon: Plane, label: 'Aerospace', sub: '200× stronger than steel' },
  { icon: Cpu, label: 'Semiconductors', sub: 'Next-gen chips' },
  { icon: Sun, label: 'Solar Panels', sub: '+40% efficiency' },
]

export default function HeroConcept5() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020810]">
      {/* Background: applications image */}
      <Image
        src="/hero-c5-applications.png"
        alt="Graphene powering aerospace, batteries, semiconductors and solar panels"
        fill
        className="object-cover object-center"
        priority
      />
      {/* Strong central darkening so text is always readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(2,8,16,0.6)_0%,rgba(2,8,16,0.85)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020810]/80 via-transparent to-[#020810]/80" />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-[#00c8ff] bg-[#00c8ff]/10 border border-[#00c8ff]/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00c8ff] animate-pulse" />
            One Material · Infinite Applications
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight max-w-5xl">
            Graphene That<br />
            <span className="bg-gradient-to-r from-[#2d6ef0] via-[#00c8ff] to-[#2d6ef0] bg-clip-text text-transparent">
              Powers Industries.
            </span>
          </h1>

          <p className="mt-6 text-xl text-white/70 max-w-2xl font-light mx-auto">
            Machines, materials, and full factories for serious manufacturers.<br />
            <span className="text-white font-medium">High-purity turbostratic graphene at industrial scale — ready to deploy.</span>
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products/" className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] hover:scale-105 transition-all shadow-[0_0_50px_rgba(0,200,255,0.35)] text-base">
              Get Our Machines <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/applications/" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-base">
              View All Applications
            </Link>
          </div>
        </motion.div>

        {/* Application cards row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full"
        >
          {apps.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#00c8ff]/40 hover:bg-[#00c8ff]/5 transition-all cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00c8ff]/10 border border-[#00c8ff]/20 group-hover:bg-[#00c8ff]/20 transition-colors">
                <Icon className="h-6 w-6 text-[#00c8ff]" />
              </div>
              <div className="text-sm font-bold text-white">{label}</div>
              <div className="text-xs text-[#8b9ab5] text-center">{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
