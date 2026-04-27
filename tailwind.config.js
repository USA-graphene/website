/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          blue:  '#2d6ef0',
          cyan:  '#00c8ff',
          light: '#7eb3ff',
        },
        // Surface layers
        surface: {
          DEFAULT: '#0d1630',
          2:       '#131f3a',
          3:       '#1a2850',
        },
        // Background
        bg: {
          DEFAULT: '#070d1a',
          soft:    '#0a1020',
        },
        // Legacy aliases kept so existing pages don't break
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2d6ef0',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        maritime: {
          50:  '#f0f9ff',
          600: '#2d6ef0',
          700: '#1d4ed8',
          900: '#0c1e4a',
        },
        dark: {
          50:  '#f8fafc',
          400: '#94a3b8',
          800: '#0d1630',
          900: '#070d1a',
        },
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #2d6ef0 0%, #00c8ff 100%)',
        'gradient-hero':    'linear-gradient(135deg, #070d1a 0%, #0d1a3a 50%, #0a1428 100%)',
        'gradient-card':    'linear-gradient(145deg, rgba(13,22,48,0.9) 0%, rgba(7,13,26,0.95) 100%)',
        'gradient-radial':  'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(45,110,240,0.2) 0%, transparent 70%)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out',
        'fade-in-up':  'fadeInUp 0.6s ease-out forwards',
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:  { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(45,110,240,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(45,110,240,0.6)' } },
      },
      boxShadow: {
        'blue-glow':  '0 0 30px rgba(45,110,240,0.4)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,110,240,0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}