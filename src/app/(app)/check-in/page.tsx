
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, LocateFixed, AlertTriangle, CheckCircle, Camera, XCircle, Info, TrendingUp, Clock, CalendarCheck2 } from 'lucide-react';
import Image from 'next/image'; // Using Next.js Image
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 

type CheckinStep = 'initial' | 'gpsPrompt' | 'manualReason' | 'geofenceWarning' | 'success';

interface StoredCheckinData {
  time: string;
  location: string;
  date: string; // YYYY-MM-DD
  photoPreview?: string | null;
}

export default function CheckInPage() {
  const [step, setStep] = React.useState<CheckinStep>('initial');
  const [manualReason, setManualReason] = React.useState('');
  const [checkinTime, setCheckinTime] = React.useState('');
  const [checkinLocation, setCheckinLocation] = React.useState('');
  const [securePhotoFile, setSecurePhotoFile] = React.useState<File | null>(null);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(null);
  const securePhotoInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getTodayDateString = React.useCallback(() => format(new Date(), 'yyyy-MM-dd'), []);

  const loadCheckinFromStorage = React.useCallback(() => {
    const todayDateStr = getTodayDateString();
    const storedCheckinRaw = typeof window !== "undefined" ? localStorage.getItem('internshipTrack_checkin') : null;
    if (storedCheckinRaw) {
      try {
        const storedCheckin: StoredCheckinData = JSON.parse(storedCheckinRaw);
        if (storedCheckin.date === todayDateStr) {
          setCheckinTime(storedCheckin.time);
          setCheckinLocation(storedCheckin.location);
          setSecurePhotoPreview(storedCheckin.photoPreview || null);
          setStep('success');
          return true; 
        } else {
          localStorage.removeItem('internshipTrack_checkin'); 
        }
      } catch (e) {
        console.error("Failed to parse stored check-in data", e);
        localStorage.removeItem('internshipTrack_checkin');
      }
    }
    return false; 
  }, [getTodayDateString]);

  React.useEffect(() => {
    if (!loadCheckinFromStorage()) {
      setStep('initial'); 
    }
  }, [loadCheckinFromStorage]);

  const saveCheckinToLocalStorage = (time: string, location: string, photoPreviewUrl?: string | null) => {
    const todayDateStr = getTodayDateString();
    const checkinData: StoredCheckinData = { time, location, date: todayDateStr, photoPreview: photoPreviewUrl };
    localStorage.setItem('internshipTrack_checkin', JSON.stringify(checkinData));
  };

  const resetFlowAndCheckStorage = () => {
    setManualReason('');
    setSecurePhotoFile(null);
    
    if (securePhotoInputRef.current) {
      securePhotoInputRef.current.value = "";
    }

    if (!loadCheckinFromStorage()) { 
      setStep('initial');
      setSecurePhotoPreview(null); 
    }
  };

  const handleCheckIn = () => setStep('gpsPrompt');

  const handleAllowGps = async () => {
    toast({ title: 'Requesting Location', description: 'Please wait...' });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const withinGeofence = Math.random() < 0.8; 

      if (withinGeofence) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const currentLocation = 'Acme Corp HQ (Verified)';
        setCheckinTime(currentTime);
        setCheckinLocation(currentLocation);
        saveCheckinToLocalStorage(currentTime, currentLocation, securePhotoPreview); 
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

  const handleDenyGps = () => setStep('manualReason');

  const handleSubmitManual = () => {
    if (!manualReason.trim() && !securePhotoFile) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a reason or a secure photo for manual check-in.' });
      return;
    }
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentLocation = `Manual: ${manualReason.substring(0, 30) || 'Photo Submitted'}`;
    setCheckinTime(currentTime);
    setCheckinLocation(currentLocation);
    saveCheckinToLocalStorage(currentTime, currentLocation, securePhotoPreview);
    setStep('success');
    toast({ title: 'Manual Check-in Submitted', description: 'Your check-in reason has been recorded.' });
  };
  
  const handleSecurePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSecurePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecurePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSecurePhoto = () => {
    setSecurePhotoFile(null);
    setSecurePhotoPreview(null);
    if (securePhotoInputRef.current) {
      securePhotoInputRef.current.value = "";
    }
  };

  const AnalyticsStatCard: React.FC<{title: string, value: string, icon: React.ElementType, description?: string, iconBgColor?: string}> = 
    ({ title, value, icon: Icon, description, iconBgColor = 'bg-primary/10' }) => (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

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
                             <Image src={securePhotoPreview} alt="Secure photo preview" layout="fill" objectFit="contain" data-ai-hint="workplace person" />
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
                            capture="environment" 
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
              <Button onClick={resetFlowAndCheckStorage} variant="outline" className="flex-1 py-3 rounded-lg text-base border-input hover:bg-muted">Cancel</Button>
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
             <Button onClick={() => {toast({title: "Supervisor Notified (Simulated)", description: "Your supervisor has been informed."}); resetFlowAndCheckStorage();}} variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80">Notify Supervisor</Button>
          </div>
        );
      case 'success':
        return (
          <div className="py-6 slide-in space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-500 w-12 h-12" />
              </div>
              <h4 className="font-bold text-xl text-foreground mb-1">Checked-in Successfully!</h4>
              <p className="text-muted-foreground mb-6">Your attendance for {format(new Date(getTodayDateString()), "PPP")} is recorded.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Card className="bg-muted/30 p-4 text-left shadow-inner rounded-xl border-input">
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
                                <Image src="https://placehold.co/600x300.png" alt="Map placeholder" layout="fill" objectFit="cover" data-ai-hint="map location snippet" />
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
                                <Image src={securePhotoPreview} alt="Secure photo submitted" layout="fill" objectFit="cover" data-ai-hint="workplace id person" />
                            </div>
                        </div>
                        )}
                    </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-4">
                    <AnalyticsStatCard title="Check-in Streak" value="5 Days" icon={TrendingUp} description="Consecutive daily check-ins" iconBgColor="bg-green-500/10"/>
                    <AnalyticsStatCard title="Punctuality" value="92%" icon={Clock} description="On-time check-in rate" iconBgColor="bg-blue-500/10"/>
                    <AnalyticsStatCard title="Monthly Check-ins" value="18" icon={CalendarCheck2} description={`In ${format(new Date(), 'MMMM')}`} iconBgColor="bg-purple-500/10"/>
                </div>
            </div>

            <Button onClick={resetFlowAndCheckStorage} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg text-lg mt-2">
              Done
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6"> 
       <Card className={cn(
           "w-full mx-auto shadow-xl rounded-xl flex flex-col bg-card text-card-foreground",
           step === 'success' ? 'md:max-w-3xl lg:max-w-4xl' : 'max-w-lg' 
         )}>
         <CardHeader className="border-b border-border p-4">
           <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-xl">Daily Check-in</CardTitle>
            <div className="flex items-center space-x-1.5">
                <div className={cn("w-3 h-3 rounded-full", step === 'success' ? 'bg-green-500 animate-pulse' : 'bg-muted')}></div>
                <span className="text-xs text-muted-foreground">{step === 'success' ? 'Checked In' : 'Awaiting Check-in'}</span>
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

