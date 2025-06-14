
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Top white section for the icon */}
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-10 pb-6 sm:pt-12 px-4">
        <div 
          className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center"
          // Soft Blue glow (Primary color HSL 207 90% 69% -> RGB 100, 181, 246)
          style={{ filter: 'drop-shadow(0px 0px 25px rgba(100, 181, 246, 0.35))' }} 
        >
          <LogIn className="h-16 w-16 sm:h-20 sm:w-20 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Bottom colored rectangle using primary color */}
      <div 
        className="relative w-full bg-primary rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-primary-foreground flex flex-col"
        style={{ minHeight: '65vh' }} // Ensure it takes up significant lower screen
      >
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-grow p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-sm sm:text-base font-body opacity-90 mt-1.5">
              Enter your credentials to access your account.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-auto pt-6 text-center text-sm">
            <span className="text-primary-foreground/80">Don&apos;t have an account? </span>
            <Button variant="link" asChild className="p-0 h-auto text-primary-foreground hover:text-primary-foreground/90 underline">
              <Link href="/welcome/get-started">Sign up</Link>
            </Button>
            <p className="text-xs text-primary-foreground/70 mt-6">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
    