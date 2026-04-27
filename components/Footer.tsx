import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight, Atom } from 'lucide-react'
import Logo from '@/components/Logo'

const links = [
  { name: 'About',          href: '/about/' },
  { name: 'Products',       href: '/products/' },
  { name: 'Applications',   href: '/applications/' },
  { name: 'Equipment',      href: '/equipment/' },
  { name: 'Market Research',href: '/market-research/' },
  { name: 'Blog',           href: '/blog/' },
  { name: 'Contact',        href: '/contact/' },
  { name: 'Privacy Policy', href: '/privacy/' },
]

const social = [
  { name: 'Facebook',  href: 'https://www.facebook.com/groups/415750762731948', icon: Facebook },
  { name: 'Twitter',   href: 'https://x.com/USA_Graphene',                       icon: Twitter },
  { name: 'Instagram', href: 'https://www.instagram.com/usa_graphene/',           icon: Instagram },
  { name: 'LinkedIn',  href: '#',                                                 icon: Linkedin },
]

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-[#070d1a] border-t border-white/8">

      {/* CTA banner */}
      <div className="border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[0.8rem] font-semibold tracking-widest uppercase text-[#5b9af5] mb-1">Ready to scale?</p>
            <h3 className="text-xl font-bold text-white font-display">Start your graphene journey today</h3>
          </div>
          <Link
            href="/contact/"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(45,110,240,0.35)]"
          >
            Request a Sample
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Brand */}
          <div className="space-y-5">
            <Logo className="text-white" />
            <p className="text-sm text-[#8b9ab5] leading-relaxed max-w-xs">
              Leading US manufacturer of industrial-grade graphene materials and production machinery. Pioneering the future of advanced carbon materials.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#8b9ab5] hover:text-white hover:border-[#2d6ef0]/40 hover:bg-[#2d6ef0]/10 transition-all"
                >
                  <span className="sr-only">{s.name}</span>
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@usa.graphene"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#8b9ab5] hover:text-white hover:border-[#2d6ef0]/40 hover:bg-[#2d6ef0]/10 transition-all"
              >
                <span className="sr-only">TikTok</span>
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#5b9af5] mb-4">Navigation</h4>
              <ul className="space-y-2.5">
                {links.slice(0, 4).map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-sm text-[#8b9ab5] hover:text-white transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#5b9af5] mb-4">More</h4>
              <ul className="space-y-2.5">
                {links.slice(4).map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-sm text-[#8b9ab5] hover:text-white transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#5b9af5] mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-[#8b9ab5]">
                <li>
                  <a href="mailto:info@usa-graphene.com" className="hover:text-white transition-colors">
                    info@usa-graphene.com
                  </a>
                </li>
                <li className="flex items-center gap-1.5 text-xs">
                  <Atom className="h-3.5 w-3.5 text-[#2d6ef0]" />
                  USA Graphene Inc.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8b9ab5]">
            &copy; {new Date().getFullYear()} USA Graphene Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#8b9ab5]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
