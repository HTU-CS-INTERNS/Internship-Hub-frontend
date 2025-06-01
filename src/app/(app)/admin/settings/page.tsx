
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Settings as SettingsIcon, SlidersHorizontal, Bell, ShieldCheck, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    enableSupervisorAutoInvite: true,
    defaultInternshipDurationWeeks: 16,
    maxFileSizeUploadMb: 10,
    maintenanceMode: false,
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Saving admin settings:", settings);
    toast({
        title: "System Settings Saved!",
        description: "University-wide internship program settings have been updated.",
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="System Settings"
        description="Configure global parameters for the InternshipTrack platform."
        icon={SettingsIcon}
        breadcrumbs={[
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "System Settings" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Internship Program Configuration</CardTitle>
          <CardDescription>
            Define global rules and defaults for the internship program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-input">
              <div>
                <Label htmlFor="auto-invite-supervisor" className="font-medium text-foreground">Enable Automatic Supervisor Invitations</Label>
                <p className="text-xs text-muted-foreground">Automatically send signup invitations to supervisors upon HOD approval of placement.</p>
              </div>
              <Switch id="auto-invite-supervisor" checked={settings.enableSupervisorAutoInvite} onCheckedChange={(val) => handleSettingChange('enableSupervisorAutoInvite', val)} />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="default-duration" className="font-medium text-foreground">Default Internship Duration (Weeks)</Label>
                <Input 
                    id="default-duration" 
                    type="number" 
                    value={settings.defaultInternshipDurationWeeks} 
                    onChange={(e) => handleSettingChange('defaultInternshipDurationWeeks', parseInt(e.target.value))} 
                    className="rounded-lg max-w-xs"
                    min="4"
                    max="52"
                />
                <p className="text-xs text-muted-foreground">This can be overridden at faculty/department level if needed.</p>
            </div>

             <div className="space-y-2">
                <Label htmlFor="max-filesize" className="font-medium text-foreground">Max Attachment File Size (MB)</Label>
                <Input 
                    id="max-filesize" 
                    type="number" 
                    value={settings.maxFileSizeUploadMb} 
                    onChange={(e) => handleSettingChange('maxFileSizeUploadMb', parseInt(e.target.value))} 
                    className="rounded-lg max-w-xs"
                    min="1"
                    max="50"
                />
                <p className="text-xs text-muted-foreground">Maximum size for individual file uploads (reports, tasks).</p>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button onClick={handleSaveChanges} className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                Save System Settings
            </Button>
        </CardFooter>
      </Card>

       <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Security & Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-input">
              <div>
                <Label htmlFor="maintenance-mode" className="font-medium text-foreground">Enable Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Temporarily restrict access for non-admin users for system updates.</p>
              </div>
              <Switch id="maintenance-mode" checked={settings.maintenanceMode} onCheckedChange={(val) => handleSettingChange('maintenanceMode', val)} />
            </div>
             <Button variant="outline" className="rounded-lg" onClick={() => toast({ title: "Feature Placeholder", description: "Audit logs would be displayed here."})}>
                View System Audit Logs
             </Button>
             <Button variant="outline" className="rounded-lg" onClick={() => toast({ title: "Feature Placeholder", description: "API key management would be here."})}>
                <KeyRound className="mr-2 h-4 w-4"/> Manage API Keys
             </Button>
        </CardContent>
      </Card>
    </div>
  );
}
