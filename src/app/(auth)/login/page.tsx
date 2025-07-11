
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Top Section with Icon and Glow */}
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-10 pb-6 sm:pt-12 px-4">
        <div 
          className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center shadow-lg"
          style={{ filter: 'drop-shadow(0px 0px 25px rgba(100, 181, 246, 0.35))' }} 
        >
          <LogIn className="h-16 w-16 sm:h-20 sm:w-20 text-primary" strokeWidth={1.5} /> 
        </div>
      </div>

      {/* Bottom Colored Rectangle Section */}
      <div 
        className="relative w-full bg-primary rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-primary-foreground flex flex-col"
        style={{ minHeight: '65vh' }} 
      >
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-grow p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-sm sm:text-base font-body opacity-90 mt-1.5">
              Enter your email and password to access your InternHub account.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-auto pt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-primary-foreground/80">New to InternHub? </span>
              <Button variant="link" asChild className="p-0 h-auto text-primary-foreground hover:text-primary-foreground/90 underline">
                <Link href="/welcome/get-started">Discover the features</Link>
              </Button>
            </div>
            <div>
              <span className="text-primary-foreground/80">Student verification: </span>
              <Button variant="link" asChild className="p-0 h-auto text-primary-foreground hover:text-primary-foreground/90 underline">
                <Link href="/student-verification">Verify your account</Link>
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-6">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
    