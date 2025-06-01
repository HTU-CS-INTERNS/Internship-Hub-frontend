
import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'InternshipTrack',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-6 md:p-8">
      <Link href="/" className="mb-8 flex items-center space-x-3 group">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
            <GraduationCap className="h-7 w-7 text-primary-foreground transition-transform group-hover:scale-110" />
        </div>
        <span className="text-3xl font-headline font-bold text-primary group-hover:text-primary/80 transition-colors">
          InternshipTrack
        </span>
      </Link>
      <main className="w-full max-w-md">
        {children}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

    