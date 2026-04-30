'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// CONCEPT 2: BOLD SPLIT-SCREEN
// Left: Pure black with giant typographic statement
// Right: Atomic graphene macro filling the panel
// Clarity: You understand it's a tech/science manufacturing site in 0.5 seconds.

const pills = ['Machines', 'Materials', 'Full Factories']

export default function HeroConcept2() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-black overflow-hidden">

      {/* LEFT: Typography panel */}
      <div className="lg:w-1/2 flex flex-col justify-center px-10 lg:px-16 xl:px-24 py-20 lg:py-0 relative z-10">
        {/* Top accent line */}
        <div className="w-16 h-1 bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] mb-10 rounded-full" />

        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex gap-2 mb-8">
            {pills.map(p => (
              <span key={p} className="text-xs font-bold px-3 py-1 rounded-full bg-[#2d6ef0]/20 text-[#00c8ff] border border-[#2d6ef0]/30">{p}</span>
            ))}
          </div>

          <h1 className="text-6xl xl:text-8xl font-black text-white leading-none tracking-tighter">
            THE<br/>
            <span className="text-stroke">GRAPHENE</span><br/>
            <span className="bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] bg-clip-text text-transparent">MACHINE.</span>
          </h1>

          <p className="mt-8 text-lg text-white/60 max-w-sm leading-relaxed border-l-2 border-[#2d6ef0] pl-5">
            Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — ready to deploy.
          </p>

          <div className="mt-12 flex flex-col gap-4 items-start">
            <Link href="/products/" className="group inline-flex items-center gap-3 px-8 py-4 rounded-none font-bold text-black bg-[#00c8ff] hover:bg-white transition-all text-base tracking-wide">
              REQUEST A MACHINE <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/applications/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#00c8ff] transition-colors">
              View Applications <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Bottom specs */}
        <div className="absolute bottom-10 left-10 lg:left-16 xl:left-24 flex items-center gap-2 text-xs text-white/30 font-mono">
          <Zap className="h-3 w-3 text-[#00c8ff]" />
          ADVANCED PULSED ELECTRICAL REACTOR // 1G &lt; 100MS // 99.9% PURITY
        </div>
      </div>

      {/* RIGHT: Full-bleed atomic image */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="lg:w-1/2 relative min-h-[50vh] lg:min-h-screen"
      >
        <Image
          src="/hero-c2-atomic.png"
          alt="Graphene atomic lattice structure"
          fill
          className="object-cover"
          priority
        />
        {/* Left fade into black */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent lg:block hidden" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden" />

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute top-8 right-8 bg-black/70 backdrop-blur-xl border border-[#00c8ff]/30 rounded-2xl px-5 py-4"
        >
          <div className="text-xs text-[#00c8ff] font-mono tracking-widest mb-1">MATERIAL CLASS</div>
          <div className="text-2xl font-black text-white">GRAPHENE</div>
          <div className="text-xs text-white/50 mt-1">C · Hexagonal · 2D lattice</div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .text-stroke {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
      `}</style>
    </section>
  )
}
