
'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { seedLocalStorage } from '@/lib/services/seed.service';

// Since this is the root layout, metadata can be defined here.
// However, if we need client-side logic like `useEffect` for seeding,
// we need to handle it carefully. A common pattern is to have a client
// component inside a server component layout.

const AppMetadata: Metadata = {
  applicationName: "InternHub - HTU",
  title: {
    default: "InternHub - HTU",
    template: `%s - InternHub - HTU`,
  },
  description: "Streamlining Internship Management for Ho Technical University Students, Lecturers, and Companies.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InternHub - HTU",
  },
  formatDetection: {
    telephone: false,
  },
};

// A client component to handle the seeding logic
function LocalStorageSeeder() {
  React.useEffect(() => {
    seedLocalStorage();
  }, []);
  return null; // This component doesn't render anything
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="hsl(215, 50%, 25%)" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <LocalStorageSeeder />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
