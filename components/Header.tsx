'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

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

  // Detect if the current page is the Home page (which uses the Light theme)
  useEffect(() => {
    setIsLightPage(pathname === '/')
  }, [pathname])

  const textColor = isLightPage ? 'text-neutral-800' : 'text-white/90'
  const hoverColor = isLightPage ? 'hover:bg-black/5' : 'hover:bg-white/10'
  const activeBg = isLightPage ? 'bg-black/80 text-white' : 'bg-white/90 text-black'

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none">
      <nav className={`max-w-fit mx-auto flex items-center gap-0.5 p-1 rounded-full pointer-events-auto
                    relative overflow-hidden group transition-colors duration-500
                    ${isLightPage ? 'bg-black/5' : 'bg-white/10'} 
                    backdrop-blur-[32px] saturate-[180%] contrast-[110%]
                    shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)]
                    border border-white/20
                    transition-all duration-500 ease-out`}>
        
        {/* The "Liquid" Shimmer Layer */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none
                        bg-gradient-to-tr from-transparent ${isLightPage ? 'via-black/10' : 'via-white/30'} to-transparent
                        -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out`} />

        {/* Top Edge Specular Shine */}
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
              {/* Inner Gloss Band */}
              {!active && (
                <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
                              bg-gradient-to-b ${isLightPage ? 'from-black/5' : 'from-white/20'} via-transparent to-transparent`} />
              )}
              
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
