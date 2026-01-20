/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Build standalone pour Docker
  output: 'standalone',

  // URL de base pour le proxy Apache
  basePath: '/formulaire',
  assetPrefix: '/formulaire',

  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Redirection optionnelle de la racine vers le questionnaire
  async redirects() {
    return [
      // Décommenter si vous voulez rediriger / vers /questionnaire
      // {
      //   source: '/',
      //   destination: '/questionnaire',
      //   permanent: false,
      // },
    ];
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
