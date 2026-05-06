'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'

const navigation = [
  { name: 'Home',            href: '/' },
  { name: 'About',           href: '/about/' },
  { name: 'Products',        href: '/products/' },
  { name: 'Applications',    href: '/applications/' },
  { name: 'Equipment',       href: '/equipment/' },
  { name: 'Market Research', href: '/market-research/' },
  { name: 'Blog',            href: '/blog/' },
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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-5 pointer-events-none">
      {/* The pill bar */}
      <div
        className={`pointer-events-auto w-full max-w-6xl transition-all duration-500 ${
          open ? 'rounded-3xl' : 'rounded-full'
        } ${
          scrolled
            ? 'bg-white/55 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]'
            : 'bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]'
        }`}
      >
        {/* Top-edge specular line */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-px rounded-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent)' }}
        />
        {/* Inner glow band */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full opacity-40"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)' }}
        />

        <div className={`overflow-hidden transition-all duration-500 ${open ? 'rounded-3xl' : 'rounded-full'}`}>
          <div className="flex items-center justify-between px-5 sm:px-6 h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <Logo className="text-[#2d6ef0]" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const isBlog = item.name === 'Blog'

                if (isBlog) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white
                        bg-gradient-to-r from-[#ff6a00] to-[#ee0979]
                        shadow-[0_3px_12px_rgba(238,9,121,0.4)]
                        hover:shadow-[0_4px_20px_rgba(238,9,121,0.55)]
                        hover:scale-105 active:scale-95 transition-all duration-200 ml-1"
                    >
                      <span className="text-xs font-black">+</span>
                      Blog
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 overflow-hidden ${
                      active
                        ? [
                            'bg-white text-slate-900 font-semibold',
                            'shadow-[0_3px_14px_rgba(0,0,0,0.12),inset_0_2px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04)]',
                          ].join(' ')
                        : [
                            'text-slate-600 hover:text-slate-900',
                            'hover:bg-white/70 hover:shadow-[0_2px_10px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]',
                          ].join(' ')
                    }`}
                  >
                    {/* Specular shine — top-half white gloss */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-1 top-[2px] h-[45%] rounded-full"
                      style={{
                        background: active
                          ? 'linear-gradient(to bottom, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 100%)'
                          : 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
                      }}
                    />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Contact Us CTA */}
            <Link
              href="/contact/"
              className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-[#2d6ef0] transition-colors duration-200 group"
            >
              Contact Us
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#2d6ef0] group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2.5 rounded-full text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 active:bg-white active:scale-95 transition-all border border-white/60 shadow-sm"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out border-t border-slate-100/60 bg-white/30 backdrop-blur-sm ${
              open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="px-4 pt-3 space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const isBlog = item.name === 'Blog'
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95 ${
                      isBlog
                        ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-bold shadow-[0_2px_12px_rgba(238,9,121,0.3)]'
                        : active
                        ? 'bg-white text-slate-900 font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isBlog && <span className="text-xs font-black">+</span>}
                      {item.name}
                    </span>
                    <ChevronRight className={`h-4 w-4 ${isBlog ? 'opacity-80' : 'opacity-30'}`} />
                  </Link>
                )
              })}
              <Link
                href="/contact/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-[#2d6ef0] hover:bg-white/60 active:scale-95 transition-all"
              >
                Contact Us
                <ChevronRight className="h-4 w-4 opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
