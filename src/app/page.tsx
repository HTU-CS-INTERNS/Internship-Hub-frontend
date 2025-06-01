import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, GraduationCap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center items-center space-x-4">
          <GraduationCap className="h-16 w-16 text-primary" />
          <h1 className="text-5xl font-headline font-bold text-primary">
            InternshipTrack
          </h1>
        </div>
        <p className="text-xl text-foreground/80 font-body leading-relaxed">
          Streamlining internship management for students, lecturers, and companies. Track progress, submit reports, and foster collaboration seamlessly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8">
            <div data-ai-hint="student working" className="relative w-full sm:w-1/2 max-w-xs h-64 rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img src="https://placehold.co/400x300.png" alt="Student working on internship" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                    <h3 className="text-2xl font-headline font-semibold text-white mb-2">Students</h3>
                    <p className="text-sm text-center text-white/90">Manage your tasks, submit daily reports, and communicate with your supervisors.</p>
                </div>
            </div>
            <div data-ai-hint="professional meeting" className="relative w-full sm:w-1/2 max-w-xs h-64 rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img src="https://placehold.co/400x300.png" alt="Professional meeting" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                    <h3 className="text-2xl font-headline font-semibold text-white mb-2">Faculty & Supervisors</h3>
                    <p className="text-sm text-center text-white/90">Assign lecturers, oversee progress, and provide valuable feedback.</p>
                </div>
            </div>
        </div>
        <Link href="/login" passHref>
          <Button size="lg" className="mt-8 font-headline text-lg px-12 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
            Get Started
          </Button>
        </Link>
      </div>
      <footer className="absolute bottom-8 text-center text-foreground/60 font-body text-sm">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. All rights reserved.</p>
        <p>Built with Next.js and Tailwind CSS.</p>
      </footer>
    </main>
  );
}
