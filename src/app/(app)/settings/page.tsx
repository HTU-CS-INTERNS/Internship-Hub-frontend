
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Settings as SettingsIcon, Palette, Bell, ShieldCheck, UserCircle, RadioTower } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VAPID_PUBLIC_KEY = "BNoC_U9XFj_6408ZGJIfc9kRzR9NHDb5c51l_f2FqXQ10f8239F5K8Y8Y8h8h7g7g7g7g7g7g7g7g7g7g7g7g7g7g";


export default function SettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: false, 
    sms: false,
  });
  const [pushPermissionStatus, setPushPermissionStatus] = React.useState<NotificationPermission | null>(null);
  const [isPushSubscribing, setIsPushSubscribing] = React.useState(false);

  React.useEffect(() => {
    const localTheme = typeof window !== "undefined" ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
    if (localTheme) {
      setTheme(localTheme);
    }
    if ('Notification' in window) {
      setPushPermissionStatus(Notification.permission);
    }
  }, []);

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== "undefined") {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    toast({ title: 'Theme Updated', description: `Switched to ${newTheme} mode.` });
  };

  const handleNotificationChange = (type: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
    toast({ title: 'Notification Preference Updated', description: `${type.toUpperCase()} notifications ${value ? 'enabled' : 'disabled'}.` });
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      toast({ title: 'Push Not Supported', description: 'Push notifications are not supported by your browser.', variant: 'destructive' });
      return;
    }

    setIsPushSubscribing(true);
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      setPushPermissionStatus(permission);

      if (permission === 'granted') {
        toast({ title: 'Permission Granted', description: 'Subscribing to push notifications...' });
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
          console.log('User is already subscribed:', existingSubscription);
          toast({ title: 'Already Subscribed', description: 'You are already subscribed to push notifications.' });
          setNotifications(prev => ({ ...prev, push: true }));
        } else {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log('New push subscription:', subscription);
          toast({ title: 'Subscribed!', description: 'Successfully subscribed to push notifications. (Subscription logged to console)' });
          setNotifications(prev => ({ ...prev, push: true }));
        }
      } else if (permission === 'denied') {
        toast({ title: 'Permission Denied', description: 'You have blocked push notifications. Please enable them in your browser settings.', variant: 'destructive' });
      } else {
        toast({ title: 'Permission Not Granted', description: 'Push notification permission was not granted.' });
      }
    } catch (error) {
      console.error('Error during push subscription:', error);
      toast({ title: 'Subscription Error', description: 'Failed to subscribe to push notifications.', variant: 'destructive' });
    } finally {
      setIsPushSubscribing(false);
    }
  };


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Settings"
        description="Manage your InternHub account preferences and application settings."
        icon={SettingsIcon}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Settings" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> Account</CardTitle>
            <CardDescription>Manage your personal information and login credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile" passHref>
                <Button variant="outline" className="w-full rounded-lg">Edit Profile Information</Button>
            </Link>
            <Button variant="outline" className="w-full rounded-lg" onClick={() => toast({ title: 'Feature Coming Soon', description: 'Password change functionality will be available soon.'})}>Change Password</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
              <Label htmlFor="dark-mode" className="font-medium">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              More appearance settings will be available soon.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
            <CardDescription>Control how you receive updates and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
              <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
              <Switch id="email-notifications" checked={notifications.email} onCheckedChange={(val) => handleNotificationChange('email', val)} />
            </div>
            
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between space-x-2 mb-2">
                <Label htmlFor="push-notifications" className="font-medium flex items-center gap-1">
                  <RadioTower className="h-4 w-4 text-muted-foreground" /> Push Notifications
                </Label>
                <Switch id="push-notifications" checked={notifications.push} onCheckedChange={handleEnablePushNotifications} disabled={isPushSubscribing || pushPermissionStatus === 'denied' || pushPermissionStatus === 'granted'}/>
              </div>
              {pushPermissionStatus === 'granted' && !notifications.push && (
                <Button onClick={handleEnablePushNotifications} size="sm" className="w-full rounded-lg mt-1" disabled={isPushSubscribing}>
                    {isPushSubscribing ? 'Subscribing...' : 'Enable Push Notifications'}
                </Button>
              )}
              {pushPermissionStatus === 'granted' && notifications.push && (
                 <Alert variant="default" className="bg-green-500/10 border-green-500/30 mt-2">
                    <AlertTitle className="text-green-700 dark:text-green-300">Subscribed!</AlertTitle>
                    <AlertDescription className="text-xs text-green-600 dark:text-green-400">Push notifications are active.</AlertDescription>
                </Alert>
              )}
              {pushPermissionStatus === 'denied' && (
                <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Permission Denied</AlertTitle>
                    <AlertDescription className="text-xs">You have blocked push notifications. Please enable them in browser settings.</AlertDescription>
                </Alert>
              )}
               {pushPermissionStatus === 'default' && (
                <Button onClick={handleEnablePushNotifications} size="sm" className="w-full rounded-lg mt-1" disabled={isPushSubscribing}>
                    {isPushSubscribing ? 'Subscribing...' : 'Enable Push Notifications'}
                </Button>
              )}
               <p className="text-xs text-muted-foreground mt-2">
                Real-time updates directly to your device. Current status: {pushPermissionStatus || 'checking...'}
              </p>
            </div>

             <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
              <Label htmlFor="sms-notifications" className="font-medium">SMS Alerts</Label>
              <Switch id="sms-notifications" checked={notifications.sms} onCheckedChange={(val) => handleNotificationChange('sms', val)} disabled/>
            </div>
          </CardContent>
        </Card>

         <Card className="shadow-lg rounded-xl lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Privacy & Security</CardTitle>
            <CardDescription>Manage data usage and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="link" className="p-0 h-auto text-primary" onClick={() => toast({ title: 'Feature Coming Soon', description: 'Privacy policy details will be available here.'})}>View Privacy Policy</Button>
             <Separator/>
             <Button variant="link" className="p-0 h-auto text-primary" onClick={() => toast({ title: 'Feature Coming Soon', description: 'Two-factor authentication setup will be available soon.'})}>Setup Two-Factor Authentication</Button>
             <Separator/>
             <Button variant="destructive" className="w-full sm:w-auto rounded-lg" onClick={() => toast({ title: 'Feature Coming Soon', description: 'Account deactivation/deletion will be available soon.'})}>Request Account Deletion</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
