'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { samplePurchaseLinks } from '@/lib/sampleLinks'
import Logo from '@/components/Logo'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Applications', href: '/applications' },
  { label: 'Equipment', href: '/equipment' },
  { label: 'Market research', href: '/market-research' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact us', href: '/contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isLightPage = pathname === '/'

  const textColor   = isLightPage ? 'text-neutral-800'   : 'text-white/90'
  const hoverColor  = isLightPage ? 'hover:bg-black/8'   : 'hover:bg-white/10'
  const activeBg    = isLightPage ? 'bg-black/80 text-white' : 'bg-white/90 text-black'
  const glassBg     = isLightPage ? 'bg-black/5'         : 'bg-white/10'

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <>
      {/* ── Mobile Liquid Glass Overlay ──────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`
            fixed inset-0 z-[200] lg:hidden
            flex flex-col
            ${isLightPage ? 'bg-white/70' : 'bg-slate-900/85'}
          `}
          style={{
            /* Reduced blur on mobile for perf; let the tint carry the glass feel */
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            /* Promote to own compositing layer immediately */
            willChange: 'opacity',
            /* Safe-area for notched iPhones */
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Close button — top-right */}
          <div className="flex justify-end px-5 pt-5">
            <button
              onClick={close}
              aria-label="Close menu"
              className={`
                p-3 rounded-full
                ${glassBg} border border-white/20 shadow-lg
                active:scale-90 transition-transform duration-150
              `}
            >
              <X size={22} className={textColor} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col items-center justify-center flex-1 gap-2 px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`
                  w-full max-w-xs text-center py-3.5 rounded-2xl
                  text-lg font-bold tracking-tight
                  transition-colors duration-200
                  active:scale-[0.94]
                  ${pathname === item.href
                    ? activeBg + ' shadow-md'
                    : textColor + ' hover:bg-white/10'}
                `}
              >
                {item.label}
              </Link>
            ))}
            <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-3">
              <a
                href={samplePurchaseLinks.ebay}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="text-center py-3 rounded-2xl text-sm font-bold text-white bg-[#2d6ef0] active:scale-[0.94] transition-transform"
              >
                eBay sample
              </a>
              <a
                href={samplePurchaseLinks.etsy}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="text-center py-3 rounded-2xl text-sm font-bold text-white bg-white/10 border border-white/20 active:scale-[0.94] transition-transform"
              >
                Etsy sample
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* ── Fixed Header Shell ───────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[150] pointer-events-none"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        <div className="px-4">
          <div className="hidden lg:flex mx-auto max-w-[calc(100vw-2rem)] w-full items-center justify-between gap-8 pointer-events-auto">
            <Link
              href="/"
              aria-label="USA Graphene home"
              className={`
                flex items-center px-2 py-2
                drop-shadow-[0_2px_10px_rgba(45,110,240,0.12)]
              `}
            >
              <Logo className={isLightPage ? 'text-[#2d6ef0]' : 'text-white'} />
            </Link>

            {/* Desktop pill nav */}
            <nav
            className={`
              flex items-center gap-0.5 p-1
              rounded-full pointer-events-auto relative overflow-hidden group
              ${glassBg}
              border border-white/20
              shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)]
              transition-shadow duration-500 ease-out
            `}
            style={{
              backdropFilter: 'blur(32px) saturate(180%) contrast(110%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%) contrast(110%)',
            }}
          >
            {/* Shimmer sweep — CSS-only, no JS */}
            <div
              className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none
                bg-gradient-to-tr from-transparent
                ${isLightPage ? 'via-black/10' : 'via-white/30'}
                to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-[1400ms] ease-in-out
              `}
            />

            {/* Top specular edge */}
            <div
              className={`absolute inset-x-5 top-0 h-[0.5px] ${isLightPage ? 'bg-black/20' : 'bg-white/60'} blur-[0.1px]`}
            />

            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2.5 rounded-full text-[12px] font-bold
                    tracking-tight transition-all duration-300 select-none
                    active:scale-[0.85] active:duration-75 hover:scale-[1.03]
                    flex items-center justify-center overflow-hidden
                    ${active ? activeBg : `${textColor} ${hoverColor}`}
                  `}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  {!active && (
                    <div
                      className={`
                        absolute inset-0 opacity-0 hover:opacity-100
                        transition-opacity duration-300
                        bg-gradient-to-b ${isLightPage ? 'from-black/5' : 'from-white/20'}
                        via-transparent to-transparent
                      `}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
            <a
              href={samplePurchaseLinks.ebay}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-4 py-2.5 rounded-full text-[12px] font-bold tracking-tight transition-all duration-300 select-none active:scale-[0.85] active:duration-75 hover:scale-[1.03] flex items-center justify-center overflow-hidden text-white bg-[#2d6ef0] hover:bg-[#205acc] shadow-[0_4px_20px_rgba(45,110,240,0.25)]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <span className="relative z-10 whitespace-nowrap">Buy Sample</span>
            </a>
            </nav>
          </div>

          {/* Mobile logo + hamburger */}
          <div className="lg:hidden flex items-center justify-between pointer-events-auto">
            <Link
              href="/"
              aria-label="USA Graphene home"
              className={`
                flex items-center px-1 py-2
                drop-shadow-[0_2px_10px_rgba(45,110,240,0.12)]
              `}
            >
              <Logo className={isLightPage ? 'text-[#2d6ef0]' : 'text-white'} />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              className={`
                p-3 rounded-full
                ${glassBg} border border-white/20 shadow-lg
                active:scale-90 transition-transform duration-150 relative overflow-hidden
              `}
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              <Menu size={22} className={textColor} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
