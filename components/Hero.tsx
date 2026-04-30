'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Zap, Shield, Factory, Atom } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'


const features = [
  { icon: Factory, label: 'Complete Factories', desc: 'Full production lines, turnkey delivered', href: '/equipment/' },
  { icon: Zap, label: 'Industrial Machines', desc: 'Pulsed electrical reactor technology', href: '/equipment/' },
  { icon: Atom, label: 'Pure Materials', desc: '99.9% turbostratic graphene powder', href: '/products/' },
  { icon: Shield, label: 'US Manufactured', desc: 'Designed and built in America', href: '/about/' },
]

const stats = [
  { value: '200×', label: 'Stronger than steel' },
  { value: '99.9%', label: 'Purity grade' },
  { value: '5,300', label: 'W/m·K thermal' },
  { value: '<100ms', label: 'Per gram production' },
]

export default function Hero() {
  return (
    <div className="bg-[#f4f1ec] min-h-screen overflow-hidden font-sans">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Large organic blue blob — right side, like PA's yellow blob */}
        <div className="absolute top-0 right-0 w-[65%] h-full pointer-events-none">
          <svg viewBox="0 0 800 900" preserveAspectRatio="xMaxYMin slice" className="w-full h-full">
            <path
              d="M 800 0 L 800 900 L 0 900 C 80 750 0 600 100 450 C 180 310 60 150 220 60 C 380 -20 560 30 680 0 Z"
              fill="#1a3a6b"
            />
          </svg>
        </div>

        {/* Decorative ring — top right */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-16 right-12 w-32 h-32 pointer-events-none"
        >
          <div className="w-full h-full rounded-full border-[10px] border-[#2d6ef0] opacity-40" />
          <div className="absolute inset-4 rounded-full border-[6px] border-[#00c8ff] opacity-60" />
        </motion.div>

        {/* Decorative hex dots — left side */}
        <div className="absolute left-8 top-1/3 opacity-20 pointer-events-none">
          {[0,1,2,3,4].map(row => (
            <div key={row} className="flex gap-3 mb-3">
              {[0,1,2,3].map(col => (
                <div key={col} style={{ marginLeft: row % 2 === 1 ? '8px' : '0' }} className="w-2 h-2 rounded-full bg-[#1a3a6b]" />
              ))}
            </div>
          ))}
        </div>

        {/* Decorative X marks */}
        <div className="absolute bottom-32 left-1/3 text-[#1a3a6b]/20 text-4xl font-black pointer-events-none select-none">✕</div>
        <div className="absolute bottom-48 left-1/4 text-[#1a3a6b]/10 text-2xl font-black pointer-events-none select-none">✕</div>

        {/* Small decorative circle — bottom left */}
        <div className="absolute bottom-12 left-16 w-16 h-16 rounded-full border-[6px] border-[#2d6ef0]/30 pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-8 h-8 rounded-full bg-[#00c8ff]/20 pointer-events-none" />

        {/* Content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 pt-32 pb-24 grid lg:grid-cols-2 gap-12 items-center min-h-screen">

          {/* LEFT: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c8ff] animate-pulse" />
              Industrial Graphene — Made in USA
            </div>

            {/* Large bold headline — PA style */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#0f1f3d] leading-[1.0] tracking-tight mb-8">
              Graphene<br />
              production<br />
              <span className="text-[#2d6ef0]">machines.</span>
            </h1>

            <p className="text-xl text-[#4a5568] leading-relaxed max-w-md mb-10 font-medium">
              Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — <strong className="text-[#0f1f3d]">ready to deploy.</strong>
            </p>

            {/* CTA buttons — PA style pill buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/equipment/"
                className="inline-flex items-center gap-3 bg-[#2d6ef0] hover:bg-[#1a55d0] text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-[0_8px_30px_rgba(45,110,240,0.4)] text-base"
              >
                View Our Machines <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact/"
                className="inline-flex items-center gap-3 bg-transparent border-2 border-[#0f1f3d] hover:bg-[#0f1f3d] hover:text-white text-[#0f1f3d] font-bold px-8 py-4 rounded-full transition-all text-base"
              >
                Contact Sales <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]"
                >
                  <div className="text-2xl font-black text-[#0f1f3d]">{s.value}</div>
                  <div className="text-xs text-[#64748b] mt-1 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Machine illustration — floats like PA astronaut */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* Floating speech bubble */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 z-20 bg-[#2d6ef0] text-white text-sm font-bold px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg max-w-[220px]"
            >
              1 gram of graphene<br />produced in &lt;100ms ⚡
              <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[0px] border-t-[12px] border-t-[#2d6ef0]" />
            </motion.div>

            {/* The machine illustration */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Image
                src="/hero-illustration.png"
                alt="Graphene production machine"
                width={600}
                height={600}
                className="w-full max-w-[480px] drop-shadow-2xl"
                priority
              />

              {/* Glow under illustration */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 bg-[#1a3a6b]/20 rounded-full blur-xl" />
            </motion.div>
          </motion.div>

        </div>

        {/* Wave divider at bottom — like PA's organic section transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── WHAT WE OFFER SECTION ─── */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-[#eef3ff] text-[#2d6ef0] text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-4">
              What We Offer
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0f1f3d] leading-tight">
              Everything you need to<br />produce graphene at scale.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, label, desc, href }, i) => (
              <Link key={label} href={href}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(45,110,240,0.15)" }}
                  className="bg-[#f8fafc] rounded-3xl p-8 border border-[#e2e8f0] cursor-pointer transition-all duration-300 group h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1a3a6b] flex items-center justify-center mb-6 group-hover:bg-[#2d6ef0] transition-colors">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-[#0f1f3d] mb-2">{label}</h3>
                  <p className="text-[#64748b] font-medium leading-relaxed">{desc}</p>
                  <div className="mt-6 flex items-center gap-1 text-[#2d6ef0] font-bold text-sm group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOLD CTA BAND ─── */}
      <section className="bg-[#1a3a6b] py-20 px-8 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#2d6ef0]/20 rounded-l-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-[#00c8ff]/10 rounded-r-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-8">
              Ready to build your<br />
              <span className="text-[#00c8ff]">graphene operation?</span>
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto font-medium">
              From a single machine to a complete factory — we engineer, manufacture, and deploy everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact/" className="inline-flex items-center gap-3 bg-[#00c8ff] hover:bg-white text-[#0f1f3d] font-black px-10 py-5 rounded-full text-base transition-all hover:scale-105 shadow-[0_8px_40px_rgba(0,200,255,0.4)]">
                Get a Quote <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/products/" className="inline-flex items-center gap-3 border-2 border-white/30 hover:border-white text-white font-bold px-10 py-5 rounded-full text-base transition-all">
                Browse Products <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
