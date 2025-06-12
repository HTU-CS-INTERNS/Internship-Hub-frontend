'use client';

import { GraduationCap } from 'lucide-react';

export default function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-primary">
      <div className="flex flex-col items-center animate-pulse">
        <GraduationCap className="h-24 w-24 sm:h-28 sm:w-28 mb-6" />
        <h1 className="text-3xl sm:text-4xl font-headline font-bold">
          InternshipTrack
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Initializing your workspace...</p>
      </div>
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. All Rights Reserved.</p>
      </div>
    </div>
  );
}
