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
      {
        source: '/unlocking-sodium-revolution-graphene-batteries',
        destination: '/blog/unlocking-sodium-revolution-graphene-batteries',
        permanent: true,
      },
      {
        source: '/the-graphene-sodium-battery-an-advanced-engineering-grand-challenge',
        destination: '/blog/the-graphene-sodium-battery-an-advanced-engineering-grand-challenge',
        permanent: true,
      },
      // Generic redirect for any other slugs that were previously at root
      // This is a bit risky but we can target specific patterns if we know them.
      // For now, let's add the most likely migrated slugs.
      {
        source: '/graphene-applications',
        destination: '/blog/graphene-applications',
        permanent: true,
      },
      {
        source: '/graphenes-industrial-takeover',
        destination: '/blog/graphenes-industrial-takeover',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig