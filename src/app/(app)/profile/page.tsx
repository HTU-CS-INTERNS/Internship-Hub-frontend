'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User as UserIcon, Briefcase, BookOpen, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ProfileSetupForm from '@/components/forms/profile-setup-form';
import InternshipDetailsForm from '@/components/forms/internship-details-form';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';

// Dummy data, replace with actual data from auth/context
const DUMMY_USER_DATA = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://placehold.co/150x150.png',
  faculty: 'Faculty of Information Technology',
  department: 'Software Engineering',
  internship: {
    companyName: 'Tech Solutions Inc.',
    supervisorName: 'Dr. Emily Carter',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    location: 'Remote / New York Office'
  }
};

export default function ProfilePage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole || 'STUDENT');
  }, []);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        description="View and manage your personal and internship information."
        icon={UserIcon}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Profile" }]}
      />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={DUMMY_USER_DATA.avatarUrl} alt={DUMMY_USER_DATA.name} data-ai-hint="person portrait"/>
              <AvatarFallback className="text-2xl">{getInitials(DUMMY_USER_DATA.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline">{DUMMY_USER_DATA.name}</CardTitle>
              <CardDescription className="text-base">{DUMMY_USER_DATA.email}</CardDescription>
              {userRole && <p className="text-sm text-primary">{USER_ROLES[userRole]}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)}>
            <Edit3 className="mr-2 h-4 w-4" /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingProfile ? (
            <ProfileSetupForm 
              defaultValues={{ 
                name: DUMMY_USER_DATA.name, 
                email: DUMMY_USER_DATA.email, 
                facultyId: 'F003', // Example default
                departmentId: 'D005' // Example default
              }} 
              onSuccess={() => setIsEditingProfile(false)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-foreground">Faculty:</p>
                <p className="text-muted-foreground">{DUMMY_USER_DATA.faculty}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Department:</p>
                <p className="text-muted-foreground">{DUMMY_USER_DATA.department}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {userRole === 'STUDENT' && (
        <>
          <Separator />
          <Card className="shadow-lg" id="internship">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-headline">Internship Details</CardTitle>
              </div>
              <Button variant="outline" onClick={() => setIsEditingInternship(!isEditingInternship)}>
                 <Edit3 className="mr-2 h-4 w-4" /> {isEditingInternship ? 'Cancel' : 'Edit Details'}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingInternship ? (
                <InternshipDetailsForm 
                  defaultValues={DUMMY_USER_DATA.internship}
                  onSuccess={() => setIsEditingInternship(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Company Name:</p>
                    <p className="text-muted-foreground">{DUMMY_USER_DATA.internship.companyName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Supervisor:</p>
                    <p className="text-muted-foreground">{DUMMY_USER_DATA.internship.supervisorName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Start Date:</p>
                    <p className="text-muted-foreground">{new Date(DUMMY_USER_DATA.internship.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">End Date:</p>
                    <p className="text-muted-foreground">{new Date(DUMMY_USER_DATA.internship.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-foreground">Location:</p>
                    <p className="text-muted-foreground">{DUMMY_USER_DATA.internship.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
       {/* Placeholder for other role-specific profile sections */}
      {userRole === 'LECTURER' && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Academic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Lecturer-specific profile details would go here.</p>
            {/* Example: Research areas, courses taught, etc. */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
