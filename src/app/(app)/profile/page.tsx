
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User as UserIcon, Briefcase, BookOpen, Edit3, GraduationCap, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ProfileSetupForm from '@/components/forms/profile-setup-form';
import InternshipDetailsForm from '@/components/forms/internship-details-form';
import type { UserRole } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function ProfilePage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);
  
  // User data state, to be populated from localStorage or API
  const [userData, setUserData] = React.useState({
    name: 'User',
    email: 'user@example.com',
    avatarUrl: '',
    faculty: '',
    department: '',
    internship: {
      companyName: '',
      supervisorName: '',
      supervisorEmail: '',
      startDate: '',
      endDate: '',
      location: ''
    }
  });

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : 'STUDENT';
    setUserRole(storedRole);

    const storedName = typeof window !== "undefined" ? localStorage.getItem('userName') || 'New User' : 'New User';
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'email@example.com' : 'email@example.com';
    // In a real app, faculty/department would be fetched or stored more robustly
    const storedFaculty = typeof window !== "undefined" ? localStorage.getItem('userFaculty') || 'Not Set' : 'Not Set';
    const storedDepartment = typeof window !== "undefined" ? localStorage.getItem('userDepartment') || 'Not Set' : 'Not Set';

    setUserData(prev => ({
        ...prev, // Keep internship details if already set from a previous edit this session
        name: storedName,
        email: storedEmail,
        avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(storedName)}`,
        faculty: storedFaculty,
        department: storedDepartment,
    }));
    
    // If it's the first time after registration, forms might be open by default
    // For this example, we assume they are closed initially.
    // You might want to set setIsEditingProfile(true) if faculty/department is 'Not Set'
    if (storedFaculty === 'Not Set' || storedDepartment === 'Not Set') {
        setIsEditingProfile(true);
    }

  }, []);
  
  const handleProfileSaveSuccess = (updatedProfileData: any) => {
    setUserData(prev => ({
      ...prev,
      name: updatedProfileData.name,
      email: updatedProfileData.email,
      faculty: FACULTIES.find(f => f.id === updatedProfileData.facultyId)?.name || prev.faculty,
      department: DEPARTMENTS.find(d => d.id === updatedProfileData.departmentId)?.name || prev.department,
      avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(updatedProfileData.name)}`,
    }));
    // Persist to localStorage (simulating backend)
    if (typeof window !== "undefined") {
        localStorage.setItem('userName', updatedProfileData.name);
        localStorage.setItem('userEmail', updatedProfileData.email);
        localStorage.setItem('userFaculty', FACULTIES.find(f => f.id === updatedProfileData.facultyId)?.name || '');
        localStorage.setItem('userDepartment', DEPARTMENTS.find(d => d.id === updatedProfileData.departmentId)?.name || '');
    }
    setIsEditingProfile(false);
  };

  const handleInternshipSaveSuccess = (updatedInternshipData: any) => {
    setUserData(prev => ({
        ...prev,
        internship: {
            ...updatedInternshipData,
            startDate: updatedInternshipData.startDate instanceof Date ? updatedInternshipData.startDate.toISOString().split('T')[0] : updatedInternshipData.startDate,
            endDate: updatedInternshipData.endDate instanceof Date ? updatedInternshipData.endDate.toISOString().split('T')[0] : updatedInternshipData.endDate,
        }
    }));
    // TODO: Persist internship details to localStorage or backend
    setIsEditingInternship(false);
  };


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Profile"
        description="View and manage your personal and internship information."
        icon={UserIcon}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Profile" }]}
      />

      <Card className="shadow-xl rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint="person portrait"/>
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">{getInitials(userData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline">{userData.name}</CardTitle>
              <CardDescription className="text-base">{userData.email}</CardDescription>
              {userRole && <p className="text-sm text-primary font-medium">{USER_ROLES[userRole]}</p>}
            </div>
          </div>
          {!isEditingInternship && ( // Hide profile edit button if internship edit is active
            <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
              <Edit3 className="mr-2 h-4 w-4" /> {isEditingProfile ? 'Cancel Profile Edit' : 'Edit Profile'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditingProfile ? (
            <ProfileSetupForm 
              defaultValues={{ 
                name: userData.name, 
                email: userData.email, 
                facultyId: FACULTIES.find(f => f.name === userData.faculty)?.id || '',
                departmentId: DEPARTMENTS.find(d => d.name === userData.department)?.id || '',
              }} 
              onSuccess={handleProfileSaveSuccess} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Faculty:</p>
                    <p className="text-muted-foreground">{userData.faculty || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Department:</p>
                    <p className="text-muted-foreground">{userData.department || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {userRole === 'STUDENT' && (
        <>
          <Separator className="my-8" />
          <Card className="shadow-xl rounded-xl" id="internship">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-headline">Internship Details</CardTitle>
              </div>
               {!isEditingProfile && ( // Hide internship edit button if profile edit is active
                <Button variant="outline" onClick={() => setIsEditingInternship(!isEditingInternship)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    <Edit3 className="mr-2 h-4 w-4" /> {isEditingInternship ? 'Cancel Internship Edit' : 'Edit Internship'}
                </Button>
               )}
            </CardHeader>
            <CardContent className="p-6">
              {isEditingInternship ? (
                <InternshipDetailsForm 
                  defaultValues={userData.internship}
                  onSuccess={handleInternshipSaveSuccess}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Company Name:</p>
                    <p className="text-muted-foreground">{userData.internship.companyName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Supervisor Name:</p>
                    <p className="text-muted-foreground">{userData.internship.supervisorName || 'Not set'}</p>
                  </div>
                   <div>
                    <p className="font-medium text-foreground">Supervisor Email:</p>
                    <p className="text-muted-foreground">{userData.internship.supervisorEmail || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Start Date:</p>
                    <p className="text-muted-foreground">{userData.internship.startDate ? new Date(userData.internship.startDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">End Date:</p>
                    <p className="text-muted-foreground">{userData.internship.endDate ? new Date(userData.internship.endDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-foreground">Location:</p>
                    <p className="text-muted-foreground">{userData.internship.location || 'Not set'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {/* Add sections for LECTURER, HOD, etc. based on userRole if needed, similar to STUDENT */}
      {userRole !== 'STUDENT' && userRole !== null && (
         <Card className="shadow-xl rounded-xl">
          <CardHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Role-Specific Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Details specific to your role as a {USER_ROLES[userRole]} would appear here.
              (e.g., For Lecturers: courses supervised, research interests. For HODs: departmental responsibilities.)
              This section is currently a placeholder.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    