
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, GraduationCap, CheckSquare, Users, Building, ShieldCheck, TrendingUp, MessageSquare } from 'lucide-react';
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


export default function WelcomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
       <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto h-16 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>InternHub</span>
                </Link>
                <div className="flex items-center gap-2">
                     <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/student-verification">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>

        {/* Hero Section */}
        <section className="relative w-full bg-primary/5 overflow-hidden">
             <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center px-4 py-16 md:py-24">
                <div className="text-center lg:text-left z-10">
                    <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
                        The Future of Internship Management
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        Empowering Your Internship Experience
                    </h1>
                    <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
                        From daily task tracking to final evaluations, InternHub connects students, lecturers, and company supervisors on one seamless platform.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                         <Button asChild size="lg" className="text-base h-12 px-8">
                            <Link href="/student-verification">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                         <Button asChild variant="secondary" size="lg" className="text-base h-12 px-8">
                            <Link href="/onboarding/step1">How It Works</Link>
                        </Button>
                    </div>
                </div>
                 <div className="relative w-full max-w-lg mx-auto lg:max-w-none aspect-square lg:aspect-auto h-[300px] sm:h-[400px] lg:h-auto">
                    <Image src="https://placehold.co/800x600.png" alt="Internship collaboration illustration" className="w-full h-full object-contain" data-ai-hint="students collaborating office" layout="fill" />
                </div>
            </div>
             <div 
                className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" 
                style={{ content: '""' }}
            />
        </section>

        {/* Features Section */}
         <section id="features" className="w-full bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">A Unified Platform for All Stakeholders</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    Designed to simplify communication, enhance monitoring, and ensure a valuable internship experience for everyone involved.
                </p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <Button asChild size="lg" className="text-base h-12 px-8">
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
