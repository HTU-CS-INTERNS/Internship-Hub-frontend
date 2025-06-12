
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, GraduationCap, UserCheck, Users } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 text-center">
      <div className="space-y-6 max-w-2xl w-full">
        <div className="flex justify-center items-center space-x-3 mb-4 animate-in fade-in-0 slide-in-from-top-8 duration-500">
          <div className="p-3 bg-primary rounded-full shadow-lg">
            <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary tracking-tight">
            InternshipTrack
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-foreground/80 font-body leading-relaxed animate-in fade-in-0 slide-in-from-top-10 duration-700 delay-200">
          Your all-in-one platform for managing and tracking internships seamlessly.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 animate-in fade-in-0 slide-in-from-bottom-8 duration-500 delay-300">
            <div className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden group">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Student focused on work" 
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint="student computer"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                    <Users className="h-10 w-10 text-white/90 mb-2"/>
                    <h3 className="text-xl font-headline font-semibold text-white mb-1">For Students</h3>
                    <p className="text-xs text-center text-white/80">Track tasks, submit reports, and connect with supervisors.</p>
                </div>
            </div>
            <div className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden group">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Professional collaboration" 
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint="faculty meeting"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                    <UserCheck className="h-10 w-10 text-white/90 mb-2"/>
                    <h3 className="text-xl font-headline font-semibold text-white mb-1">For Staff</h3>
                    <p className="text-xs text-center text-white/80">Oversee progress, provide feedback, and manage assignments.</p>
                </div>
            </div>
        </div>

        <div className="pt-6 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-500">
          <Link href="/login" passHref>
            <Button size="lg" className="font-headline text-lg px-12 py-7 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full sm:w-auto">
              Launch Your Internship Journey
            </Button>
          </Link>
        </div>
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. Empowering Futures.</p>
      </footer>
    </main>
  );
}
