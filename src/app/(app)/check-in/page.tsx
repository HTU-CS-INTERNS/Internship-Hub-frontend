
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MapPin, LocateFixed, AlertTriangle, CheckCircle, Camera, XCircle, Info } from 'lucide-react';
import Image from 'next/image'; // For image preview

type CheckinStep = 'initial' | 'gpsPrompt' | 'manualReason' | 'geofenceWarning' | 'success';

export default function CheckInPage() {
  const [step, setStep] = React.useState<CheckinStep>('initial');
  const [manualReason, setManualReason] = React.useState('');
  const [checkinTime, setCheckinTime] = React.useState('');
  const [checkinLocation, setCheckinLocation] = React.useState('');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [securePhoto, setSecurePhoto] = React.useState<File | null>(null);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const securePhotoInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetFlow = () => {
    setStep('initial');
    setManualReason('');
    setSecurePhoto(null);
    setSecurePhotoPreview(null);
    if (securePhotoInputRef.current) {
      securePhotoInputRef.current.value = "";
    }
  };

  const handleCheckIn = () => {
    setStep('gpsPrompt');
  };

  const handleAllowGps = async () => {
    toast({ title: 'Requesting Location', description: 'Please wait...' });
    try {
      // Simulate getting location
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate geofence check (80% success)
      const withinGeofence = Math.random() < 0.8;

      if (withinGeofence) {
        const now = new Date();
        setCheckinTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setCheckinLocation('Acme Corp HQ (Verified)');
        setStep('success');
        toast({ title: 'Success', description: 'Location verified within geofence.' });
      } else {
        setStep('geofenceWarning');
        toast({ variant: 'destructive', title: 'Geofence Alert', description: 'You appear to be outside the designated work area.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not retrieve location.' });
      setStep('manualReason'); // Fallback to manual
    }
  };

  const handleDenyGps = () => {
    setStep('manualReason');
  };

  const handleSubmitManual = () => {
    if (!manualReason.trim() && !securePhoto) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a reason or a secure photo for manual check-in.' });
      return;
    }
    const now = new Date();
    setCheckinTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCheckinLocation(`Manual: ${manualReason.substring(0,20) || 'Photo Submitted'}`);
    setStep('success');
    toast({ title: 'Manual Check-in Submitted', description: 'Your check-in reason has been recorded.' });
  };
  
  const handleSecurePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSecurePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecurePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSecurePhoto = () => {
    setSecurePhoto(null);
    setSecurePhotoPreview(null);
    if (securePhotoInputRef.current) {
      securePhotoInputRef.current.value = "";
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="text-center py-4">
            <div className="geofence-indicator w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-primary w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Check-in at Workplace</h4>
            <p className="text-sm text-muted-foreground mb-6">Verify your location to record your attendance.</p>
            <Button onClick={handleCheckIn} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 pulse-once rounded-lg text-base">
              Check-in Now
            </Button>
            <p className="text-xs text-muted-foreground mt-3">You have opted into location tracking.</p>
          </div>
        );
      case 'gpsPrompt':
        return (
          <div className="text-center py-4 slide-in">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LocateFixed className="text-accent w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Allow Location Access</h4>
            <p className="text-sm text-muted-foreground mb-6">We need your location to verify you're at your workplace.</p>
            <div className="flex space-x-3">
              <Button onClick={handleDenyGps} variant="outline" className="flex-1 py-3 rounded-lg text-base">Deny</Button>
              <Button onClick={handleAllowGps} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Allow</Button>
            </div>
          </div>
        );
      case 'manualReason':
        return (
          <div className="py-4 slide-in space-y-4">
            <div className="text-center">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="text-destructive w-10 h-10" />
                </div>
                <h4 className="font-bold text-lg text-foreground mb-1">Manual Check-in</h4>
                <p className="text-sm text-muted-foreground mb-4">GPS access was denied or unavailable. Please provide a reason or a secure photo.</p>
            </div>
            <Textarea
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="Why are you checking in manually? (e.g., Working from a temporary site today)"
              className="rounded-lg"
              rows={3}
            />
            <div>
                <label htmlFor="secure-photo-manual" className="block text-sm font-medium text-foreground mb-1">Secure Photo (Optional)</label>
                 <input
                    ref={securePhotoInputRef}
                    id="secure-photo-manual"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleSecurePhotoChange}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
            </div>
            {securePhotoPreview && (
                <div className="mt-2 relative w-full max-w-xs mx-auto aspect-video rounded-lg overflow-hidden border shadow-sm">
                    <Image src={securePhotoPreview} alt="Secure photo preview" layout="fill" objectFit="cover" data-ai-hint="workplace person"/>
                    <Button onClick={clearSecurePhoto} variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full">
                        <XCircle className="h-4 w-4"/>
                    </Button>
                </div>
            )}
            <div className="flex space-x-3 mt-4">
              <Button onClick={resetFlow} variant="outline" className="flex-1 py-3 rounded-lg text-base">Cancel</Button>
              <Button onClick={handleSubmitManual} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Submit Reason</Button>
            </div>
          </div>
        );
      case 'geofenceWarning':
        return (
          <div className="text-center py-4 slide-in">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-orange-500 w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Not at Workplace</h4>
            <p className="text-sm text-muted-foreground mb-6">You appear to be outside the company's geofence. Check-in failed.</p>
            <div className="flex space-x-3">
              <Button onClick={() => setStep('manualReason')} variant="outline" className="flex-1 py-3 rounded-lg text-base">Manual Check-in</Button>
              <Button onClick={handleAllowGps} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Retry GPS</Button>
            </div>
             <Button onClick={() => {toast({title: "Supervisor Notified", description: "Your supervisor has been informed about the location mismatch."}); resetFlow();}} variant="ghost" className="w-full mt-3 text-primary">Notify Supervisor</Button>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-4 slide-in">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Checked-in Successfully!</h4>
            <p className="text-sm text-muted-foreground mb-6">Your attendance has been recorded.</p>
            <Card className="bg-muted/50 p-4 text-left mb-6 shadow-inner rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-foreground">{checkinTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-foreground">{checkinLocation}</span>
              </div>
              {securePhotoPreview && (
                 <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Secure Photo:</p>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <Image src={securePhotoPreview} alt="Secure photo submitted" layout="fill" objectFit="cover" data-ai-hint="workplace id person"/>
                    </div>
                </div>
              )}
            </Card>
            <Button onClick={resetFlow} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg text-base">Done</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-0 md:pt-6 max-w-md mx-auto min-h-[calc(100vh-var(--mobile-header-height)-var(--mobile-bottom-nav-height))] md:min-h-0 flex flex-col justify-center">
       <Card className="shadow-xl rounded-xl flex-grow md:flex-grow-0 flex flex-col">
         <CardHeader className="border-b">
           <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-xl">Daily Check-in</CardTitle>
            <div className="flex items-center space-x-1">
                <div className={`w-2.5 h-2.5 rounded-full ${step === 'success' || step === 'initial' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-xs text-muted-foreground">Online</span>
            </div>
           </div>
         </CardHeader>
         <CardContent className="p-4 flex-1 flex flex-col justify-center">
            {renderStepContent()}
         </CardContent>
       </Card>
    </div>
  );
}
