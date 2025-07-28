
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, GraduationCap, CheckSquare, Users, Building, ShieldCheck, TrendingUp, MessageSquare, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => (
    <div className="p-6 rounded-2xl bg-card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${color}`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

const WavyBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-blue-400 via-blue-500 to-sky-500 opacity-80" />
    </div>
)

const WaveDivider = () => (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[150px]">
            <path fill="hsl(var(--background))" fillOpacity="1" d="M0,224L80,218.7C160,213,320,203,480,197.3C640,192,800,192,960,181.3C1120,171,1280,149,1360,138.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
    </div>
)


export default function WelcomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
       <header className="sticky top-0 z-50 w-full bg-blue-500 border-b border-border text-white">
            <div className="container mx-auto h-20 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <div className="p-1.5 bg-transparent rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <span>InternHub</span>
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="#features" className="hover:text-white/80 transition-colors">Features</Link>
                    <Link href="#roles" className="hover:text-white/80 transition-colors">For Everyone</Link>
                    <Link href="/login" className="hover:text-white/80 transition-colors">Login</Link>
                </div>
                <Button asChild variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white rounded-full">
                    <Link href="/student-verification">Get Started</Link>
                </Button>
            </div>
        </header>

        {/* Hero Section */}
        <section className="relative w-full text-white pt-16 pb-32 md:pt-20 md:pb-40 text-center overflow-hidden">
            <WavyBackground />
             <div className="container mx-auto px-4 relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                   Your Internship Journey, Organized.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-white/90">
                    An integrated ecosystem to streamline daily tasks, reports, and feedback, connecting students, lecturers, and supervisors for a seamless internship experience.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                     <Button asChild size="lg" className="text-base h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transform hover:scale-105 transition-transform">
                        <Link href="/student-verification">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                     <Button asChild variant="outline" size="lg" className="text-base h-12 px-8 bg-transparent border-white/50 hover:bg-white/10 text-white rounded-full">
                        <Link href="/onboarding/step1"><PlayCircle className="mr-2 h-5 w-5" />Discover InternHub</Link>
                    </Button>
                </div>
                <div className="relative mt-16 max-w-4xl mx-auto aspect-[4/3] sm:aspect-[16/9]">
                    <Image 
                        src="/IMG-20250228-WA0051.jpg" 
                        alt="InternHub application dashboard" 
                        className="rounded-xl shadow-2xl border-4 border-white/10"
                        data-ai-hint="app dashboard" 
                        layout="fill"
                        objectFit="cover" 
                    />
                </div>
            </div>
             <WaveDivider />
        </section>

        {/* Features Section */}
         <section id="features" className="w-full bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <Badge variant="outline" className="mb-4 text-primary border-primary/50 bg-primary/10">
                    Core Features
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">A Unified Platform for All Stakeholders</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    Designed to simplify communication, enhance monitoring, and ensure a valuable internship experience for everyone involved.
                </p>
                 <div id="roles" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={CheckSquare}
                        title="For Students"
                        description="Log daily tasks, submit reports with multimedia attachments, track your progress, and get timely feedback from supervisors and lecturers."
                        color="bg-blue-500"
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="For Lecturers"
                        description="Monitor student progress, review and approve reports, provide academic guidance, and manage evaluations all in one place."
                        color="bg-green-500"
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="For Supervisors"
                        description="Approve daily tasks, provide crucial industry feedback, evaluate intern performance, and communicate seamlessly with the university."
                        color="bg-purple-500"
                    />
                </div>
            </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="w-full bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-foreground">Ready to Get Started?</h2>
                <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                    Join InternHub today and take the first step towards a more organized and impactful internship.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg" className="text-base h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transform hover:scale-105 transition-transform">
                        <Link href="/student-verification">Begin Your Journey <ArrowRight className="ml-2 h-5 w-5"/></Link>
                    </Button>
                </div>
            </div>
        </section>

      {/* Footer */}
      <footer className="w-full bg-background border-t border-border">
            <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Empowering Futures.</p>
            </div>
        </footer>
    </main>
  );
}
