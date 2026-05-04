'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'

const navigation = [
  { name: 'Home',          href: '/' },
  { name: 'About',         href: '/about/' },
  { name: 'Products',      href: '/products/' },
  { name: 'Applications',  href: '/applications/' },
  { name: 'Equipment',     href: '/equipment/' },
  { name: 'Market Research', href: '/market-research/' },
  { name: 'Blog',          href: '/blog/' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 transition-all duration-300 pointer-events-none">
      <div 
        className={`pointer-events-auto w-full max-w-7xl rounded-full transition-all duration-500 ${
          scrolled 
            ? 'bg-white/30 backdrop-blur-[60px] border border-white/60 shadow-[inset_0_4px_16px_rgba(255,255,255,1),inset_0_-4px_12px_rgba(0,0,0,0.05),0_16px_48px_rgba(0,0,0,0.2)]' 
            : 'bg-white/20 backdrop-blur-[40px] border border-white/50 shadow-[inset_0_4px_16px_rgba(255,255,255,0.9),inset_0_-4px_12px_rgba(0,0,0,0.05),0_12px_40px_rgba(0,0,0,0.15)]'
        }`}
      >
        {/* We need an inner wrapper that hides overflow for the mobile menu drop-down, but preserves the rounded-full shape of the header */}
        <div className={`overflow-hidden transition-all duration-500 ${open ? 'rounded-3xl' : 'rounded-full'}`}>
          <nav className="px-5 sm:px-8">
            <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {/* Since the glass is light/white tinted, a dark logo is needed for contrast */}
                  <Logo className="text-slate-900 drop-shadow-sm" />
                </div>
              </Link>

              {/* Desktop Right Side */}
              <div className="hidden lg:flex lg:items-center lg:gap-3">
                {/* Desktop Nav */}
                <div className="flex items-center gap-1.5 bg-white/20 p-1.5 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)] border border-white/40">
                  {navigation.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    const isBlog = item.name === 'Blog'
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative px-4 py-2.5 text-sm font-bold tracking-wide rounded-full transition-all duration-300 ${
                          isBlog
                            ? 'text-white font-semibold bg-gradient-to-r from-[#ff6a00] to-[#ee0979] shadow-[0_4px_16px_rgba(255,106,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.3)] hover:scale-105 animate-blog-pulse'
                            : active
                              ? 'bg-white/90 text-blue-700 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                        }`}
                        style={isBlog ? { padding: '8px 20px' } : undefined}
                      >
                        <span className="flex items-center gap-1.5 relative z-10">
                          {isBlog && <span className="text-xs">✦</span>}
                          {item.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>

                {/* CTA */}
                <Link
                  href="/contact/"
                  className="inline-flex items-center gap-2 px-6 py-3 ml-2 rounded-full text-sm font-bold text-slate-800 bg-white/40 border border-white/60 hover:bg-white/70 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1)] group"
                >
                  Contact Us
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-800 transition-colors group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-3 rounded-full text-slate-700 hover:text-slate-900 bg-white/20 hover:bg-white/40 transition-colors border border-white/40 shadow-sm"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          <div 
            className={`lg:hidden transition-all duration-300 ease-in-out border-t border-white/30 bg-white/20 backdrop-blur-md ${
              open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
            }`}
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const isBlog = item.name === 'Blog'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                      isBlog
                        ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-[0_4px_16px_rgba(255,106,0,0.4)] border-transparent'
                        : active
                          ? 'bg-white/80 text-blue-700 border-white/60 shadow-sm'
                          : 'text-slate-700 bg-white/20 border-white/30 hover:bg-white/40'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isBlog && <span className="text-xs">✦</span>}
                      {item.name}
                    </span>
                    <ChevronRight className={`h-4 w-4 ${isBlog ? 'opacity-80' : 'opacity-40'}`} />
                  </Link>
                )
              })}
              <div className="pt-3 pb-2">
                <Link
                  href="/contact/"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-4 rounded-2xl text-sm font-bold text-slate-800 bg-white/60 border border-white/80 active:bg-white/80 shadow-sm"
                >
                  Contact Us
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
