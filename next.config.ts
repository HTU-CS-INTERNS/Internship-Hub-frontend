
import type { NextConfig } from 'next';
// Correctly import the default export from @ducanh2912/next-pwa
import withPWAInit from '@ducanh2912/next-pwa';

const APP_NAME = "InternHub"; 
const APP_DESCRIPTION = "Streamlining Internship Management for Ho Technical University Students, Lecturers, and Companies.";

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  workboxOptions: {
    disableDevLogs: true, // Disable Workbox logs in development
    // importScripts: ['/custom-sw.js'], // Removed custom service worker for troubleshooting
  },
  fallbacks: {
    // document: '/offline', // example: fallbacks to /_offline if the page is not cached
    // image: '/static/images/fallback.png',
    // font: '/static/fonts/fallback.woff2',
  },
  cacheOnFrontEndNav: true, 
  aggressiveFrontEndNavCaching: true, 
  reloadOnOnline: true, 
  manifest: {
    name: APP_NAME,
    short_name: "InternHubHTU", 
    description: APP_DESCRIPTION,
    start_url: "/", // Explicitly set to root, which is now the welcome page
    display: "standalone",
    scope: "/",
    background_color: "#f5f5f5", 
    theme_color: "#4f46e5",     
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
