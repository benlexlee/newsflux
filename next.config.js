/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['reuters.com', 'bbc.com', 'bloomberg.com', 'newsapi.org', 'placehold.co'],
  },
}

module.exports = nextConfig