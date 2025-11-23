# Modern Website

A beautiful, modern website built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Modern Design**: Clean, professional design with smooth animations
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Animations**: Beautiful animations powered by Framer Motion
- **Interactive Components**: Engaging user interface with hover effects and transitions
- **SEO Optimized**: Built with Next.js for optimal performance and SEO
- **TypeScript**: Full TypeScript support for better development experience

## 🛠️ Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Beautiful icons
- **PostCSS**: CSS processing

## 📁 Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── CTA.tsx
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Components

### Main Components

1. **Header**: Navigation with mobile menu support
2. **Hero**: Main landing section with animated gradient background
3. **Features**: Feature showcase with icons and descriptions
4. **CTA**: Call-to-action section
5. **Footer**: Footer with links and social media icons

### Key Features

- **Animated Background**: Gradient effects in the hero section
- **Scroll Animations**: Elements animate as they come into view
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper semantic HTML and ARIA labels

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0369a1)
- **Gray Scale**: Professional gray palette
- **Dark**: Dark mode colors for footer

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

## 🔧 Customization

### Adding New Sections
1. Create a new component in `components/`
2. Import and add to `app/page.tsx`
3. Style with Tailwind CSS classes

### Modifying Colors
Edit the color palette in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Adding Animations
Use Framer Motion for animations:
```javascript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
# or
yarn build
```

### Start Production Server
```bash
npm start
# or
yarn start
```

### Deploy to Vercel
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## 📄 License

This project is licensed under the MIT License.
