
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const APP_NAME = "InternHub - HTU"; // Updated
const APP_DESCRIPTION = "Streamlining Internship Management for Ho Technical University Students, Lecturers, and Companies."; // Updated

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
    // startUpImage: [], // You can add startup images here
  },
  formatDetection: {
    telephone: false,
  },
  // Open Graph metadata
  // openGraph: {
  //   type: "website",
  //   siteName: APP_NAME,
  //   title: {
  //     default: APP_NAME,
  //     template: `%s - ${APP_NAME}`,
  //   },
  //   description: APP_DESCRIPTION,
  // },
  // Twitter metadata
  // twitter: {
  //   card: "summary",
  //   title: {
  //     default: APP_NAME,
  //     template: `%s - ${APP_NAME}`,
  //   },
  //   description: APP_DESCRIPTION,
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Standard PWA meta tags are handled by Next.js Metadata API using the manifest */}
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
