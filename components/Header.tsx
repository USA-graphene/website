'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

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
  const [isLightPage, setIsLightPage] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Detect if the current page is the Home page
  useEffect(() => {
    setIsLightPage(pathname === '/')
  }, [pathname])

  // Only close the menu when the pathname actually changes (navigation occurs)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const textColor = isLightPage ? 'text-neutral-800' : 'text-white/90'
  const hoverColor = isLightPage ? 'hover:bg-black/5' : 'hover:bg-white/10'
  const activeBg = isLightPage ? 'bg-black/80 text-white' : 'bg-white/90 text-black'
  const glassBg = isLightPage ? 'bg-black/5' : 'bg-white/10'

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 pointer-events-none">
      {/* Desktop Navigation */}
      <nav className={`hidden lg:flex max-w-fit mx-auto items-center gap-0.5 p-1 rounded-full pointer-events-auto
                    relative overflow-hidden group transition-colors duration-500
                    ${glassBg} backdrop-blur-[32px] saturate-[180%] contrast-[110%]
                    shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)]
                    border border-white/20
                    transition-all duration-500 ease-out`}>
        
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none
                        bg-gradient-to-tr from-transparent ${isLightPage ? 'via-black/10' : 'via-white/30'} to-transparent
                        -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out`} />

        <div className={`absolute inset-x-5 top-0 h-[0.5px] ${isLightPage ? 'bg-black/20' : 'bg-white/60'} blur-[0.1px]`} />

        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2.5 rounded-full text-[12px] font-bold tracking-tight
                        transition-all duration-300 select-none
                        active:scale-[0.85] active:duration-75
                        hover:scale-[1.03]
                        flex items-center justify-center overflow-hidden
                        ${active ? activeBg : `${textColor} ${hoverColor}`}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              {!active && (
                <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
                              bg-gradient-to-b ${isLightPage ? 'from-black/5' : 'from-white/20'} via-transparent to-transparent`} />
              )}
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation Trigger */}
      <div className="lg:hidden flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 rounded-full ${glassBg} backdrop-blur-[32px] border border-white/20 shadow-xl
                    active:scale-90 transition-all duration-300 group relative overflow-hidden`}
        >
          {isOpen ? <X size={24} className={textColor} /> : <Menu size={24} className={textColor} />}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Mobile Liquid Glass Overlay */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                      ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className={`absolute inset-0 ${isLightPage ? 'bg-white/60' : 'bg-black/70'} backdrop-blur-[80px] saturate-[200%]`} />
        
        <nav className="flex flex-col items-center justify-center h-full gap-4 px-6">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full max-w-xs text-center py-4 rounded-2xl text-lg font-bold tracking-tight
                        transition-all duration-500
                        active:scale-90 active:brightness-90
                        ${pathname === item.href ? activeBg : `${textColor} bg-white/5`}`}
              style={{ 
                transitionDelay: `${i * 40}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
