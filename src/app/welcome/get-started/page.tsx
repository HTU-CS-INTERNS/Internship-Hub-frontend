
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

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 280" // Adjusted viewBox for a potentially smaller wave here
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[150px] sm:h-[200px]" // Smaller wave
    >
      <path
        fill="hsl(195, 47%, 32%)" // Dark Teal/Blue
        fillOpacity="1"
        d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,112C840,96,960,96,1080,106.7C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
      ></path>
    </svg>
  </div>
);


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
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-clip p-4">
      <TopWave />
      <div className="flex-grow flex flex-col items-center justify-center z-0"> {/* Added z-0 */}
        <div className="space-y-3 max-w-xs w-full text-center">
          <div className="animate-in fade-in-0 slide-in-from-top-8 duration-700">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <div className="p-2 bg-primary rounded-full shadow-md">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight">
              Final Steps Before You Start
            </h1>
            <p className="text-sm text-foreground/80 font-body leading-normal">
              Review essential information to begin your journey with InternHub.
            </p>
          </div>

          <Card className="bg-card/90 backdrop-blur-sm shadow-lg rounded-xl text-left animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200 w-full">
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-semibold text-foreground">Consents & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2.5">
              <div className="items-top flex space-x-2 p-2 border rounded-lg bg-muted/50">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} className="mt-0.5"/>
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="terms" className="text-xs font-medium text-foreground cursor-pointer">
                    I agree to InternHub's
                    <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary hover:underline text-xs"><Link href="/terms-placeholder" target="_blank">Terms</Link></Button>
                    {' & '}
                    <Button variant="link" asChild className="p-0 h-auto ml-0.5 text-primary hover:underline text-xs"><Link href="/privacy-placeholder" target="_blank">Policy</Link></Button>.
                  </Label>
                </div>
              </div>

              <div className="p-2 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground flex items-center">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" /> Location Services
                  </Label>
                  {locationPermissionStatus === 'idle' && (
                    <Button size="xs" variant="outline" onClick={handleRequestLocationPermission} className="rounded-md text-xs h-6 px-1.5">
                      Enable
                    </Button>
                  )}
                  {locationPermissionStatus === 'pending' && (
                    <span className="text-xs text-muted-foreground italic">Requesting...</span>
                  )}
                  {locationPermissionStatus === 'granted' && (
                    <span className="text-xs text-green-600 flex items-center"><CheckCircle className="mr-1 h-3 w-3"/> Granted</span>
                  )}
                  {locationPermissionStatus === 'denied' && (
                    <span className="text-xs text-destructive flex items-center"><AlertTriangle className="mr-1 h-3 w-3"/> Denied</span>
                  )}
                </div>
              </div>
               <div className="flex items-start space-x-1.5 p-2 border-l-2 border-blue-500 bg-blue-500/10 rounded-r-md">
                  <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                      Proceeding means consent to data use as per our Policy.
                  </p>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 delay-400">
            <Link href="/onboarding/step1" passHref>
              <Button
                className="font-body text-sm px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group"
                disabled={!termsAccepted}
                aria-disabled={!termsAccepted}
              >
               Start Onboarding <Rocket className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            {!termsAccepted && (
              <p className="text-xs text-destructive mt-1">Please accept the terms to continue.</p>
            )}
          </div>
        </div>
      </div>
       <footer className="flex-shrink-0 py-4 text-center text-xs text-muted-foreground z-0">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
    