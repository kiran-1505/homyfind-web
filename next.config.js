/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'maps.googleapis.com',
      'images.unsplash.com',
      'picsum.photos',
    ],
  },
}

module.exports = nextConfig
