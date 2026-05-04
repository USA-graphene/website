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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070d1a]/95 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo className="text-white" />
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
              {navigation.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const isBlog = item.name === 'Blog'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isBlog
                        ? 'text-white font-semibold bg-gradient-to-r from-[#ff6a00] to-[#ee0979] hover:from-[#ff8c00] hover:to-[#ff2d95] shadow-[0_2px_16px_rgba(255,106,0,0.4)] hover:shadow-[0_4px_24px_rgba(255,106,0,0.6)] hover:scale-105 animate-[blogPulse_2.5s_ease-in-out_infinite]'
                        : active
                          ? 'text-white bg-white/8'
                          : 'text-[#8b9ab5] hover:text-white hover:bg-white/5'
                    }`}
                    style={isBlog ? { borderRadius: '9999px', padding: '6px 18px' } : undefined}
                  >
                    {isBlog && <span className="mr-1.5 text-xs">✦</span>}
                    {item.name}
                    {!isBlog && active && (
                      <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-gradient-to-r from-[#2d6ef0] to-[#00c8ff] rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* CTA */}
            <Link
              href="/contact/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#2d6ef0] to-[#1a55d0] hover:from-[#3a7af5] hover:to-[#2d6ef0] transition-all shadow-[0_2px_12px_rgba(45,110,240,0.35)] hover:shadow-[0_4px_20px_rgba(45,110,240,0.5)]"
            >
              Contact Us
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#8b9ab5] hover:text-white hover:bg-white/8 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0d1630]/98 backdrop-blur-xl border-t border-white/8">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const isBlog = item.name === 'Blog'
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isBlog
                      ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold shadow-[0_2px_16px_rgba(255,106,0,0.35)] rounded-full'
                      : active
                        ? 'bg-[#2d6ef0]/15 text-white border border-[#2d6ef0]/25'
                        : 'text-[#8b9ab5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isBlog && <span className="text-xs">✦</span>}
                    {item.name}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              )
            })}
            <div className="pt-2">
              <Link
                href="/contact/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2d6ef0] to-[#1a55d0]"
              >
                Contact Us
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
