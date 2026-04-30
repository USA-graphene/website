'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// CONCEPT 3: DARK CINEMATIC — "The Reactor"
// The enormous glowing reactor machine IS the full page.
// Minimal text. Industrial. Powerful. Like a defense contractor's website.
// Clarity: A giant machine glowing with energy tells you everything in 0 seconds.

export default function HeroConcept3() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Full-screen reactor image */}
      <Image
        src="/hero-c3-reactor.png"
        alt="Advanced Pulsed Electrical Reactor for graphene production"
        fill
        className="object-cover object-center scale-110"
        priority
      />
      {/* Heavy dark overlay — this is a DARK cinematic page */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

      {/* TOP LEFT: Logo area branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-8 left-8 lg:top-12 lg:left-12"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-[#00c8ff]/70 tracking-[0.2em] uppercase">
          <Shield className="h-3 w-3" />
          Industrial Grade · USA Manufactured
        </div>
      </motion.div>

      {/* BOTTOM LEFT: Main content */}
      <div className="absolute bottom-16 left-8 lg:bottom-20 lg:left-16 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          
          {/* Bold industrial eyebrow */}
          <div className="text-xs font-black tracking-[0.4em] uppercase text-[#00c8ff] mb-5 font-mono">
            ◆ ADVANCED PULSED ELECTRICAL REACTOR
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter">
            Industrial<br />
            Graphene<br />
            <span className="text-[#00c8ff]">Production<br />Machines.</span>
          </h1>

          <div className="mt-6 text-white/70 text-lg font-light max-w-sm border-l border-[#00c8ff]/50 pl-4">
            Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — ready to deploy.
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products/" className="group inline-flex items-center gap-2 px-7 py-4 font-black text-sm tracking-widest uppercase text-black bg-[#00c8ff] hover:bg-white transition-colors">
              View Machines <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link href="/contact/" className="inline-flex items-center gap-2 px-7 py-4 font-black text-sm tracking-widest uppercase text-white border border-white/30 hover:border-[#00c8ff] hover:text-[#00c8ff] transition-all">
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Vertical stat column */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 text-right"
      >
        {[['99.9%','Purity'],['200×','Strength'],['5,300','W/m·K']].map(([val, label]) => (
          <div key={label}>
            <div className="text-2xl font-black text-white">{val}</div>
            <div className="text-xs text-[#8b9ab5] font-mono">{label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
