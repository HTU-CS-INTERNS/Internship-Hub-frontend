
import { RegistrationForm } from '@/components/auth/registration-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <>
      {/* Top white section with large icon */}
      <div className="flex-grow flex flex-col items-center justify-center pt-10 pb-6 sm:pt-16 sm:pb-8 px-4">
        <div 
          className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center"
          style={{ filter: 'drop-shadow(0px 0px 25px rgba(255, 183, 77, 0.35))' }} // Glow with accent color (warm orange)
        >
          <UserPlus className="h-16 w-16 sm:h-20 sm:w-20 text-accent" strokeWidth={1.5} />
        </div>
      </div>

      {/* Bottom colored rectangle for the form */}
      {/* Using accent color for registration, text color needs to be dark for yellow-ish accent */}
      <div className="relative w-full bg-accent rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-accent-foreground"> {/* Assuming accent-foreground is dark enough */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col p-6 sm:p-8 min-h-[70vh] sm:min-h-[65vh]"> {/* Increased min-height for multi-step form */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base opacity-90 mt-1.5">
              Start your internship journey with InternshipTrack.
            </p>
          </div>
          
          <RegistrationForm /> {/* This component handles its own steps */}
          
          <div className="mt-auto pt-6 text-center text-sm">
            <span className="opacity-80">Already have an account? </span>
            <Button variant="link" asChild className="p-0 h-auto text-accent-foreground hover:text-accent-foreground/90 underline">
              <Link href="/login">Log in</Link>
            </Button>
             <p className="text-xs opacity-70 mt-6">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </>
  );
}
    