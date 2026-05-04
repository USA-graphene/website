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
    <div className="bg-[#eef1f6] min-h-screen overflow-hidden font-sans relative selection:bg-blue-500/30">
      {/* ─── DYNAMIC GLASSMORPHISM BACKGROUNDS ─── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/40 to-indigo-500/30 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[60%] bg-gradient-to-tl from-emerald-300/40 to-cyan-400/30 rounded-full blur-[140px] mix-blend-multiply" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen pt-32 pb-48 z-10 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Eyebrow tag in a glass pill */}
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[inset_0_2px_8px_rgba(255,255,255,1),0_4px_12px_rgba(0,0,0,0.05)] text-slate-800 text-xs font-bold px-5 py-2.5 rounded-full mb-8 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              Industrial Graphene — Made in USA
            </div>

            {/* Large bold headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
              Graphene<br />
              production<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">machines.</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-md mb-10 font-medium">
              Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale — <strong className="text-slate-900">ready to deploy.</strong>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/equipment/"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] hover:from-[#1a55d0] hover:to-[#00b0ff] text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-[0_8px_30px_rgba(45,110,240,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] text-base"
              >
                View Our Machines <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact/"
                className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl border border-white/60 hover:bg-white/60 text-slate-900 font-bold px-8 py-4 rounded-full transition-all text-base shadow-[0_4px_20px_rgba(0,0,0,0.05),inset_0_2px_8px_rgba(255,255,255,1)]"
              >
                Contact Sales <ChevronRight className="h-5 w-5 text-slate-500" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: Machine illustration inside Thick Crystal Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            {/* Thick Crystal Card Wrapper */}
            <div className="relative p-8 sm:p-12 rounded-[3rem] bg-white/20 backdrop-blur-[40px] border border-white/50 shadow-[inset_0_4px_16px_rgba(255,255,255,0.9),inset_0_-4px_12px_rgba(0,0,0,0.05),0_24px_60px_rgba(0,0,0,0.15)] flex justify-center items-center mt-12 lg:mt-0">
              
              {/* Floating speech bubble — Glass style */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-2 sm:-left-6 z-20 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold px-5 py-3.5 rounded-3xl rounded-bl-sm shadow-[0_12px_24px_rgba(45,110,240,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-white/20 max-w-[220px]"
              >
                1 gram of graphene<br />produced in &lt;100ms ⚡
              </motion.div>

              <Image
                src="/hero-illustration.png"
                alt="Graphene production machine"
                width={600}
                height={600}
                className="w-full max-w-[400px] rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>
          </motion.div>

        </div>
        
        {/* Stats row floating below */}
        <div className="absolute bottom-12 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white/30 backdrop-blur-[40px] rounded-[2rem] p-5 sm:p-6 shadow-[inset_0_4px_12px_rgba(255,255,255,1),inset_0_-2px_6px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.1)] border border-white/60 transition-transform hover:-translate-y-1"
                >
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 drop-shadow-sm">{s.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600 mt-1.5 font-semibold tracking-wide">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE OFFER SECTION ─── */}
      <section className="relative z-10 py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center bg-white/40 backdrop-blur-lg border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,1)] text-blue-600 text-xs font-black px-5 py-2 rounded-full tracking-widest uppercase mb-6">
              What We Offer
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight drop-shadow-sm">
              Everything you need to<br />produce graphene at scale.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map(({ icon: Icon, label, desc, href }, i) => (
              <Link key={label} href={href} passHref className="block h-full group">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="bg-white/30 backdrop-blur-[50px] rounded-[2.5rem] p-8 border border-white/60 shadow-[inset_0_4px_12px_rgba(255,255,255,0.9),0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[inset_0_4px_16px_rgba(255,255,255,1),0_24px_48px_rgba(45,110,240,0.15)] h-full relative overflow-hidden flex flex-col"
                >
                  {/* Glass highlight glare */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-8 shadow-[0_8px_16px_rgba(45,110,240,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-500">
                      <Icon className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3">{label}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed flex-1">{desc}</p>
                    
                    <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm bg-white/50 px-4 py-2.5 rounded-full w-max border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_2px_8px_rgba(0,0,0,0.05)] group-hover:bg-white/80 transition-colors">
                      Learn more <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOLD CTA BAND (THICK CRYSTAL BAR) ─── */}
      <section className="relative z-10 px-6 lg:px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[3rem] sm:rounded-[4rem] bg-[#0f172a]/70 backdrop-blur-[60px] border border-white/20 shadow-[inset_0_4px_24px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.4)] p-12 sm:p-16 lg:p-24 text-center"
          >
            {/* Inner colorful blobs for refraction */}
            <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-blue-500/40 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[150%] bg-cyan-400/30 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-8 drop-shadow-lg">
                Ready to build your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">graphene operation?</span>
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-medium">
                From a single machine to a complete factory — we engineer, manufacture, and deploy everything you need.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link href="/contact/" className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#00c8ff] to-[#2d6ef0] hover:scale-105 text-white font-black px-10 py-5 rounded-full text-base transition-all shadow-[0_8px_32px_rgba(0,200,255,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] w-full sm:w-auto">
                  Get a Quote <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/products/" className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold px-10 py-5 rounded-full text-base transition-all shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] w-full sm:w-auto">
                  Browse Products <ChevronRight className="h-5 w-5 text-white/60" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
