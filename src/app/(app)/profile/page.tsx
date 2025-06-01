
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User as UserIcon, Briefcase, BookOpen, Edit3, GraduationCap, Building, Phone as PhoneIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ProfileSetupForm from '@/components/forms/profile-setup-form';
import InternshipDetailsForm from '@/components/forms/internship-details-form';
import type { UserRole, InternshipDetails } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { useRouter } from 'next/navigation'; // Import useRouter

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function ProfilePage() {
  const router = useRouter(); // Initialize useRouter
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);
  
  const [userData, setUserData] = React.useState({
    name: 'User',
    email: 'user@example.com',
    avatarUrl: '',
    facultyId: '',
    facultyName: 'Not Set',
    departmentId: '',
    departmentName: 'Not Set',
    contactNumber: '',
    internship: {
      companyName: '',
      companyAddress: '',
      supervisorName: '',
      supervisorEmail: '',
      startDate: '',
      endDate: '',
      location: ''
    } as InternshipDetails & { companyAddress?: string }
  });

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : 'STUDENT';
    setUserRole(storedRole);

    const storedName = typeof window !== "undefined" ? localStorage.getItem('userName') || 'New User' : 'New User';
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'email@example.com' : 'email@example.com';
    const storedFacultyId = typeof window !== "undefined" ? localStorage.getItem('userFacultyId') || '' : '';
    const storedDepartmentId = typeof window !== "undefined" ? localStorage.getItem('userDepartmentId') || '' : '';
    const storedContactNumber = typeof window !== "undefined" ? localStorage.getItem('userContactNumber') || '' : '';

    // Load internship details from localStorage (simulated)
    const storedInternshipString = typeof window !== "undefined" ? localStorage.getItem('userInternshipDetails') : null;
    let storedInternship = userData.internship;
    if (storedInternshipString) {
        try {
            storedInternship = JSON.parse(storedInternshipString);
        } catch (e) { console.error("Error parsing internship details from localStorage", e); }
    }
    
    setUserData(prev => ({
        ...prev,
        name: storedName,
        email: storedEmail,
        avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(storedName)}`,
        facultyId: storedFacultyId,
        facultyName: FACULTIES.find(f => f.id === storedFacultyId)?.name || 'Not Set',
        departmentId: storedDepartmentId,
        departmentName: DEPARTMENTS.find(d => d.id === storedDepartmentId && d.facultyId === storedFacultyId)?.name || 'Not Set',
        contactNumber: storedContactNumber,
        internship: storedInternship,
    }));
    
    const onboardingComplete = typeof window !== "undefined" ? localStorage.getItem('onboardingComplete') === 'true' : false;

    if (!onboardingComplete) {
        if (!storedFacultyId || !storedDepartmentId || storedFacultyId === 'Not Set' || storedDepartmentId === 'Not Set' || !storedName || !storedEmail ) {
            setIsEditingProfile(true);
        } else if (!storedInternship.companyName) { // If profile is good, check internship
             setIsEditingProfile(false); // Ensure profile form is closed
             setIsEditingInternship(true);
        }
    }

  }, []);
  
  const handleProfileSaveSuccess = (updatedProfileData: any) => {
    const faculty = FACULTIES.find(f => f.id === updatedProfileData.facultyId);
    const department = DEPARTMENTS.find(d => d.id === updatedProfileData.departmentId && d.facultyId === updatedProfileData.facultyId);

    setUserData(prev => ({
      ...prev,
      name: updatedProfileData.name,
      email: updatedProfileData.email,
      facultyId: faculty?.id || '',
      facultyName: faculty?.name || 'Not Set',
      departmentId: department?.id || '',
      departmentName: department?.name || 'Not Set',
      contactNumber: updatedProfileData.contactNumber || '',
      avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(updatedProfileData.name)}`,
    }));
    
    if (typeof window !== "undefined") {
        localStorage.setItem('userName', updatedProfileData.name);
        localStorage.setItem('userEmail', updatedProfileData.email);
        localStorage.setItem('userFacultyId', faculty?.id || '');
        localStorage.setItem('userDepartmentId', department?.id || '');
        localStorage.setItem('userContactNumber', updatedProfileData.contactNumber || '');
    }
    setIsEditingProfile(false);
    // If internship details are not filled, open that form next
    if (!userData.internship.companyName) {
        setIsEditingInternship(true);
    }
  };

  const handleInternshipSaveSuccess = (updatedInternshipData: InternshipDetails & { companyAddress?: string }) => {
    setUserData(prev => ({
        ...prev,
        internship: {
            ...updatedInternshipData,
            startDate: updatedInternshipData.startDate instanceof Date ? updatedInternshipData.startDate.toISOString().split('T')[0] : updatedInternshipData.startDate,
            endDate: updatedInternshipData.endDate instanceof Date ? updatedInternshipData.endDate.toISOString().split('T')[0] : updatedInternshipData.endDate,
        }
    }));
    if (typeof window !== "undefined") {
        localStorage.setItem('userInternshipDetails', JSON.stringify(updatedInternshipData));
        localStorage.setItem('onboardingComplete', 'true');
    }
    setIsEditingInternship(false);
    router.push('/dashboard'); // Redirect to dashboard after onboarding is complete
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
          {!isEditingInternship && !isEditingProfile && (
            <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
          {isEditingProfile && (
             <Button variant="outline" onClick={() => { setIsEditingProfile(false); if (!userData.internship.companyName && localStorage.getItem('onboardingComplete') !== 'true') setIsEditingInternship(true);}} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
              Cancel Profile Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditingProfile ? (
            <ProfileSetupForm 
              defaultValues={{ 
                name: userData.name, 
                email: userData.email, 
                facultyId: userData.facultyId,
                departmentId: userData.departmentId,
                contactNumber: userData.contactNumber,
              }} 
              onSuccess={handleProfileSaveSuccess} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Faculty:</p>
                    <p className="text-muted-foreground">{userData.facultyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Department:</p>
                    <p className="text-muted-foreground">{userData.departmentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Contact Number:</p>
                    <p className="text-muted-foreground">{userData.contactNumber || 'Not set'}</p>
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
               {!isEditingProfile && !isEditingInternship && (
                <Button variant="outline" onClick={() => setIsEditingInternship(true)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Internship
                </Button>
               )}
               {isEditingInternship && (
                <Button variant="outline" onClick={() => setIsEditingInternship(false)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    Cancel Internship Edit
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
                    <p className="font-medium text-foreground">Company Address:</p>
                    <p className="text-muted-foreground">{userData.internship.companyAddress || 'Not set'}</p>
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
                    <p className="font-medium text-foreground">Location/Work Arrangement:</p>
                    <p className="text-muted-foreground">{userData.internship.location || 'Not set'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
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
             {isEditingProfile && <p className="mt-4 text-sm text-destructive">Please save your profile information first to proceed.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
