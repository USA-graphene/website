'use client'

import { useState } from 'react'
import {
  Zap, Shield, Disc, Layers, Building2, Battery, ArrowRight,
  Activity, Droplet, Cpu, Plane, FlaskConical, Thermometer,
  Radio, Eye, Wind, Sun, Lock, Microscope, CircuitBoard, Atom,
  Gauge, Waves, Globe
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  { value: '200×', label: 'Stronger than steel' },
  { value: '1,000,000+', label: 'S/m conductivity' },
  { value: '5,300', label: 'W/m·K thermal conductivity' },
  { value: '2,630', label: 'm²/g surface area' },
]

const categories = ['All', 'Energy', 'Electronics', 'Construction', 'Biomedical', 'Defense & Aerospace', 'Environment']

const applications = [
  // Energy
  { category: 'Energy', name: 'Lithium-Ion Batteries', tagline: 'Next-gen energy storage', description: 'Graphene anodes and cathode coatings dramatically increase charge/discharge rates, energy density, and cycle life — enabling EVs to charge in minutes instead of hours.', icon: Battery, stat: '10× faster charge', color: 'from-amber-500 to-orange-600' },
  { category: 'Energy', name: 'Supercapacitors', tagline: 'Instant power delivery', description: "Graphene's ultra-high surface area (2,630 m²/g) enables supercapacitors to store 10–100× more energy than conventional carbon electrodes while maintaining millisecond charge cycles.", icon: Zap, stat: '100× more energy', color: 'from-yellow-500 to-amber-600' },
  { category: 'Energy', name: 'Solar Cells', tagline: 'Transparent electrode revolution', description: 'Graphene replaces ITO as a transparent, flexible electrode in perovskite and organic solar cells, increasing efficiency while enabling roll-to-roll printing on flexible substrates.', icon: Sun, stat: '26%+ cell efficiency', color: 'from-orange-400 to-yellow-500' },
  { category: 'Energy', name: 'Hydrogen Fuel Cells', tagline: 'Clean energy catalyst support', description: 'Graphene-supported platinum catalysts reduce precious metal use by 60% while improving membrane durability and proton conductivity in hydrogen fuel cell MEAs.', icon: Atom, stat: '60% less platinum', color: 'from-sky-500 to-blue-600' },

  // Electronics
  { category: 'Electronics', name: 'Flexible Displays', tagline: 'Bend without breaking', description: 'CVD graphene serves as a transparent, conductive, and mechanically flexible electrode in OLED and e-ink displays — enabling rollable screens and wearable electronics.', icon: CircuitBoard, stat: '97% light transmittance', color: 'from-violet-500 to-purple-700' },
  { category: 'Electronics', name: 'High-Frequency Transistors', tagline: 'Beyond silicon speed limits', description: 'Graphene FETs operate at terahertz frequencies with electron mobility exceeding 200,000 cm²/V·s — 100× faster than silicon — enabling next-generation RF and 6G communications.', icon: Cpu, stat: '1 THz operation', color: 'from-indigo-500 to-violet-600' },
  { category: 'Electronics', name: 'Chemical & Gas Sensors', tagline: 'Single-molecule detection', description: 'Functionalized graphene detects individual gas molecules (NO₂, NH₃, H₂) at room temperature with femtomolar sensitivity — ideal for air quality, industrial safety, and breath analysis.', icon: FlaskConical, stat: 'Femtomolar sensitivity', color: 'from-teal-500 to-cyan-600' },
  { category: 'Electronics', name: 'Thermal Management', tagline: 'Conduct heat, not electricity', description: 'Graphene films dissipate heat in smartphones, EV batteries, and LED lighting at 5,300 W/m·K — 13× better than copper — solving the #1 bottleneck in miniaturization.', icon: Thermometer, stat: '5,300 W/m·K', color: 'from-red-500 to-pink-600' },
  { category: 'Electronics', name: 'Photodetectors', tagline: 'Ultra-broadband light sensing', description: 'Graphene absorbs light from UV to terahertz in a single 0.33 nm layer, enabling ultra-fast photodetectors for fiber optics, medical imaging, and scientific instruments.', icon: Eye, stat: 'UV to THz range', color: 'from-purple-500 to-indigo-600' },

  // Construction
  { category: 'Construction', name: 'Graphene-Enhanced Concrete', tagline: '✓ Customer Verified Results', description: 'Real-world testing achieved 24.3 MPa compressive strength at 28 days with less than 0.1% graphene dosage. Enhanced durability, reduced cracking, 30% lower carbon footprint vs standard mix.', icon: Building2, stat: '24.3 MPa at 28 days', color: 'from-blue-500 to-indigo-700', highlight: true },
  { category: 'Construction', name: 'Anti-Corrosion Coatings', tagline: 'Surfaces that last decades', description: 'Graphene barrier coatings for steel and concrete reduce corrosion rates by up to 95%, extending infrastructure lifespan and eliminating costly maintenance cycles.', icon: Shield, stat: '95% corrosion reduction', color: 'from-zinc-600 to-slate-700' },
  { category: 'Construction', name: 'Smart Structural Monitoring', tagline: 'Buildings that sense damage', description: 'Graphene piezoresistive sensors embedded in concrete detect micro-cracks, load changes, and structural fatigue in real time — enabling predictive maintenance at scale.', icon: Gauge, stat: 'Sub-micron crack detection', color: 'from-stone-500 to-slate-600' },

  // Biomedical
  { category: 'Biomedical', name: 'Drug Delivery Systems', tagline: 'Precision medicine carrier', description: 'Graphene oxide nanosheets functionalized with targeting ligands deliver chemotherapy drugs directly to tumor cells with 90% efficiency, dramatically reducing systemic side effects.', icon: Activity, stat: '90% targeting efficiency', color: 'from-rose-500 to-red-600' },
  { category: 'Biomedical', name: 'Biosensors & Diagnostics', tagline: 'Lab-on-a-chip precision', description: 'Graphene electrochemical biosensors detect cancer biomarkers, viruses, and glucose at picomolar concentrations — enabling point-of-care diagnostics without expensive lab equipment.', icon: Microscope, stat: '1 pM detection limit', color: 'from-pink-500 to-rose-600' },
  { category: 'Biomedical', name: 'Neural Interfaces', tagline: 'Brain-computer connectivity', description: 'Flexible graphene electrode arrays interface with neurons with 10× lower impedance than metal electrodes, enabling high-resolution brain mapping and next-generation neural prosthetics.', icon: Radio, stat: '10× lower impedance', color: 'from-fuchsia-500 to-purple-700' },
  { category: 'Biomedical', name: 'Tissue Engineering Scaffolds', tagline: 'Regenerative medicine substrate', description: 'Graphene scaffolds mimic bone mechanical stiffness and promote stem cell differentiation into osteoblasts and neurons, accelerating bone and nerve regeneration.', icon: Disc, stat: '130 GPa stiffness match', color: 'from-violet-400 to-fuchsia-600' },
  { category: 'Biomedical', name: 'Antibacterial Surfaces', tagline: 'Infection-proof medical devices', description: 'Graphene oxide coatings exhibit broad-spectrum antibacterial activity against E. coli and S. aureus by disrupting bacterial membranes — without antibiotics.', icon: Lock, stat: '99.9% bacteria reduction', color: 'from-emerald-500 to-teal-600' },

  // Defense & Aerospace
  { category: 'Defense & Aerospace', name: 'Lightweight Armor', tagline: 'Stop projectiles with atoms', description: 'A single graphene layer can absorb 10× the energy of steel at 1/6th the weight — enabling body armor and vehicle shielding that soldiers can actually carry in the field.', icon: Shield, stat: '10× steel energy absorption', color: 'from-gray-700 to-slate-900' },
  { category: 'Defense & Aerospace', name: 'EMI Shielding', tagline: 'Invisible Faraday cage', description: 'Graphene composite panels provide 40–80 dB electromagnetic interference shielding at 0.5 mm thickness — protecting avionics, satellites, and military electronics from EMP.', icon: Globe, stat: '80 dB at 0.5 mm', color: 'from-slate-700 to-zinc-900' },
  { category: 'Defense & Aerospace', name: 'Aerospace Composites', tagline: 'Lighter aircraft, farther range', description: 'Adding 0.5 wt% graphene to carbon fiber prepregs increases tensile strength by 40% and interlaminar shear strength by 60%, cutting structural weight and boosting fuel efficiency.', icon: Plane, stat: '40% stronger CFRP', color: 'from-blue-700 to-indigo-900' },
  { category: 'Defense & Aerospace', name: 'Stealth Coatings', tagline: 'Radar absorption technology', description: 'Graphene-based metamaterial coatings absorb microwave and millimeter-wave radar signals across a wide frequency range at sub-millimeter thickness — enabling thinner stealth structures.', icon: Waves, stat: '−30 dB radar cross-section', color: 'from-zinc-800 to-gray-900' },

  // Environment
  { category: 'Environment', name: 'Water Desalination', tagline: 'Angstrom-precise filtration', description: 'Graphene oxide membranes block salt ions while allowing water molecules through at 10–100× the flow rate of polymer RO membranes, dramatically reducing desalination energy costs.', icon: Droplet, stat: '100× higher flux than RO', color: 'from-cyan-500 to-blue-600' },
  { category: 'Environment', name: 'Heavy Metal Removal', tagline: 'Purifying contaminated water', description: 'Functionalized graphene oxide adsorbs lead, mercury, arsenic, and chromium from industrial wastewater at >99% efficiency with a capacity of 1,000 mg/g — far exceeding activated carbon.', icon: FlaskConical, stat: '99% heavy metal removal', color: 'from-teal-500 to-emerald-600' },
  { category: 'Environment', name: 'CO₂ Capture', tagline: 'Molecular sieving at scale', description: 'Graphene-derived porous frameworks selectively capture CO₂ over N₂ with 100:1 selectivity at ambient conditions, enabling post-combustion carbon capture at a fraction of current costs.', icon: Wind, stat: '100:1 CO₂/N₂ selectivity', color: 'from-green-500 to-teal-600' },
  { category: 'Environment', name: 'Photocatalytic Degradation', tagline: 'Sunlight-powered cleanup', description: 'Graphene-TiO₂ composites degrade pharmaceutical pollutants and dyes under visible light 5× faster than bare TiO₂, enabling solar-powered water remediation systems.', icon: Sun, stat: '5× faster degradation', color: 'from-lime-500 to-green-600' },
]

export default function ApplicationsClient() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? applications
    : applications.filter((a) => a.category === activeCategory)

  return (
    <div className="bg-[#0a0f1e] min-h-screen text-white">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0a0f1e] to-purple-900/30" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 52,16 52,44 30,58 8,44 8,16' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }} />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-28 sm:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-6">
              <Atom className="h-4 w-4" />
              25 Proven Application Areas
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Graphene Applications
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
              A single atomic layer of carbon is transforming every major industry.
              Explore how graphene&apos;s extraordinary properties solve real engineering challenges today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{s.value}</div>
                <div className="mt-1 text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0f1e]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'border border-white/20 text-gray-400 hover:border-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.name}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/30 ${
                  app.highlight
                    ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/80 to-slate-900/80'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${app.color}`} />
                {app.highlight && (
                  <div className="absolute top-4 right-4 rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                    ✓ Customer Verified
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 rounded-xl p-2.5 bg-gradient-to-br ${app.color} opacity-90`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{app.category}</div>
                      <h3 className="text-base font-semibold text-white leading-tight">{app.name}</h3>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-blue-400 mb-3">{app.tagline}</div>
                  <p className="text-sm text-gray-400 leading-relaxed">{app.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                    <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${app.color}`} />
                    {app.stat}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Video Evidence */}
      <div className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-widest">Real-World Evidence</div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Graphene-Enhanced Concrete in Action</h2>
            <p className="mt-4 text-gray-400">Watch actual customer testing demonstrating graphene-enhanced concrete performance.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {[
              { src: '/VIDEO-2025-12-03-09-41-52.mp4', title: 'Concrete Sample Testing', desc: 'Customer demonstration achieving 24.3 MPa compressive strength.' },
              { src: '/VIDEO-2025-12-03-09-41-56.mp4', title: 'Material Preparation Process', desc: 'Step-by-step integration of graphene into concrete mixtures.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video controls className="w-full aspect-video bg-black" preload="metadata">
                  <source src={v.src} type="video/mp4" />
                </video>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-400">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { val: '24.3 MPa', label: 'Compressive Strength', sub: 'Achieved at 28 days' },
              { val: '< 0.1%', label: 'Graphene Dosage', sub: 'Ultra-low concentration' },
              { val: '54%', label: 'Design Strength', sub: 'Of 44.8 MPa target' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{s.val}</div>
                <div className="text-sm font-medium text-white mb-0.5">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to test graphene in your application?</h2>
          <p className="mt-4 text-lg text-blue-200">Request a sample and speak with our materials engineers.</p>
          <div className="mt-10">
            <Link
              href="/contact/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
            >
              Request a Sample &amp; Call
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
