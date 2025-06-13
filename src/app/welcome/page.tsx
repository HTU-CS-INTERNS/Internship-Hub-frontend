
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, MapPin, CheckCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelcomePage1() {
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = React.useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');
  const { toast } = useToast();

  const handleRequestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationPermissionStatus('denied');
      toast({
        title: 'Location Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setLocationPermissionStatus('pending');
    toast({
      title: 'Requesting Location',
      description: 'Please respond to the browser permission prompt.',
    });

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermissionStatus('granted');
        toast({
          title: 'Location Access Granted!',
          description: 'Thank you for enabling location services.',
          variant: 'default',
        });
      },
      (error) => {
        setLocationPermissionStatus('denied');
        let message = 'Location access was denied.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'You denied location access. Some features may be limited.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'The request to get user location timed out.';
        }
        toast({
          title: 'Location Access Denied',
          description: message,
          variant: 'destructive',
        });
      }
    );
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 text-center">
      <div className="space-y-6 max-w-lg w-full">
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

        <Card className="bg-card/80 backdrop-blur-sm shadow-lg rounded-xl text-left animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary"/> Before We Start
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Please review and accept our terms and optionally enable location services for enhanced features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="items-top flex space-x-2 p-3 border rounded-lg bg-muted/30">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm font-medium text-foreground cursor-pointer">
                  I have read and agree to the InternshipTrack
                  <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary hover:underline"><Link href="/terms-placeholder" target="_blank">Terms and Conditions</Link></Button>
                  {' '}and
                  <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary hover:underline"><Link href="/privacy-placeholder" target="_blank">Privacy Policy</Link></Button>.
                </Label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you confirm your agreement.
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-primary" /> Location Services
                </Label>
                {locationPermissionStatus === 'idle' && (
                  <Button size="sm" variant="outline" onClick={handleRequestLocationPermission} className="rounded-md">
                    Enable
                  </Button>
                )}
                {locationPermissionStatus === 'pending' && (
                  <span className="text-xs text-muted-foreground italic">Requesting...</span>
                )}
                {locationPermissionStatus === 'granted' && (
                  <span className="text-xs text-green-600 flex items-center"><CheckCircle className="mr-1 h-4 w-4"/> Granted</span>
                )}
                {locationPermissionStatus === 'denied' && (
                  <span className="text-xs text-destructive flex items-center"><AlertTriangle className="mr-1 h-4 w-4"/> Denied</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                We use your location for features like workplace check-ins. You can manage this in your browser settings later.
              </p>
            </div>
             <div className="flex items-start space-x-2 p-3 border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                    By proceeding, you consent to the collection and use of information essential for app functionality as described in our Privacy Policy.
                </p>
            </div>
          </CardContent>
        </Card>

        <div className="pt-2 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-400">
          <Link href="/welcome/get-started" passHref>
            <Button
              size="lg"
              className="font-headline text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full sm:w-auto group"
              disabled={!termsAccepted}
              aria-disabled={!termsAccepted}
            >
              Next <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          {!termsAccepted && (
            <p className="text-xs text-destructive mt-2">Please accept the terms to continue.</p>
          )}
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternshipTrack. Empowering Futures.</p>
      </footer>
    </main>
  );
}
