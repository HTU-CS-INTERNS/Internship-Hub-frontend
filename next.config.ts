
import type { NextConfig } from 'next';
// Correctly import the default export from @ducanh2912/next-pwa
import withPWAInit from '@ducanh2912/next-pwa';

const APP_NAME = "InternHub"; // Updated
const APP_DESCRIPTION = "Streamlining Internship Management for Ho Technical University Students, Lecturers, and Companies."; // Updated

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
    // document: '/offline', // example: fallbacks to /_offline if the page is not cached
    // image: '/static/images/fallback.png',
    // font: '/static/fonts/fallback.woff2',
  },
  cacheOnFrontEndNav: true, // Cache pages navigated to on the client-side
  aggressiveFrontEndNavCaching: true, // More aggressive caching for client-side navigation
  reloadOnOnline: true, // Reload the app when it comes back online
  manifest: {
    name: APP_NAME,
    short_name: "InternHubHTU", // Updated
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    scope: "/",
    background_color: "#f5f5f5", // Corresponds to hsl(0 0% 96%)
    theme_color: "#4f46e5",     // Corresponds to hsl(225, 73%, 57%) - Primary color
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
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
