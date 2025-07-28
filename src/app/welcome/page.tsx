
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, GraduationCap, CheckSquare, Users, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => (
    <div className="p-6 rounded-2xl bg-card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
);


export default function WelcomePage() {
  const isMobile = useIsMobile();
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
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
        <section className="container mx-auto flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
             <Badge variant="outline" className="mb-4 text-primary border-primary/50 bg-primary/10">The Official Internship Platform for Ho Technical University</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                Streamline Your Internship Journey
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                From daily task tracking to final evaluations, InternHub connects students, lecturers, and company supervisors on one seamless platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                 <Button asChild size="lg" className="text-base h-12 px-8">
                    <Link href="/student-verification">Student Verification <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                 <Button asChild variant="secondary" size="lg" className="text-base h-12 px-8">
                    <Link href="/onboarding/step1">How It Works</Link>
                </Button>
            </div>
             <div className="mt-12 relative w-full max-w-4xl aspect-video rounded-2xl shadow-2xl overflow-hidden border-8 border-card">
                <img src="https://placehold.co/1200x675.png" alt="InternHub Dashboard Preview" className="w-full h-full object-cover" data-ai-hint="dashboard analytics" />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
        </section>

        {/* Features Section */}
         <section id="features" className="w-full bg-muted/50 py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">A Unified Platform for All Stakeholders</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    Designed to simplify communication, enhance monitoring, and ensure a valuable internship experience for everyone involved.
                </p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <FeatureCard
                        icon={CheckSquare}
                        title="For Students"
                        description="Log daily tasks, submit reports with multimedia attachments, track your progress, and get timely feedback from supervisors and lecturers."
                        color="bg-blue-500"
                    />
                    <FeatureCard
                        icon={Users}
                        title="For Lecturers"
                        description="Monitor student progress, review and approve reports, provide academic guidance, and manage evaluations all in one place."
                        color="bg-green-500"
                    />
                    <FeatureCard
                        icon={Building}
                        title="For Supervisors"
                        description="Approve daily tasks, provide crucial industry feedback, evaluate intern performance, and communicate seamlessly with the university."
                        color="bg-purple-500"
                    />
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
