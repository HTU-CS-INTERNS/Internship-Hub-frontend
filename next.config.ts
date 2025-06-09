
import type { NextConfig } from 'next';
// Correctly import the default export from @ducanh2912/next-pwa
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  workboxOptions: {
    disableDevLogs: true, // Disable Workbox logs in development
    importScripts: ['/custom-sw.js'], // Import custom service worker
  },
  fallbacks: {
    // You can add fallbacks for specific routes or assets here if needed
    // document: '/offline', // example: fallbacks to /_offline if the page is not cached
    // image: '/static/images/fallback.png',
    // font: '/static/fonts/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  cacheOnFrontEndNav: true, // Cache pages navigated to on the client-side
  aggressiveFrontEndNavCaching: true, // More aggressive caching for client-side navigation
  reloadOnOnline: true, // Reload the app when it comes back online
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);

