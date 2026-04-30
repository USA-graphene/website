'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Atom, ChevronRight, Zap, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const stats = [
  { value: '200×', label: 'Stronger than steel', icon: '💎' },
  { value: '99.9%', label: 'Material purity', icon: '✨' },
  { value: '5,300', label: 'W/m·K thermal cond.', icon: '🔥' },
  { value: 'US', label: 'Manufactured', icon: '🇺🇸' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050914] pt-20 pb-16">

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(45,110,240,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(0,200,255,0.08)_0%,transparent_60%)]" />

      {/* Animated Hex grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 52,16 52,44 30,58 8,44 8,16' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}
      />

      {/* Floating Glowing Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#2d6ef0]/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00c8ff]/10 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-0 z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">

          {/* Left: Text Content */}
          <div className="lg:col-span-5 max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              
              {/* Premium Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#2d6ef0]/40 bg-[#2d6ef0]/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-blue-300 mb-8 shadow-[0_0_15px_rgba(45,110,240,0.2)]"
              >
                <ShieldCheck className="h-4 w-4 text-[#00c8ff]" />
                Industrial Graphene — Made in USA
              </motion.div>

              {/* Headline */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                Industrial Graphene, <br/>
                <span className="relative">
                  <span className="absolute -inset-1 bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] blur-xl opacity-30"></span>
                  <span className="relative bg-gradient-to-r from-[#2d6ef0] via-[#4d8bf5] to-[#00c8ff] bg-clip-text text-transparent drop-shadow-sm">
                    Delivered on Your Terms.
                  </span>
                </span>
              </h1>

              <p className="mt-8 text-xl text-[#94a3b8] leading-relaxed font-light">
                Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — <span className="text-white font-medium">ready to deploy.</span>
              </p>

              {/* CTA Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
                <Link
                  href="/products/"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] transition-all hover:scale-105 overflow-hidden shadow-[0_0_40px_rgba(45,110,240,0.4)] hover:shadow-[0_0_60px_rgba(0,200,255,0.6)] border border-white/10"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    View Products
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/applications/"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl text-base font-semibold text-white border border-white/10 bg-white/5 backdrop-blur-md hover:border-[#00c8ff]/50 hover:bg-[#00c8ff]/10 transition-all hover:scale-105"
                >
                  Explore Applications
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-[#8b9ab5] group-hover:text-[#00c8ff]" />
                </Link>
              </div>

              {/* Stats Row - Glassmorphism */}
              <div className="mt-16 grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="relative group rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 shadow-2xl overflow-hidden cursor-default transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-extrabold text-white font-display tracking-tight">{s.value}</div>
                        <div className="text-xl opacity-50 grayscale group-hover:grayscale-0 transition-all">{s.icon}</div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#8b9ab5]">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7 relative mt-20 lg:mt-0 lg:ml-10"
          >
            {/* Massive Glow behind image */}
            <div className="absolute -inset-10 bg-gradient-to-r from-[#2d6ef0]/30 via-[#00c8ff]/20 to-transparent rounded-full blur-3xl opacity-70 animate-pulse" />

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-3xl overflow-hidden border border-white/20 shadow-[0_30px_100px_rgba(0,100,255,0.25)] ring-1 ring-white/10 backdrop-blur-sm"
            >
              {/* The new stunning 3D Image */}
              <Image
                src="/hero-graphene-new.png"
                alt="Futuristic Graphene Molecular Structure in Advanced Cleanroom"
                width={1200}
                height={800}
                className="w-full object-cover transform scale-105 hover:scale-100 transition-transform duration-1000"
                priority
              />
              
              {/* Inner vignette overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,9,20,0.6)_100%)] pointer-events-none" />
              
              {/* Bottom gradient fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/90 via-[#050914]/20 to-transparent pointer-events-none" />

              {/* Floating Tech Badge on Image */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-6 left-6 right-6 lg:left-8 lg:right-auto"
              >
                <div className="group flex items-center gap-4 rounded-2xl bg-[#050914]/80 backdrop-blur-xl border border-white/15 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#050914]/90 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2d6ef0] to-[#00c8ff] shadow-lg group-hover:scale-110 transition-transform">
                    <Atom className="h-6 w-6 text-white animate-spin-slow" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Advanced Pulsed Electrical Reactor</div>
                    <div className="text-xs text-[#00c8ff] font-mono mt-0.5 tracking-wide">SYSTEM_STATUS: ONLINE // 1G &lt; 100MS</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
