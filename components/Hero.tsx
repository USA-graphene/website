'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronRight, Zap, Shield, Factory, Atom } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const features = [
  { icon: Factory, label: 'Complete Factories',  desc: 'Full production lines, turnkey delivered',        href: '/equipment/' },
  { icon: Zap,     label: 'Industrial Machines', desc: 'Pulsed electrical reactor technology',            href: '/equipment/' },
  { icon: Atom,    label: 'Pure Materials',       desc: '99.9% turbostratic graphene powder',             href: '/products/' },
  { icon: Shield,  label: 'US Manufactured',      desc: 'Designed and built in America',                  href: '/about/' },
]

const stats = [
  { value: '200×',  label: 'Stronger than steel' },
  { value: '99.9%', label: 'Purity grade' },
  { value: '5,300', label: 'W/m·K thermal' },
  { value: '<100ms', label: 'Per gram production' },
]

/* Shared motion presets — disabled when OS prefers reduced motion */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: 'easeOut' as const },
})

const fadeLeft = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.75, ease: 'easeOut' as const },
}

export default function Hero() {
  const prefersReduced = useReducedMotion()

  return (
    <div className="bg-[#eef1f6] min-h-screen overflow-x-hidden font-sans relative selection:bg-blue-500/30">

      {/* ── AMBIENT BLOBS ────────────────────────────────────────────────────────
          • `contain: strict` prevents paint bleed outside the div.
          • On mobile the blobs are removed (hidden sm:block) — blur-[120px] on
            low-end GPUs causes serious jank.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        className="hidden sm:block fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ contain: 'strict', willChange: 'transform' }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/40 to-indigo-500/30 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[60%] bg-gradient-to-tl from-emerald-300/40 to-cyan-400/30 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-pink-400/20 rounded-full blur-[80px] mix-blend-multiply" />
      </div>

      {/* Mobile-only lightweight gradient (no blur, no mix-blend) */}
      <div
        className="sm:hidden absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 20% 0%, rgba(99,155,255,0.25) 0%, transparent 70%),' +
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(52,211,153,0.2) 0%, transparent 70%)',
        }}
      />

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen pt-24 sm:pt-32 pb-36 sm:pb-48 z-10 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT — Text */}
          <motion.div {...(prefersReduced ? {} : fadeLeft)}>

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.05)] text-slate-800 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              Industrial Graphene — Made in USA
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6 sm:mb-8">
              Graphene<br />
              production<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                machines.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-md mb-8 sm:mb-10 font-medium">
              Machines, materials, and full factories for serious manufacturers. High-purity turbostratic graphene at industrial scale —{' '}
              <strong className="text-slate-900">ready to deploy.</strong>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4">
              <Link
                href="/equipment/"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] hover:from-[#1a55d0] hover:to-[#00b0ff] text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-colors duration-200 shadow-[0_6px_20px_rgba(45,110,240,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] text-sm sm:text-base active:scale-95"
              >
                View Our Machines <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Link>
              <Link
                href="/contact/"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 text-slate-900 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-colors duration-200 text-sm sm:text-base shadow-[0_2px_12px_rgba(0,0,0,0.05),inset_0_1px_4px_rgba(255,255,255,0.8)] active:scale-95"
              >
                Contact Sales <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — Machine card */}
          <motion.div
            {...(prefersReduced ? {} : fadeUp(0.25))}
            className="relative"
          >
            {/* Crystal card */}
            <div className="relative p-6 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/20 border border-white/50 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),inset_0_-2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.12)] flex justify-center items-center mt-4 lg:mt-0"
              style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              {/* Speech bubble — CSS animation instead of Framer loop */}
              <div
                className="absolute -top-5 -left-2 sm:-left-5 z-20 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-3xl rounded-bl-sm shadow-[0_8px_20px_rgba(45,110,240,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 max-w-[190px] sm:max-w-[220px]"
                style={{ animation: 'heroFloat 4s ease-in-out infinite' }}
              >
                1 gram of graphene<br />produced in &lt;100ms ⚡
              </div>

              <Image
                src="/hero-illustration.png"
                alt="Graphene production machine"
                width={600}
                height={600}
                className="w-full max-w-[320px] sm:max-w-[400px] rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-transform duration-500 hover:scale-[1.03]"
                priority
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 400px"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="relative left-0 right-0 z-20 mt-10 sm:mt-0 sm:absolute sm:bottom-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  {...(prefersReduced ? {} : fadeUp(0.5 + i * 0.08))}
                  className="bg-white/30 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 lg:p-6 shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),inset_0_-1px_4px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.08)] border border-white/60 hover:-translate-y-0.5 transition-transform duration-300"
                  style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800">{s.value}</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-slate-600 mt-1 font-semibold tracking-wide leading-tight">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 lg:py-32 px-5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="inline-flex items-center bg-white/40 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)] text-blue-600 text-xs font-black px-5 py-2 rounded-full tracking-widest uppercase mb-5">
              What We Offer
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 leading-tight">
              Everything you need to<br className="hidden sm:inline" /> produce graphene at scale.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">
            {features.map(({ icon: Icon, label, desc, href }, i) => (
              <Link key={label} href={href} passHref className="block h-full group">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  className="bg-white/30 rounded-[2rem] p-6 sm:p-7 lg:p-8 border border-white/60 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.07)] group-hover:-translate-y-1.5 group-hover:shadow-[inset_0_2px_12px_rgba(255,255,255,0.9),0_16px_36px_rgba(45,110,240,0.12)] transition-all duration-400 h-full relative overflow-hidden flex flex-col"
                  style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                >
                  {/* Glass top glare */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_6px_14px_rgba(45,110,240,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-400">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">{label}</h3>
                    <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed flex-1">{desc}</p>

                    <div className="mt-6 sm:mt-8 flex items-center gap-1.5 text-blue-600 font-bold text-xs sm:text-sm bg-white/50 px-4 py-2 rounded-full w-max border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_4px_rgba(0,0,0,0.04)] group-hover:bg-white/80 transition-colors">
                      Learn more <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOLD CTA BAND ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-6 lg:px-8 pb-20 sm:pb-28 lg:pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] bg-[#0f172a]/70 border border-white/20 shadow-[inset_0_2px_16px_rgba(255,255,255,0.12),0_16px_40px_rgba(0,0,0,0.35)] p-8 sm:p-12 lg:p-16 xl:p-24 text-center"
            style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
          >
            {/* Blobs — hidden on mobile, lighter blur on tablet */}
            <div className="hidden sm:block absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-blue-500/30 rounded-full blur-[60px] pointer-events-none" />
            <div className="hidden sm:block absolute bottom-[-50%] right-[-10%] w-[60%] h-[150%] bg-cyan-400/20 rounded-full blur-[60px] pointer-events-none" />

            {/* Mobile-only simple gradient */}
            <div className="sm:hidden absolute inset-0 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 sm:mb-8 drop-shadow-lg">
                Ready to build your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  graphene operation?
                </span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium">
                From a single machine to a complete factory — we engineer, manufacture, and deploy everything you need.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/contact/"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00c8ff] to-[#2d6ef0] hover:opacity-90 text-white font-black px-8 py-4 rounded-full text-sm sm:text-base transition-opacity duration-200 shadow-[0_6px_24px_rgba(0,200,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.3)] w-full sm:w-auto active:scale-95"
                >
                  Get a Quote <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
                <Link
                  href="/products/"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full text-sm sm:text-base transition-colors duration-200 shadow-[inset_0_1px_4px_rgba(255,255,255,0.08)] w-full sm:w-auto active:scale-95"
                  style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                >
                  Browse Products <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 flex-shrink-0" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
