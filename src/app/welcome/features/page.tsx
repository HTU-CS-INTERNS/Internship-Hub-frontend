
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListChecks, FileText, MessageSquare, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="bg-card/80 backdrop-blur-sm shadow-lg rounded-xl text-left hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-center gap-3 pb-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function WelcomePage2() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 text-center">
      <div className="space-y-8 max-w-xl w-full">
        <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-8 duration-700">
          <div className="flex justify-center items-center space-x-3">
            <div className="p-3 bg-accent rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-accent tracking-tight">
              Stay Organized & Connected
            </h1>
          </div>
          <p className="text-lg text-foreground/80 font-body leading-relaxed">
            InternshipTrack provides all the tools you need for a successful internship experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
          <FeatureCard icon={ListChecks} title="Daily Tasks" description="Declare daily tasks and track your progress efficiently." />
          <FeatureCard icon={FileText} title="Work Reports" description="Easily submit detailed work reports for supervisor review." />
          <FeatureCard icon={MessageSquare} title="Feedback Hub" description="Communicate with lecturers and supervisors seamlessly." />
          <FeatureCard icon={MapPin} title="Check-ins" description="Verify your workplace attendance with secure check-ins." />
        </div>

        <div className="pt-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-400">
          <Link href="/welcome/get-started" passHref>
            <Button size="lg" className="font-headline text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full sm:w-auto group">
              Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. Your Success, Our Priority.</p>
      </footer>
    </main>
  );
}
