
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, ShieldCheck, MapPin, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function WelcomeGetStartedPage() {
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
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="space-y-4 max-w-md w-full">
          <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-8 duration-700">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-2 bg-primary rounded-full shadow-lg">
                <ShieldCheck className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">
                Final Steps Before You Start
              </h1>
            </div>
            <p className="text-base text-foreground/80 font-body leading-relaxed">
              Review essential information to begin your journey with InternHub for Ho Technical University.
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm shadow-lg rounded-xl text-left animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
            <CardHeader className="p-4">
              <CardTitle className="text-base font-semibold text-foreground">Consents & Permissions</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Please review and accept our terms and optionally enable location services.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="items-top flex space-x-2 p-2 border rounded-lg bg-muted/30">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} className="mt-0.5"/>
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="terms" className="text-xs font-medium text-foreground cursor-pointer">
                    I have read and agree to the InternHub
                    <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary hover:underline text-xs"><Link href="/terms-placeholder" target="_blank">Terms</Link></Button>
                    {' & '}
                    <Button variant="link" asChild className="p-0 h-auto ml-0.5 text-primary hover:underline text-xs"><Link href="/privacy-placeholder" target="_blank">Privacy Policy</Link></Button>.
                  </Label>
                </div>
              </div>

              <div className="p-2 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground flex items-center">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" /> Location Services
                  </Label>
                  {locationPermissionStatus === 'idle' && (
                    <Button size="sm" variant="outline" onClick={handleRequestLocationPermission} className="rounded-md text-xs h-7 px-2">
                      Enable
                    </Button>
                  )}
                  {locationPermissionStatus === 'pending' && (
                    <span className="text-xs text-muted-foreground italic">Requesting...</span>
                  )}
                  {locationPermissionStatus === 'granted' && (
                    <span className="text-xs text-green-600 flex items-center"><CheckCircle className="mr-1 h-3.5 w-3.5"/> Granted</span>
                  )}
                  {locationPermissionStatus === 'denied' && (
                    <span className="text-xs text-destructive flex items-center"><AlertTriangle className="mr-1 h-3.5 w-3.5"/> Denied</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for features like workplace check-ins. Manage this in browser settings later.
                </p>
              </div>
               <div className="flex items-start space-x-1.5 p-2 border-l-2 border-blue-500 bg-blue-500/10 rounded-r-md">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                      By proceeding, you consent to information collection as per our Privacy Policy.
                  </p>
              </div>
            </CardContent>
          </Card>

          <div className="pt-1 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-400">
            <Link href="/onboarding/step1" passHref>
              <Button
                className="font-headline text-base px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full sm:w-auto group"
                disabled={!termsAccepted}
                aria-disabled={!termsAccepted}
              >
               Start Onboarding <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            {!termsAccepted && (
              <p className="text-xs text-destructive mt-1.5">Please accept the terms to continue.</p>
            )}
          </div>
        </div>
      </div>
       <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Your Journey Starts Here.</p>
      </footer>
    </main>
  );
}
