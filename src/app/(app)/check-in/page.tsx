
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MapPin, LocateFixed, AlertTriangle, CheckCircle, Camera, XCircle, Info, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image'; // For image preview and map placeholder

type CheckinStep = 'initial' | 'gpsPrompt' | 'manualReason' | 'geofenceWarning' | 'success';

export default function CheckInPage() {
  const [step, setStep] = React.useState<CheckinStep>('initial');
  const [manualReason, setManualReason] = React.useState('');
  const [checkinTime, setCheckinTime] = React.useState('');
  const [checkinLocation, setCheckinLocation] = React.useState('');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null); // Keep for potential future use
  const [securePhoto, setSecurePhoto] = React.useState<File | null>(null);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null); // Keep for potential future direct camera integration
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      const withinGeofence = Math.random() < 0.8; // 80% success for geofence

      if (withinGeofence) {
        const now = new Date();
        setCheckinTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        setCheckinLocation('Acme Corp HQ (Verified)');
        setStep('success');
        toast({ title: 'Success', description: 'Location verified within geofence.' });
      } else {
        setStep('geofenceWarning');
        toast({ variant: 'destructive', title: 'Geofence Alert', description: 'You appear to be outside the designated work area.' });
      }
    } catch (error) {
      console.error("GPS Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not retrieve location.' });
      setStep('manualReason'); 
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
    setCheckinTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    setCheckinLocation(`Manual: ${manualReason.substring(0,30) || 'Photo Submitted'}`);
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
          <div className="text-center py-6">
            <div className="geofence-indicator w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <MapPin className="text-primary w-12 h-12" />
            </div>
            <h4 className="font-bold text-xl text-foreground mb-2">Check-in at Workplace</h4>
            <p className="text-muted-foreground mb-8">Verify your location to record your attendance for today.</p>
            <Button onClick={handleCheckIn} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 pulse-once rounded-lg text-lg">
              Check-in Now
            </Button>
            <p className="text-xs text-muted-foreground mt-4">You have opted into location tracking for check-ins.</p>
          </div>
        );
      case 'gpsPrompt':
        return (
          <div className="text-center py-6 slide-in">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <LocateFixed className="text-accent w-12 h-12" />
            </div>
            <h4 className="font-bold text-xl text-foreground mb-2">Allow Location Access</h4>
            <p className="text-muted-foreground mb-8">We need your current location to verify you're at your workplace.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button onClick={handleDenyGps} variant="outline" className="flex-1 py-3 rounded-lg text-base border-input hover:bg-muted">Deny Access</Button>
              <Button onClick={handleAllowGps} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Allow GPS</Button>
            </div>
          </div>
        );
      case 'manualReason':
        return (
          <div className="py-6 slide-in space-y-6">
            <div className="text-center">
                <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="text-destructive w-12 h-12" />
                </div>
                <h4 className="font-bold text-xl text-foreground mb-1">Manual Check-in Required</h4>
                <p className="text-muted-foreground mb-4">GPS access was denied or unavailable. Please provide a reason or a secure photo.</p>
            </div>
            <Textarea
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="E.g., Working from a temporary site, GPS signal issue..."
              className="rounded-lg border-input"
              rows={4}
            />
            <div>
                <label htmlFor="secure-photo-manual" className="block text-sm font-medium text-foreground mb-2">Secure Photo (Optional)</label>
                <div className="flex flex-col items-center justify-center w-full">
                     <label htmlFor="secure-photo-manual-input" className="flex flex-col items-center justify-center w-full h-40 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 relative overflow-hidden">
                        {securePhotoPreview ? (
                             <Image src={securePhotoPreview} alt="Secure photo preview" layout="fill" objectFit="contain" data-ai-hint="workplace person"/>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <Camera className="w-10 h-10 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Capture Secure Photo</span></p>
                                <p className="text-xs text-muted-foreground">Use device camera</p>
                            </div>
                        )}
                        <input
                            ref={securePhotoInputRef}
                            id="secure-photo-manual-input"
                            type="file"
                            accept="image/*"
                            capture="environment" // Prioritize back camera
                            onChange={handleSecurePhotoChange}
                            className="hidden"
                         />
                    </label>
                </div>
                {securePhotoPreview && (
                    <Button onClick={clearSecurePhoto} variant="outline" size="sm" className="mt-3 rounded-lg border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive">
                        <XCircle className="mr-2 h-4 w-4"/> Clear Photo
                    </Button>
                )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Button onClick={resetFlow} variant="outline" className="flex-1 py-3 rounded-lg text-base border-input hover:bg-muted">Cancel</Button>
              <Button onClick={handleSubmitManual} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Submit Manual Check-in</Button>
            </div>
          </div>
        );
      case 'geofenceWarning':
        return (
          <div className="text-center py-6 slide-in">
            <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="text-orange-500 w-12 h-12" />
            </div>
            <h4 className="font-bold text-xl text-foreground mb-2">Outside Workplace Geofence</h4>
            <p className="text-muted-foreground mb-8">It seems you're not at your designated workplace. Check-in failed.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button onClick={() => setStep('manualReason')} variant="outline" className="flex-1 py-3 rounded-lg text-base border-input hover:bg-muted">Check-in Manually</Button>
              <Button onClick={handleAllowGps} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base">Retry GPS</Button>
            </div>
             <Button onClick={() => {toast({title: "Supervisor Notified (Simulated)", description: "Your supervisor has been informed about the location mismatch."}); resetFlow();}} variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80">Notify Supervisor</Button>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-6 slide-in">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="text-green-500 w-12 h-12" />
            </div>
            <h4 className="font-bold text-xl text-foreground mb-2">Checked-in Successfully!</h4>
            <p className="text-muted-foreground mb-8">Your attendance for today has been recorded.</p>
            
            <Card className="bg-muted/30 p-4 text-left mb-6 shadow-inner rounded-xl border-input">
              <CardContent className="space-y-3 p-0">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-semibold text-foreground text-lg">{checkinTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground text-right">{checkinLocation}</span>
                </div>
                
                <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Approximate Location:</p>
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-input bg-gray-200">
                        <Image src="https://placehold.co/600x300.png" alt="Map placeholder showing general location" layout="fill" objectFit="cover" data-ai-hint="map location snippet" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <MapPin className="h-8 w-8 text-white/80" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">Map data is illustrative.</p>
                </div>

                {securePhotoPreview && (
                   <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Secure Photo Submitted:</p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-input">
                          <Image src={securePhotoPreview} alt="Secure photo submitted" layout="fill" objectFit="cover" data-ai-hint="workplace id person"/>
                      </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button onClick={resetFlow} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg text-lg">Done</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:pt-6 max-w-lg mx-auto min-h-[calc(100vh-var(--mobile-header-height)-var(--mobile-bottom-nav-height))] md:min-h-0 flex flex-col justify-center">
       <Card className="shadow-xl rounded-xl flex-grow md:flex-grow-0 flex flex-col bg-card text-card-foreground">
         <CardHeader className="border-b border-border p-4">
           <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-xl">Daily Check-in</CardTitle>
            <div className="flex items-center space-x-1.5">
                <div className={`w-3 h-3 rounded-full ${step === 'success' || (step === 'initial' && checkinTime) ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-xs text-muted-foreground">{step === 'success' || (step === 'initial' && checkinTime) ? 'Online & Verified' : 'Awaiting Check-in'}</span>
            </div>
           </div>
         </CardHeader>
         <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
            {renderStepContent()}
         </CardContent>
       </Card>
    </div>
  );
}
