
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User as UserIcon, Briefcase, BookOpen, Edit3, GraduationCap, Building, Phone as PhoneIcon, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ProfileSetupForm from '@/components/forms/profile-setup-form';
import InternshipDetailsForm from '@/components/forms/internship-details-form';
import type { UserRole, InternshipDetails, InternshipStatus } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { useRouter } from 'next/navigation'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const statusAlertColors: Record<InternshipStatus, { bg: string, border: string, iconColor: string, icon: React.ElementType }> = {
    PENDING_APPROVAL: { bg: "bg-yellow-500/10", border: "border-yellow-500/50", iconColor: "text-yellow-600", icon: Clock },
    APPROVED: { bg: "bg-green-500/10", border: "border-green-500/50", iconColor: "text-green-600", icon: CheckCircle },
    REJECTED: { bg: "bg-destructive/10", border: "border-destructive/50", iconColor: "text-destructive", icon: AlertTriangle },
    NOT_SUBMITTED: { bg: "bg-blue-500/10", border: "border-blue-500/50", iconColor: "text-blue-600", icon: Edit3 },
};


export default function ProfilePage() {
  const router = useRouter(); 
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);
  
  const [userData, setUserData] = React.useState<{
    name: string;
    email: string;
    avatarUrl: string;
    facultyId: string;
    facultyName: string;
    departmentId: string;
    departmentName: string;
    contactNumber: string;
    internship: InternshipDetails;
  }>({
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
      location: '',
      status: 'NOT_SUBMITTED',
      rejectionReason: '',
    }
  });

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : 'STUDENT';
    setUserRole(storedRole);

    const storedName = typeof window !== "undefined" ? localStorage.getItem('userName') || 'New User' : 'New User';
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'email@example.com' : 'email@example.com';
    const storedFacultyId = typeof window !== "undefined" ? localStorage.getItem('userFacultyId') || '' : '';
    const storedDepartmentId = typeof window !== "undefined" ? localStorage.getItem('userDepartmentId') || '' : '';
    const storedContactNumber = typeof window !== "undefined" ? localStorage.getItem('userContactNumber') || '' : '';

    let storedInternship: InternshipDetails = {
        companyName: '', companyAddress: '', supervisorName: '', supervisorEmail: '',
        startDate: '', endDate: '', location: '', status: 'NOT_SUBMITTED', rejectionReason: ''
    };
    const storedInternshipString = typeof window !== "undefined" ? localStorage.getItem('userInternshipDetails') : null;
    if (storedInternshipString) {
        try {
            const parsed = JSON.parse(storedInternshipString);
            // Ensure all fields, including status, are present
            storedInternship = { ...storedInternship, ...parsed }; 
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

    if (storedRole === 'STUDENT' && !onboardingComplete) {
        if (!storedFacultyId || !storedDepartmentId || storedFacultyId === 'Not Set' || storedDepartmentId === 'Not Set' || !storedName || storedName === 'New User' || !storedEmail) {
            setIsEditingProfile(true);
            setIsEditingInternship(false);
        } else if (storedInternship.status === 'NOT_SUBMITTED' || storedInternship.status === 'REJECTED') {
             setIsEditingProfile(false); 
             setIsEditingInternship(true);
        } else if (storedInternship.status === 'APPROVED') {
            localStorage.setItem('onboardingComplete', 'true');
            setIsEditingProfile(false);
            setIsEditingInternship(false);
        }
    }

  }, []);
  
  const handleProfileSaveSuccess = (updatedProfileData: any) => {
    const faculty = FACULTIES.find(f => f.id === updatedProfileData.facultyId);
    const department = DEPARTMENTS.find(d => d.id === updatedProfileData.departmentId && d.facultyId === updatedProfileData.facultyId);

    const newUserData = {
      ...userData,
      name: updatedProfileData.name,
      email: updatedProfileData.email,
      facultyId: faculty?.id || '',
      facultyName: faculty?.name || 'Not Set',
      departmentId: department?.id || '',
      departmentName: department?.name || 'Not Set',
      contactNumber: updatedProfileData.contactNumber || '',
      avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(updatedProfileData.name)}`,
    };
    setUserData(newUserData);
    
    if (typeof window !== "undefined") {
        localStorage.setItem('userName', newUserData.name);
        localStorage.setItem('userEmail', newUserData.email);
        localStorage.setItem('userFacultyId', newUserData.facultyId);
        localStorage.setItem('userDepartmentId', newUserData.departmentId);
        localStorage.setItem('userContactNumber', newUserData.contactNumber);
    }
    setIsEditingProfile(false);
    
    // If internship details are not submitted or rejected, open that form next
    if (userRole === 'STUDENT' && (userData.internship.status === 'NOT_SUBMITTED' || userData.internship.status === 'REJECTED')) {
        setIsEditingInternship(true);
    } else if (userRole === 'STUDENT' && userData.internship.status === 'APPROVED') {
        localStorage.setItem('onboardingComplete', 'true');
    }
  };

  const handleInternshipSaveSuccess = (updatedInternshipData: InternshipDetails) => {
    const newInternshipData = {
        ...updatedInternshipData,
        startDate: updatedInternshipData.startDate instanceof Date ? updatedInternshipData.startDate.toISOString().split('T')[0] : updatedInternshipData.startDate,
        endDate: updatedInternshipData.endDate instanceof Date ? updatedInternshipData.endDate.toISOString().split('T')[0] : updatedInternshipData.endDate,
    };
    setUserData(prev => ({
        ...prev,
        internship: newInternshipData
    }));

    if (typeof window !== "undefined") {
        localStorage.setItem('userInternshipDetails', JSON.stringify(newInternshipData));
        if (newInternshipData.status === 'APPROVED') {
            localStorage.setItem('onboardingComplete', 'true');
            router.push('/dashboard'); 
        } else if (newInternshipData.status === 'PENDING_APPROVAL') {
             localStorage.removeItem('onboardingComplete'); // Not fully onboarded yet
             // Optionally redirect or stay, for now stay to show pending status.
             // router.push('/dashboard'); // Or keep on profile to see status.
        }
    }
    setIsEditingInternship(false);
  };

  const currentInternshipStatus = userData.internship.status;
  const StatusIcon = statusAlertColors[currentInternshipStatus]?.icon || Edit3;

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
          {!isEditingInternship && !isEditingProfile && currentInternshipStatus !== 'PENDING_APPROVAL' && (
            <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
          {isEditingProfile && (
             <Button variant="outline" onClick={() => { 
                 setIsEditingProfile(false); 
                 if (userRole === 'STUDENT' && (userData.internship.status === 'NOT_SUBMITTED' || userData.internship.status === 'REJECTED')) {
                    setIsEditingInternship(true);
                 }
                }} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-headline">Internship Details</CardTitle>
              </div>
               {!isEditingProfile && !isEditingInternship && currentInternshipStatus !== 'PENDING_APPROVAL' && (
                <Button variant="outline" onClick={() => setIsEditingInternship(true)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    <Edit3 className="mr-2 h-4 w-4" /> 
                    {currentInternshipStatus === 'REJECTED' || currentInternshipStatus === 'NOT_SUBMITTED' ? 'Enter/Update Details' : 'Edit Internship'}
                </Button>
               )}
               {isEditingInternship && (
                <Button variant="outline" onClick={() => setIsEditingInternship(false)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    Cancel Edit
                </Button>
               )}
            </CardHeader>
            <CardContent className="p-6">
              {currentInternshipStatus !== 'NOT_SUBMITTED' && !isEditingInternship && (
                <Alert className={cn("mb-6", statusAlertColors[currentInternshipStatus]?.bg, statusAlertColors[currentInternshipStatus]?.border)}>
                    <StatusIcon className={cn("h-5 w-5", statusAlertColors[currentInternshipStatus]?.iconColor)} />
                    <AlertTitle className={cn("font-semibold", statusAlertColors[currentInternshipStatus]?.iconColor)}>
                        {currentInternshipStatus.replace('_', ' ').toUpperCase()}
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        {currentInternshipStatus === 'PENDING_APPROVAL' && "Your internship details are currently awaiting review by the administration."}
                        {currentInternshipStatus === 'APPROVED' && "Your internship details have been approved! You are all set."}
                        {currentInternshipStatus === 'REJECTED' && `Your internship details were rejected. ${userData.internship.rejectionReason ? `Reason: ${userData.internship.rejectionReason}. ` : ''}Please update and resubmit.`}
                    </AlertDescription>
                </Alert>
              )}

              {isEditingInternship ? (
                <InternshipDetailsForm 
                  defaultValues={userData.internship}
                  onSuccess={handleInternshipSaveSuccess}
                  isResubmitting={currentInternshipStatus === 'REJECTED'}
                />
              ) : currentInternshipStatus !== 'NOT_SUBMITTED' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Company Name:</p>
                    <p className="text-muted-foreground">{userData.internship.companyName || 'N/A'}</p>
                  </div>
                   <div>
                    <p className="font-medium text-foreground">Company Address:</p>
                    <p className="text-muted-foreground">{userData.internship.companyAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Supervisor Name:</p>
                    <p className="text-muted-foreground">{userData.internship.supervisorName || 'N/A'}</p>
                  </div>
                   <div>
                    <p className="font-medium text-foreground">Supervisor Email:</p>
                    <p className="text-muted-foreground">{userData.internship.supervisorEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Start Date:</p>
                    <p className="text-muted-foreground">{userData.internship.startDate ? format(parseISO(userData.internship.startDate), "PPP") : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">End Date:</p>
                    <p className="text-muted-foreground">{userData.internship.endDate ? format(parseISO(userData.internship.endDate), "PPP") : 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-foreground">Location/Work Arrangement:</p>
                    <p className="text-muted-foreground">{userData.internship.location || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-semibold text-foreground">Internship Details Not Submitted</p>
                    <p className="text-muted-foreground mb-4">Please add your internship placement information.</p>
                    <Button onClick={() => setIsEditingInternship(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                        Add Internship Details
                    </Button>
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
