import HeroConcept1 from '@/components/HeroConcept1'
import HeroConcept2 from '@/components/HeroConcept2'
import HeroConcept3 from '@/components/HeroConcept3'
import HeroConcept4 from '@/components/HeroConcept4'
import HeroConcept5 from '@/components/HeroConcept5'

export default function ConceptsPage() {
  const concepts = [
    { id: 1, name: 'THE FACTORY FLOOR', desc: 'Full-bleed factory panoramic. "We Build Graphene Factories." Bold. Immediate.', component: <HeroConcept1 /> },
    { id: 2, name: 'SPLIT-SCREEN ATOMIC', desc: 'Left: stark typography on black. Right: atomic graphene closeup. High contrast.', component: <HeroConcept2 /> },
    { id: 3, name: 'DARK CINEMATIC REACTOR', desc: 'Like a defense contractor site. The glowing reactor IS the message.', component: <HeroConcept3 /> },
    { id: 4, name: 'LUXURY EDITORIAL', desc: 'Rolex meets industrial science. Black powder pour macro. Premium and rare.', component: <HeroConcept4 /> },
    { id: 5, name: 'POWERS EVERYTHING', desc: 'EV batteries, aerospace, chips, solar — all connected by graphene. ROI-focused.', component: <HeroConcept5 /> },
  ]

  return (
    <div className="bg-black">
      {concepts.map(({ id, name, desc, component }) => (
        <div key={id} className="relative">
          {/* Concept label */}
          <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
            <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-xs font-black text-[#00c8ff] font-mono">CONCEPT {id}</span>
              <span className="text-xs font-bold text-white">{name}</span>
            </div>
          </div>
          {/* Concept description */}
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 max-w-xs">
              <p className="text-xs text-white/60">{desc}</p>
            </div>
          </div>
          {component}
          {/* Divider */}
          <div className="h-2 bg-gradient-to-r from-[#2d6ef0] via-[#00c8ff] to-[#2d6ef0]" />
        </div>
      ))}
    </div>
  )
}
