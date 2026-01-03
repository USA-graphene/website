/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      // Blog post transitions from root to /blog/
      { source: '/765', destination: '/blog/765', permanent: true },
      { source: '/beyond-silicon-the-graphene-revolution', destination: '/blog/beyond-silicon-the-graphene-revolution', permanent: true },
      { source: '/beyond-the-buzz-120-graphene-applications-reshaping-our-future-deep-dive', destination: '/blog/beyond-the-buzz-120-graphene-applications-reshaping-our-future-deep-dive', permanent: true },
      { source: '/concrete-gets-a-superpower-why-graphene-is-the-future-of-construction', destination: '/blog/concrete-gets-a-superpower-why-graphene-is-the-future-of-construction', permanent: true },
      { source: '/graphene-applications', destination: '/blog/graphene-applications', permanent: true },
      { source: '/graphene-batteries-in-2025-your-phone-ev-could-charge-in-minutes', destination: '/blog/graphene-batteries-in-2025-your-phone-ev-could-charge-in-minutes', permanent: true },
      { source: '/graphene-batteries-the-future-is-now-kind-of-in-2025', destination: '/blog/graphene-batteries-the-future-is-now-kind-of-in-2025', permanent: true },
      { source: '/graphene-cutting-edge-production-equipment-unlocking-the-future-made-in-the-usa', destination: '/blog/graphene-cutting-edge-production-equipment-unlocking-the-future-made-in-the-usa', permanent: true },
      { source: '/graphene-from-pencil-lead-to-powering-the-future-is-this-the-ultimate-wonder-material', destination: '/blog/graphene-from-pencil-lead-to-powering-the-future-is-this-the-ultimate-wonder-material', permanent: true },
      { source: '/graphene-in-2025-from-sci-fi-dream-to-everyday-reality-almost', destination: '/blog/graphene-in-2025-from-sci-fi-dream-to-everyday-reality-almost', permanent: true },
      { source: '/graphene-in-rubber-enhancing-tires-and-more-with-a-supermaterial', destination: '/blog/graphene-in-rubber-enhancing-tires-and-more-with-a-supermaterial', permanent: true },
      { source: '/graphene-nanoplatelet-prices-in-2025-a-market-snapshot-usa-vs-india', destination: '/blog/graphene-nanoplatelet-prices-in-2025-a-market-snapshot-usa-vs-india', permanent: true },
      { source: '/graphene-nanoplatelets-the-tiny-tech-with-a-big-price-story-2025-edition', destination: '/blog/graphene-nanoplatelets-the-tiny-tech-with-a-big-price-story-2025-edition', permanent: true },
      { source: '/graphene-supercapacitors-unlocking-the-future-of-lightning-fast-energy-storage-introduction-the-urgent-quest-for-better-power', destination: '/blog/graphene-supercapacitors-unlocking-the-future-of-lightning-fast-energy-storage-introduction-the-urgent-quest-for-better-power', permanent: true },
      { source: '/graphene-the-atom-thin-marvel-powering-tomorrows-innovations', destination: '/blog/graphene-the-atom-thin-marvel-powering-tomorrows-innovations', permanent: true },
      { source: '/graphene-the-atom-thin-marvel-rewriting-medicines-future-and-healing-spines', destination: '/blog/graphene-the-atom-thin-marvel-rewriting-medicines-future-and-healing-spines', permanent: true },
      { source: '/graphene-the-atomic-wonder-supercharging-next-gen-batteries', destination: '/blog/graphene-the-atomic-wonder-supercharging-next-gen-batteries', permanent: true },
      { source: '/graphene-the-atomically-thin-material-thats-changing-everything-and-how-usa-made-equipment-is-powering-the-revolution', destination: '/blog/graphene-the-atomically-thin-material-thats-changing-everything-and-how-usa-made-equipment-is-powering-the-revolution', permanent: true },
      { source: '/graphene-the-wonder-material-that-took-a-detour-and-how-its-getting-back-on-track', destination: '/blog/graphene-the-wonder-material-that-took-a-detour-and-how-its-getting-back-on-track', permanent: true },
      { source: '/graphene-the-wonder-material-thats-shaping-our-world-and-whats-next', destination: '/blog/graphene-the-wonder-material-thats-shaping-our-world-and-whats-next', permanent: true },
      { source: '/graphenes-industrial-takeover', destination: '/blog/graphenes-industrial-takeover', permanent: true },
      { source: '/graphenes-kiwi-revolution-how-new-zealand-is-forging-a-nano-future', destination: '/blog/graphenes-kiwi-revolution-how-new-zealand-is-forging-a-nano-future', permanent: true },
      { source: '/graphenes-price-in-2025-a-tale-of-innovation-geopolitics-and-the-wonder-material-that-isnt-so-cheap-yet', destination: '/blog/graphenes-price-in-2025-a-tale-of-innovation-geopolitics-and-the-wonder-material-that-isnt-so-cheap-yet', permanent: true },
      { source: '/indias-graphene-frontier-pioneering-the-next-generation-material-revolution', destination: '/blog/indias-graphene-frontier-pioneering-the-next-generation-material-revolution', permanent: true },
      { source: '/introduction-the-plastic-predicament-why-our-current-materials-arent-enough', destination: '/blog/introduction-the-plastic-predicament-why-our-current-materials-arent-enough', permanent: true },
      { source: '/meet-graphene-the-superhero-of-materials', destination: '/blog/meet-graphene-the-superhero-of-materials', permanent: true },
      { source: '/powering-up-tomorrow-the-graphene-battery-revolution-weve-been-waiting-for-or-have-we', destination: '/blog/powering-up-tomorrow-the-graphene-battery-revolution-weve-been-waiting-for-or-have-we', permanent: true },
      { source: '/supercapacitors-vs-batteries-the-ultimate-energy-showdown-or-smart-partnership', destination: '/blog/supercapacitors-vs-batteries-the-ultimate-energy-showdown-or-smart-partnership', permanent: true },
      { source: '/the-carbon-chameleon-how-graphene-is-supercharging-our-energy-future', destination: '/blog/the-carbon-chameleon-how-graphene-is-supercharging-our-energy-future', permanent: true },
      { source: '/the-carbon-revolution-why-graphene-is-still-the-wonder-material-we-need-to-talk-about', destination: '/blog/the-carbon-revolution-why-graphene-is-still-the-wonder-material-we-need-to-talk-about', permanent: true },
      { source: '/the-graphene-battery-dream-are-we-finally-charging-towards-a-power-packed-future-in-2025', destination: '/blog/the-graphene-battery-dream-are-we-finally-charging-towards-a-power-packed-future-in-2025', permanent: true },
      { source: '/the-graphene-sodium-battery-an-advanced-engineering-grand-challenge', destination: '/blog/the-graphene-sodium-battery-an-advanced-engineering-grand-challenge', permanent: true },
      { source: '/the-revolution-of-controlled-disorder-turbostratic-graphene', destination: '/blog/the-revolution-of-controlled-disorder-turbostratic-graphene', permanent: true },
      { source: '/the-secret-ingredient-behind-your-bendy-screens-unpacking-flexible-oled-electrodes', destination: '/blog/the-secret-ingredient-behind-your-bendy-screens-unpacking-flexible-oled-electrodes', permanent: true },
      { source: '/the-tiny-marvel-revolutionizing-drug-delivery-and-why-its-a-big-deal-i-hook-the-frustration-of-one-size-fits-all-medicine', destination: '/blog/the-tiny-marvel-revolutionizing-drug-delivery-and-why-its-a-big-deal-i-hook-the-frustration-of-one-size-fits-all-medicine', permanent: true },
      { source: '/the-unseen-revolution-why-graphene-products-are-about-to-change-everything', destination: '/blog/the-unseen-revolution-why-graphene-products-are-about-to-change-everything', permanent: true },
      { source: '/the-unsung-heroes-of-your-screen-how-a-material-revolution-is-folding-the-future', destination: '/blog/the-unsung-heroes-of-your-screen-how-a-material-revolution-is-folding-the-future', permanent: true },
      { source: '/unlocking-sodium-revolution-graphene-batteries', destination: '/blog/unlocking-sodium-revolution-graphene-batteries', permanent: true },
      { source: '/unlocking-tomorrow-why-graphene-is-the-material-of-the-future-and-why-everyones-talking-about-it', destination: '/blog/unlocking-tomorrow-why-graphene-is-the-material-of-the-future-and-why-everyones-talking-about-it', permanent: true },
      { source: '/usa-graphene-unleashing-the-power-of-tomorrows-wonder-material-today', destination: '/blog/usa-graphene-unleashing-the-power-of-tomorrows-wonder-material-today', permanent: true },

      // Common WordPress Patterns
      { source: '/category/:path*', destination: '/blog', permanent: true },
      { source: '/tag/:path*', destination: '/blog', permanent: true },
      { source: '/author/:path*', destination: '/blog', permanent: true },
      { source: '/feed/:path*', destination: '/sitemap.xml', permanent: true },
      { source: '/comments/feed/:path*', destination: '/blog', permanent: true },

      // WordPress Date-based Permalinks (e.g., /2025/08/07/post-slug)
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true
      },
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug/',
        destination: '/blog/:slug',
        permanent: true
      },

      // Additional WordPress paths found in GSC
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/contact-us/', destination: '/contact', permanent: true },
      { source: '/learning', destination: '/blog', permanent: true },
      { source: '/learning/', destination: '/blog', permanent: true },
      { source: '/graphene-blog', destination: '/blog', permanent: true },
      { source: '/graphene-blog/', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})/', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})/', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})/page/:path*', destination: '/blog', permanent: true },
      { source: '/page/:path*', destination: '/', permanent: true },

      // WordPress Sitemap Patterns
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/post-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/page-sitemap.xml', destination: '/sitemap.xml', permanent: true },

      // index.php pattern
      { source: '/index.php/:path*', destination: '/:path*', permanent: true },
    ]
  },
}

module.exports = nextConfig