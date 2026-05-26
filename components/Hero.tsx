'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronRight, Zap, Shield, Factory, Atom, Gauge, Cog, TrendingUp, FlaskConical, SlidersHorizontal, Headphones, ClipboardCheck, Wrench } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const features = [
  { icon: Factory, label: 'Complete Factories',  desc: 'Full production lines, turnkey delivered',        href: '/equipment/' },
  { icon: Zap,     label: 'Industrial Machines', desc: 'Pulsed electrical reactor technology',            href: '/equipment/' },
  { icon: Atom,    label: 'Pure Materials',       desc: '99.9% turbostratic graphene powder',             href: '/products/' },
  { icon: Shield,  label: 'US Manufactured',      desc: 'Designed and built in America',                  href: '/about/' },
]

const stats = [
  { icon: Gauge, value: '70 g / 30 sec', label: 'High-yield production per cycle' },
  { icon: Cog, value: 'Automated Process', label: 'Engineered for consistency and efficiency' },
  { icon: Shield, value: 'US-Made Equipment', label: 'Designed and built in the USA' },
  { icon: TrendingUp, value: 'Factory Scale Path', label: 'From pilot to full-scale production' },
]

const processSteps = [
  {
    title: 'Feedstock Testing',
    body: 'We validate your carbon materials for performance, resistance, and moisture to ensure ideal results.',
    image: '/hero-c4-powder.png',
    icon: FlaskConical,
    detail: 'Material analysis',
    subdetail: 'Electrical & moisture testing',
  },
  {
    title: 'Reactor Selection',
    body: 'We engineer the right system for your goals, including batch size, output targets, and automation level.',
    image: '/flash-graphene-machine.jpg',
    icon: Cog,
    detail: 'System sizing',
    subdetail: 'Process matching',
  },
  {
    title: 'Process Setup',
    body: 'Our team configures pulse settings, electrodes, pressure, and controls for maximum yield and stability.',
    image: '/hero-machine-new.png',
    icon: SlidersHorizontal,
    detail: 'Pulse tuning',
    subdetail: 'Automation & safety',
  },
  {
    title: 'Production Scale-Up',
    body: 'We support installation, operator training, and ongoing optimization as you scale to full production.',
    image: '/hero-c1-factory.png',
    icon: TrendingUp,
    detail: 'Training & support',
    subdetail: 'Sustained performance',
  },
]

const processProof = [
  { icon: Shield, title: 'US-Made Equipment', body: 'Built in the USA with quality you can trust.' },
  { icon: Wrench, title: 'Engineered for Reliability', body: 'Designed for long-term industrial performance.' },
  { icon: Headphones, title: 'Expert Support', body: 'Hands-on support from lab to full-scale.' },
  { icon: ClipboardCheck, title: 'Proven Process', body: 'Repeatable results. Scalable systems.' },
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
      <section className="relative z-10 px-5 pb-16 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/72 shadow-[0_24px_80px_rgba(45,76,120,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(30deg, transparent 48%, rgba(45,110,240,0.5) 49%, rgba(45,110,240,0.5) 51%, transparent 52%)', backgroundSize: '34px 34px' }} />

          <div className="relative grid min-h-[680px] lg:grid-cols-[0.95fr_1.15fr]">
            <motion.div
              {...(prefersReduced ? {} : fadeLeft)}
              className="relative z-20 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-14"
            >
              <div className="mb-8 flex items-center gap-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700 sm:text-sm">
                  Graphene production equipment
                </p>
                <div className="hidden h-px w-20 bg-blue-700/40 sm:block" />
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                Industrial graphene reactors built for{' '}
                <span className="text-blue-700">repeatable output.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                From lab validation to factory-scale production, USA Graphene designs and builds pulsed electrical carbon-conversion systems for serious manufacturing teams.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact/"
                  className="inline-flex items-center justify-center gap-3 rounded-md bg-blue-700 px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_12px_30px_rgba(29,78,216,0.24)] transition-colors hover:bg-blue-800 active:scale-95"
                >
                  Request Quote <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </Link>
                <Link
                  href="/equipment/"
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-slate-800/50 bg-white/70 px-7 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-white active:scale-95"
                >
                  View Equipment <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              {...(prefersReduced ? {} : fadeUp(0.2))}
              className="relative min-h-[360px] lg:min-h-full"
            >
              <div className="absolute inset-y-0 -left-20 z-10 hidden w-40 skew-x-[-14deg] bg-white lg:block" />
              <Image
                src="/flash-graphene-machine.jpg"
                alt="Industrial graphene production reactor"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent lg:hidden" />
            </motion.div>
          </div>

          <div className="relative z-30 mx-4 -mt-8 mb-6 grid gap-0 overflow-hidden rounded-2xl bg-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.3)] sm:mx-8 lg:mx-10 lg:-mt-12 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={value}
                {...(prefersReduced ? {} : fadeUp(0.45 + i * 0.08))}
                className="flex gap-4 border-b border-white/10 p-5 last:border-b-0 sm:p-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <Icon className="mt-1 h-9 w-9 flex-shrink-0 text-blue-500 sm:h-11 sm:w-11" />
                <div>
                  <div className="text-lg font-black leading-tight text-white sm:text-xl">{value}</div>
                  <div className="mt-2 text-xs font-medium leading-relaxed text-slate-300 sm:text-sm">{label}</div>
                </div>
              </motion.div>
            ))}
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

      {/* ── ENGINEERED PROCESS IMAGE ─────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-6 lg:px-8 pb-20 sm:pb-28 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-white shadow-[0_22px_65px_rgba(45,76,120,0.16)]">
            <Image
              src="/engineered-process-banner.jpg"
              alt="USA Graphene engineered process from carbon feedstock to graphene production capacity"
              width={1536}
              height={1024}
              className="h-auto w-full"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
