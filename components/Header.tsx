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
        className={`pointer-events-auto w-full max-w-7xl rounded-2xl transition-all duration-500 overflow-hidden ${
          scrolled 
            ? 'bg-[#0d1630]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
            : 'bg-[#070d1a]/70 backdrop-blur-xl border border-white/5 shadow-2xl'
        }`}
      >
        <nav className="px-4 sm:px-6 lg:px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Logo className="text-white" />
              </div>
            </Link>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex lg:items-center lg:gap-6">
              {/* Desktop Nav */}
              <div className="flex items-center gap-1">
                {navigation.map((item) => {
                  const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  const isBlog = item.name === 'Blog'
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isBlog
                          ? 'text-white font-semibold bg-gradient-to-r from-[#ff6a00] to-[#ee0979] hover:from-[#ff8c00] hover:to-[#ff2d95] shadow-[0_2px_16px_rgba(255,106,0,0.4)] hover:shadow-[0_4px_24px_rgba(255,106,0,0.6)] hover:scale-105 animate-blog-pulse'
                          : active
                            ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                            : 'text-[#a4b5d0] hover:text-white hover:bg-white/5'
                      }`}
                      style={isBlog ? { borderRadius: '9999px', padding: '6px 18px' } : undefined}
                    >
                      <span className="flex items-center gap-1.5 relative z-10">
                        {isBlog && <span className="text-xs">✦</span>}
                        {item.name}
                      </span>
                      {!isBlog && active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] rounded-t-full shadow-[0_-2px_8px_rgba(45,110,240,0.8)]" />
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              {/* CTA */}
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl group"
              >
                Contact Us
                <ChevronRight className="h-4 w-4 text-[#8b9ab5] group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2.5 rounded-xl text-[#a4b5d0] hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div 
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden border-t border-white/5 ${
            open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
          }`}
        >
          <div className="px-4 py-4 space-y-1.5 bg-[#0a1020]/50">
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const isBlog = item.name === 'Blog'
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isBlog
                      ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold shadow-[0_2px_16px_rgba(255,106,0,0.35)] rounded-full'
                      : active
                        ? 'bg-gradient-to-r from-[#2d6ef0]/20 to-transparent text-white border-l-2 border-[#2d6ef0]'
                        : 'text-[#a4b5d0] hover:text-white hover:bg-white/5'
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
            <div className="pt-4 pb-2">
              <Link
                href="/contact/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 active:bg-white/10"
              >
                Contact Us
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
