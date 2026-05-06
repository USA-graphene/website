'use client'

import { useState, useEffect, useRef } from 'react'
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

/** Creates a CSS ripple from click position inside the element */
function useRipple() {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)

  function triggerRipple(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      pointer-events:none;
      width:${size}px; height:${size}px;
      left:${x}px; top:${y}px;
      background: rgba(255,255,255,0.45);
      transform: scale(0);
      animation: liquid-ripple 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
    `
    el.style.overflow = 'hidden'
    el.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  return { ref, triggerRipple }
}

/** Single nav link with full liquid-glass interaction */
function GlassNavLink({
  item,
  active,
}: {
  item: { name: string; href: string }
  active: boolean
}) {
  const { ref, triggerRipple } = useRipple()
  const isBlog = item.name === 'Blog'
  const [pressed, setPressed] = useState(false)

  return (
    <Link
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={item.href}
      onMouseDown={(e) => { setPressed(true); triggerRipple(e) }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={isBlog ? { padding: '8px 20px' } : undefined}
      className={[
        'relative px-4 py-2.5 text-sm font-bold tracking-wide rounded-full select-none',
        'transition-all duration-200',
        // Press physics
        pressed ? 'scale-[0.93] brightness-90' : 'scale-100',
        isBlog
          ? [
              'text-white bg-gradient-to-r from-[#ff6a00] to-[#ee0979]',
              'shadow-[0_4px_16px_rgba(255,106,0,0.45),inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.15)]',
              'hover:shadow-[0_6px_24px_rgba(255,106,0,0.55)]',
              'hover:scale-105 active:scale-95',
            ].join(' ')
          : active
          ? [
              'bg-white/90 text-blue-700',
              // Inflated glass pill look: strong inset top highlight + depth
              'shadow-[0_2px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_6px_rgba(0,0,0,0.06)]',
            ].join(' ')
          : [
              'text-slate-700 hover:text-slate-900',
              // Ghost glass pill on hover with inset highlight
              'hover:bg-white/55 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.04)]',
            ].join(' '),
      ].join(' ')}
    >
      {/* Specular top-edge shine on active */}
      {(active || isBlog) && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-[3px] h-[40%] rounded-full opacity-60"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 100%)',
          }}
        />
      )}
      <span className="flex items-center gap-1.5 relative z-10">
        {isBlog && <span className="text-xs">✦</span>}
        {item.name}
      </span>
    </Link>
  )
}

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
    <>
      {/* Inject ripple keyframe globally (once) */}
      <style>{`
        @keyframes liquid-ripple {
          to { transform: scale(1); opacity: 0; }
        }
        @keyframes blog-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(255,106,0,0.4), inset 0 2px 3px rgba(255,255,255,0.35); }
          50%       { box-shadow: 0 6px 28px rgba(255,106,0,0.65), inset 0 2px 3px rgba(255,255,255,0.35); }
        }
        .animate-blog-pulse { animation: blog-pulse 2.8s ease-in-out infinite; }
        .glass-pill-active:active {
          transform: scale(0.93) !important;
          filter: brightness(0.9);
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 transition-all duration-300 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-7xl rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/35 backdrop-blur-[60px] border border-white/70 shadow-[inset_0_4px_16px_rgba(255,255,255,1),inset_0_-4px_12px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.18)]'
              : 'bg-white/22 backdrop-blur-[40px] border border-white/55 shadow-[inset_0_4px_16px_rgba(255,255,255,0.9),inset_0_-4px_12px_rgba(0,0,0,0.05),0_12px_40px_rgba(0,0,0,0.14)]'
          }`}
        >
          {/* Specular top-edge shine on the whole nav bar */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-full opacity-80"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)' }}
          />

          <div className={`overflow-hidden transition-all duration-500 ${open ? 'rounded-3xl' : 'rounded-full'}`}>
            <nav className="px-5 sm:px-8">
              <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                  <div className="transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                    <Logo className="text-slate-900 drop-shadow-sm" />
                  </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex lg:items-center lg:gap-3">
                  <div className="flex items-center gap-1 bg-white/20 p-1.5 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)] border border-white/40">
                    {navigation.map((item) => {
                      const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      return <GlassNavLink key={item.name} item={item} active={active} />
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/contact/"
                    className={[
                      'inline-flex items-center gap-2 px-6 py-3 ml-2 rounded-full text-sm font-bold text-slate-800 group select-none',
                      'bg-white/40 border border-white/60',
                      'shadow-[0_4px_16px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.8)]',
                      'hover:bg-white/70 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1)]',
                      'active:scale-95 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] active:bg-white/80',
                      'transition-all duration-200',
                    ].join(' ')}
                  >
                    Contact Us
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-800 transition-all group-hover:translate-x-0.5 group-active:translate-x-1" />
                  </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                  className="lg:hidden p-3 rounded-full text-slate-700 hover:text-slate-900 bg-white/20 hover:bg-white/40 active:bg-white/60 active:scale-95 transition-all border border-white/40 shadow-sm"
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
                      className={[
                        'flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border select-none',
                        'active:scale-95 active:brightness-90',
                        isBlog
                          ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-[0_4px_16px_rgba(255,106,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.3)] border-transparent'
                          : active
                          ? 'bg-white/80 text-blue-700 border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)] shadow-sm'
                          : 'text-slate-700 bg-white/20 border-white/30 hover:bg-white/40',
                      ].join(' ')}
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
                    className="flex items-center justify-center gap-2 w-full px-5 py-4 rounded-2xl text-sm font-bold text-slate-800 bg-white/60 border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] active:bg-white/90 active:scale-95 transition-all"
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
    </>
  )
}
