'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// CONCEPT 1: FULL-BLEED FACTORY — "The Factory" 
// Image takes 100% of viewport. Bold white text centered over it.
// 1-second clarity: You see a real factory making machines. Done.

export default function HeroConcept1() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-bleed background image */}
      <Image
        src="/hero-c1-factory.png"
        alt="USA Graphene industrial production factory"
        fill
        className="object-cover object-center"
        priority
      />
      {/* Dark vignette — top transparent, bottom very dark so text pops */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />
      {/* Side vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Eyebrow */}
          <div className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-[0.3em] uppercase text-[#00c8ff] border border-[#00c8ff]/40 bg-[#00c8ff]/10 rounded-full">
            American-Made Industrial Equipment
          </div>

          {/* Main headline — max 5 words for 1-sec clarity */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
            We Build<br />
            <span className="bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] bg-clip-text text-transparent">
              Graphene Factories.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto font-light">
            Machines, materials, and full factories for serious manufacturers.<br />
            High-purity turbostratic graphene at industrial scale — ready to deploy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products/" className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,200,255,0.4)] text-base">
              See Our Machines <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/applications/" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white border border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-base">
              <Play className="h-4 w-4" /> Watch It Work
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom stat bar */}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-4 divide-x divide-white/10">
          {[['200×','Stronger than steel'],['99.9%','Material purity'],['5,300 W/m·K','Thermal conductivity'],['US-Made','Industrial equipment']].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center px-4">
              <div className="text-xl font-extrabold text-white">{val}</div>
              <div className="text-xs text-[#8b9ab5] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
