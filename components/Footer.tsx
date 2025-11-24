import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Footer() {
  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Products', href: '/products' },
      { name: 'Applications', href: '/applications' },
      { name: 'Equipment', href: '/equipment' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
    social: [
      {
        name: 'Facebook',
        href: 'https://www.facebook.com/groups/415750762731948',
        icon: Facebook,
      },
      {
        name: 'Twitter',
        href: 'https://x.com/USA_Graphene',
        icon: Twitter,
      },
      {
        name: 'Instagram',
        href: 'https://www.instagram.com/usa_graphene/',
        icon: Instagram,
      },
      {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@usa.graphene',
        icon: (props: any) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
          >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        ),
      },
      {
        name: 'LinkedIn',
        href: '#',
        icon: Linkedin,
      },
    ],
  }

  return (
    <footer className="bg-dark-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <Logo className="text-white" />
            </div>
            <p className="text-sm text-gray-400">
              Pioneering the future of materials science with high-quality graphene solutions.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Quick Links
              </h3>
              <ul role="list" className="mt-4 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Legal
              </h3>
              <ul role="list" className="mt-4 space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-base text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} USA Graphene. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

