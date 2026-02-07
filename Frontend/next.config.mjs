/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  async rewrites() {
  return [
    {
      source: '/api/messages',
      destination: 'http://localhost/wert/Backend/api/messages/contact.php',
    },
  ]
},
}

export default nextConfig