
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Settings as SettingsIcon, Palette, Bell, ShieldCheck, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: false,
    sms: false,
  });

  React.useEffect(() => {
    const localTheme = typeof window !== "undefined" ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
    if (localTheme) {
      setTheme(localTheme);
    }
    // Load notification preferences from localStorage or API if available
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

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings."
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
            <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
              <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
              <Switch id="push-notifications" checked={notifications.push} onCheckedChange={(val) => handleNotificationChange('push', val)} />
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

    