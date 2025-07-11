
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const APP_NAME = "InternHub - HTU"; 
const APP_DESCRIPTION = "Streamlining Internship Management for Ho Technical University Students, Lecturers, and Companies with InternHub.";

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', 
  workboxOptions: {
    disableDevLogs: true, 
  },
  fallbacks: {
    document: '/offline', // Fallback for document/HTML requests when offline
    // You can also add fallbacks for images, fonts, etc. if needed
    // image: '/offline-placeholder.png', 
  },
  cacheOnFrontEndNav: true, 
  aggressiveFrontEndNavCaching: true, 
  reloadOnOnline: true, 
  manifest: {
    name: APP_NAME,
    short_name: "InternHubHTU", 
    description: APP_DESCRIPTION,
    start_url: "/", 
    display: "standalone",
    scope: "/",
    background_color: "#ffffff", 
    theme_color: "hsl(215, 50%, 25%)", // HTU Navy Blue     
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
    
