'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// CONCEPT 4: LUXURY EDITORIAL — "The Material"
// Looks like a luxury brand page (Rolex meets industrial material science).
// Massive editorial typography. Powder macro image. Premium feel.
// Clarity: Something incredibly valuable and rare is being manufactured here.

export default function HeroConcept4() {
  return (
    <section className="min-h-screen bg-[#08080a] overflow-hidden relative flex flex-col">

      {/* Top nav accent */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex-1 grid lg:grid-cols-2 gap-0">

        {/* LEFT: Editorial typography — full height column */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col justify-between p-10 lg:p-16 xl:p-20 border-r border-white/5"
        >
          <div>
            {/* Serial-number style label */}
            <div className="font-mono text-xs tracking-[0.4em] text-white/30 uppercase mb-16">
              USA-GRAPHENE / INDUSTRIAL DIVISION / EST. 2024
            </div>

            {/* Giant editorial headline */}
            <h1 className="text-[clamp(4rem,10vw,9rem)] font-black text-white leading-[0.9] tracking-[-0.03em]">
              THE<br/>
              WORLD'S<br/>
              FINEST<br/>
              <span className="text-white/20">GRAPHENE</span>
            </h1>

            <div className="mt-10 ml-2 border-l border-[#2d6ef0] pl-6 max-w-md">
              <p className="text-white/80 text-xl font-light leading-relaxed">
                Machines, materials, and full factories for serious manufacturers.
              </p>
              <p className="text-white/40 text-base mt-3 font-light">
                High-purity turbostratic graphene at industrial scale — ready to deploy.
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4">
            <Link href="/products/" className="group inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-[#00c8ff] border border-[#00c8ff]/30 hover:bg-[#00c8ff] hover:text-black px-8 py-4 transition-all">
              Our Machines <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact/" className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-white/30 hover:text-white px-4 py-4 transition-colors border-b border-transparent hover:border-white/20">
              Request Pricing →
            </Link>
          </div>
        </motion.div>

        {/* RIGHT: Premium material image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
          className="relative min-h-[60vh] lg:min-h-screen"
        >
          <Image
            src="/hero-c4-powder.png"
            alt="Premium graphene powder material"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Luxury dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#08080a]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent" />

          {/* Floating material badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-10 right-10"
          >
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-mono text-[#00c8ff]/70 tracking-[0.2em] uppercase mb-1">Purity Grade</div>
                <div className="text-5xl font-black text-white">99.9%</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-white/30 tracking-[0.2em] uppercase mb-1">Thermal Conductivity</div>
                <div className="text-3xl font-black text-white/60">5,300 W/m·K</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
