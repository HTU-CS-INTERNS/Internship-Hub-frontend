
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Settings, CheckCircle, SlidersHorizontal, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    autoApproveLowRiskPlacements: false,
    minInternshipDurationWeeks: 12,
    customWelcomeMessage: "Welcome to the internship program for our department! We're excited to have you.",
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    // Simulate saving to backend/localStorage
    console.log("Saving department settings:", settings);
    toast({
        title: "Settings Saved!",
        description: "Departmental internship settings have been updated.",
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Departmental Settings"
        description="Configure internship program parameters, guidelines, and criteria specific to your department."
        icon={Settings}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/department-ops", label: "Department Ops" },
          { label: "Department Settings" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Program Configuration</CardTitle>
          <CardDescription>
            Define rules and defaults for the internship program within your department.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-input">
              <div>
                <Label htmlFor="auto-approve" className="font-medium text-foreground">Auto-approve Low-Risk Placements</Label>
                <p className="text-xs text-muted-foreground">Automatically approve placements from pre-vetted companies.</p>
              </div>
              <Switch id="auto-approve" checked={settings.autoApproveLowRiskPlacements} onCheckedChange={(val) => handleSettingChange('autoApproveLowRiskPlacements', val)} />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="min-duration" className="font-medium text-foreground">Minimum Internship Duration (Weeks)</Label>
                <Input 
                    id="min-duration" 
                    type="number" 
                    value={settings.minInternshipDurationWeeks} 
                    onChange={(e) => handleSettingChange('minInternshipDurationWeeks', parseInt(e.target.value))} 
                    className="rounded-lg max-w-xs"
                    min="4"
                    max="52"
                />
                <p className="text-xs text-muted-foreground">Set the minimum required duration for internships.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="welcome-message" className="font-medium text-foreground">Custom Departmental Welcome Message</Label>
                <Textarea 
                    id="welcome-message" 
                    placeholder="Enter a custom welcome message for students in your department..." 
                    value={settings.customWelcomeMessage}
                    onChange={(e) => handleSettingChange('customWelcomeMessage', e.target.value)}
                    rows={4}
                    className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">This message might be shown to students during onboarding or on their dashboard.</p>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button onClick={handleSaveChanges} className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <CheckCircle className="mr-2 h-4 w-4" /> Save Department Settings
            </Button>
        </CardFooter>
      </Card>

       <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary" /> Workflow Customization (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future settings will allow for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
            <li>Defining mandatory report fields or templates.</li>
            <li>Setting up automated reminders for deadlines.</li>
            <li>Configuring evaluation criteria specific to departmental needs.</li>
            <li>Managing a list of approved/partner companies.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
