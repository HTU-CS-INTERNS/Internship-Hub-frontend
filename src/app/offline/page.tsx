
'use client';

import { WifiOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
      <div className="bg-card p-8 sm:p-10 rounded-xl shadow-2xl max-w-md w-full">
        <div className="mb-6">
          <WifiOff className="mx-auto h-20 w-20 text-destructive animate-pulse" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-foreground mb-3">
          You're Offline
        </h1>
        <p className="text-muted-foreground mb-8 text-base">
          It seems you're not connected to the internet. Please check your connection and try again.
          Some features of InternHub may be unavailable.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-base"
          >
            Try Reloading
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full border-input hover:bg-muted rounded-lg py-3 text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
           <p className="text-xs text-muted-foreground pt-4">
            If you recently visited pages, they might still be available.
          </p>
        </div>
      </div>
      <footer className="mt-12 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} InternHub - HTU
      </footer>
    </main>
  );
}
