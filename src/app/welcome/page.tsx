
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage1() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 text-center">
      <div className="space-y-8 max-w-md w-full">
        <div className="animate-in fade-in-0 slide-in-from-top-8 duration-700">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Internship Success" 
            width={600} 
            height={400} 
            className="rounded-xl shadow-2xl object-cover aspect-video"
            data-ai-hint="team collaboration success"
          />
        </div>

        <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex justify-center items-center space-x-3">
            <div className="p-3 bg-primary rounded-full shadow-lg">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">
              Welcome to InternshipTrack!
            </h1>
          </div>
          <p className="text-lg text-foreground/80 font-body leading-relaxed">
            Your all-in-one platform for managing and tracking internships seamlessly.
          </p>
        </div>

        <div className="pt-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-400">
          <Link href="/welcome/features" passHref>
            <Button size="lg" className="font-headline text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full sm:w-auto group">
              Discover Features <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
       <footer className="absolute bottom-8 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. Empowering Futures.</p>
      </footer>
    </main>
  );
}
