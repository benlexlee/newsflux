/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['reuters.com', 'bbc.com', 'bloomberg.com'],
  },
}

module.exports = nextConfig