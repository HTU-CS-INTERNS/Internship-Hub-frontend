
import { RegistrationForm } from '@/components/auth/registration-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-10 pb-6 sm:pt-12 px-4">
        <div 
          className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center"
          style={{ filter: 'drop-shadow(0px 0px 25px rgba(217, 38, 38, 0.35))' }} // Glow with HTU Red RGBA
        >
          <UserPlus className="h-16 w-16 sm:h-20 sm:w-20 text-accent" strokeWidth={1.5} /> {/* Icon color from accent CSS var */}
        </div>
      </div>

      <div 
        className="relative w-full bg-accent rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-accent-foreground flex flex-col"
        style={{ minHeight: '70vh' }} 
      >
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-grow p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base opacity-90 mt-1.5">
              Start your internship journey with InternHub.
            </p>
          </div>
          
          <RegistrationForm />
          
          <div className="mt-auto pt-6 text-center text-sm">
            <span className="opacity-80">Already have an account? </span>
            <Button variant="link" asChild className="p-0 h-auto text-accent-foreground hover:text-accent-foreground/90 underline">
              <Link href="/login">Log in</Link>
            </Button>
             <p className="text-xs opacity-70 mt-6">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
    