
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, GraduationCap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="flex justify-center items-center space-x-4 mb-6">
          <GraduationCap className="h-14 w-14 sm:h-16 sm:w-16 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            InternshipTrack
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-foreground/80 font-body leading-relaxed">
          Streamlining internship management for students, lecturers, and companies. Track progress, submit reports, and foster collaboration seamlessly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
            <div className="relative w-full h-72 rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 group">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Student working on internship" 
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:opacity-90 transition-opacity"
                  data-ai-hint="student computer"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                    <h3 className="text-2xl font-headline font-semibold text-white mb-2">Students</h3>
                    <p className="text-sm text-center text-white/90">Manage your tasks, submit daily reports, and communicate with your supervisors.</p>
                </div>
            </div>
            <div className="relative w-full h-72 rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 group">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Professional meeting" 
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:opacity-90 transition-opacity"
                  data-ai-hint="faculty meeting"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                    <h3 className="text-2xl font-headline font-semibold text-white mb-2">Faculty & Supervisors</h3>
                    <p className="text-sm text-center text-white/90">Assign lecturers, oversee progress, and provide valuable feedback.</p>
                </div>
            </div>
        </div>
        <Link href="/login" passHref>
          <Button size="lg" className="mt-10 font-headline text-lg px-10 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-300 rounded-lg">
            Get Started
          </Button>
        </Link>
      </div>
      <footer className="absolute bottom-6 sm:bottom-8 text-center text-foreground/60 font-body text-sm">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. All rights reserved.</p>
        <p>Built with Next.js, ShadCN UI, and Tailwind CSS.</p>
      </footer>
    </main>
  );
}
