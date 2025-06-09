
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User as UserIcon, Briefcase, BookOpen, Edit3, GraduationCap, Building, Phone as PhoneIcon, AlertTriangle, CheckCircle, Clock, Landmark, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ProfileSetupForm from '@/components/forms/profile-setup-form';
import InternshipDetailsForm from '@/components/forms/internship-details-form';
import type { UserRole, InternshipDetails, InternshipStatus, ProfileFormValues } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { useRouter } from 'next/navigation'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
// Removed Firebase imports: auth, db, doc, getDoc, DocumentData

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const statusAlertColors: Record<InternshipStatus, { bg: string, border: string, iconColor: string, icon: React.ElementType }> = {
    PENDING_APPROVAL: { bg: "bg-yellow-500/10 dark:bg-yellow-800/30", border: "border-yellow-500/50 dark:border-yellow-700/50", iconColor: "text-yellow-600 dark:text-yellow-400", icon: Clock },
    APPROVED: { bg: "bg-green-500/10 dark:bg-green-800/30", border: "border-green-500/50 dark:border-green-700/50", iconColor: "text-green-600 dark:text-green-400", icon: CheckCircle },
    REJECTED: { bg: "bg-destructive/10 dark:bg-destructive/30", border: "border-destructive/50 dark:border-destructive/70", iconColor: "text-destructive dark:text-red-400", icon: AlertTriangle },
    NOT_SUBMITTED: { bg: "bg-blue-500/10 dark:bg-blue-800/30", border: "border-blue-500/50 dark:border-blue-700/50", iconColor: "text-blue-600 dark:text-blue-400", icon: Edit3 },
};

export default function ProfilePage() {
  const router = useRouter(); 
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  
  const [userData, setUserData] = React.useState<ProfileFormValues & {
    avatarUrl: string;
    facultyName: string;
    departmentName: string;
    internship: InternshipDetails;
  }>({
    name: '', 
    email: '',
    avatarUrl: '',
    facultyId: '',
    facultyName: '',
    departmentName: '',
    contactNumber: '',
    supervisorCompanyName: '',
    supervisorCompanyAddress: '',
    internship: {
      companyName: '', companyAddress: '', supervisorName: '', supervisorEmail: '',
      startDate: '', endDate: '', location: '', status: 'NOT_SUBMITTED', rejectionReason: ''
    }
  });

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setProfileError(null);
      const storedRoleFromAuth = localStorage.getItem('userRole') as UserRole | null;
      setUserRole(storedRoleFromAuth);

      if (!storedRoleFromAuth || localStorage.getItem('isLoggedIn') !== 'true') {
        router.push('/login');
        return;
      }

      // Simulate fetching data as Firebase is removed
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const fetchedUserName = localStorage.getItem('userName') || 'User';
        const fetchedUserEmail = localStorage.getItem('userEmail') || 'email@example.com';
        const fetchedFacultyId = localStorage.getItem('userFacultyId') || '';
        const fetchedDepartmentId = localStorage.getItem('userDepartmentId') || '';
        const fetchedContactNumber = localStorage.getItem('userContactNumber') || '';
        const fetchedSupervisorCompanyName = localStorage.getItem('supervisorCompanyName') || '';
        const fetchedSupervisorCompanyAddress = localStorage.getItem('supervisorCompanyAddress') || '';
        
        let fetchedInternship: InternshipDetails = {
            companyName: '', companyAddress: '', supervisorName: '', supervisorEmail: '',
            startDate: '', endDate: '', location: '', status: 'NOT_SUBMITTED', rejectionReason: ''
        };

        if (storedRoleFromAuth === 'STUDENT') {
            const internshipDetailsRaw = localStorage.getItem(`userInternshipDetails_${fetchedUserEmail}`); // Using email as pseudo-ID for localStorage
            if (internshipDetailsRaw) {
                fetchedInternship = JSON.parse(internshipDetailsRaw);
            }
        }
        
        const faculty = FACULTIES.find(f => f.id === fetchedFacultyId);
        const department = DEPARTMENTS.find(d => d.id === fetchedDepartmentId && d.facultyId === fetchedFacultyId);

        setUserData({
            name: fetchedUserName,
            email: fetchedUserEmail,
            facultyId: fetchedFacultyId,
            departmentId: fetchedDepartmentId,
            contactNumber: fetchedContactNumber,
            supervisorCompanyName: fetchedSupervisorCompanyName,
            supervisorCompanyAddress: fetchedSupervisorCompanyAddress,
            avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(fetchedUserName)}`,
            facultyName: storedRoleFromAuth === 'STUDENT' ? (faculty?.name || 'Not Set') : '',
            departmentName: storedRoleFromAuth === 'STUDENT' ? (department?.name || 'Not Set') : '',
            internship: storedRoleFromAuth === 'STUDENT' ? fetchedInternship : userData.internship,
        });
        
        const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        const supervisorProfileComplete = localStorage.getItem('supervisorProfileComplete') === 'true';

        if (storedRoleFromAuth === 'STUDENT' && !onboardingComplete) {
            if (!fetchedFacultyId || !fetchedDepartmentId || fetchedFacultyId === 'Not Set' || fetchedDepartmentId === 'Not Set' || !fetchedUserName || fetchedUserName === 'User' || !fetchedUserEmail || !fetchedContactNumber) {
                setIsEditingProfile(true);
                setIsEditingInternship(false);
            } else if (fetchedInternship.status === 'NOT_SUBMITTED' || fetchedInternship.status === 'REJECTED') {
                 setIsEditingProfile(false); 
                 setIsEditingInternship(true);
            } else if (fetchedInternship.status === 'APPROVED') {
                localStorage.setItem('onboardingComplete', 'true');
                setIsEditingProfile(false);
                setIsEditingInternship(false);
            }
        } else if (storedRoleFromAuth === 'SUPERVISOR' && !supervisorProfileComplete) {
            if (fetchedUserName === 'New Supervisor' || !fetchedContactNumber || !fetchedSupervisorCompanyName) {
                setIsEditingProfile(true);
            } else {
                localStorage.setItem('supervisorProfileComplete', 'true');
            }
        }
      } catch (err) {
        console.error("Error loading profile data from localStorage:", err);
        setProfileError("Failed to load profile information. Please try again later.");
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [router, userData.internship.status]); // Re-run if internship status changes for student
  
  const handleProfileSaveSuccess = (updatedProfileData: ProfileFormValues) => {
    // Simulate saving to localStorage as backend is not Firebase
    localStorage.setItem('userName', updatedProfileData.name);
    localStorage.setItem('userEmail', updatedProfileData.email); // Though email is unlikely to change here
    if(updatedProfileData.facultyId) localStorage.setItem('userFacultyId', updatedProfileData.facultyId);
    if(updatedProfileData.departmentId) localStorage.setItem('userDepartmentId', updatedProfileData.departmentId);
    if(updatedProfileData.contactNumber) localStorage.setItem('userContactNumber', updatedProfileData.contactNumber);
    if(userRole === 'SUPERVISOR' && updatedProfileData.supervisorCompanyName) localStorage.setItem('supervisorCompanyName', updatedProfileData.supervisorCompanyName);
    if(userRole === 'SUPERVISOR' && updatedProfileData.supervisorCompanyAddress) localStorage.setItem('supervisorCompanyAddress', updatedProfileData.supervisorCompanyAddress);


    const faculty = FACULTIES.find(f => f.id === updatedProfileData.facultyId);
    const department = DEPARTMENTS.find(d => d.id === updatedProfileData.departmentId && d.facultyId === updatedProfileData.facultyId);

    setUserData(prev => ({
      ...prev,
      name: updatedProfileData.name,
      email: updatedProfileData.email,
      facultyId: userRole === 'STUDENT' ? (updatedProfileData.facultyId || '') : '',
      facultyName: userRole === 'STUDENT' ? (faculty?.name || 'Not Set') : '',
      departmentId: userRole === 'STUDENT' ? (updatedProfileData.departmentId || '') : '',
      departmentName: userRole === 'STUDENT' ? (department?.name || 'Not Set') : '',
      contactNumber: updatedProfileData.contactNumber || '',
      supervisorCompanyName: userRole === 'SUPERVISOR' ? updatedProfileData.supervisorCompanyName || '' : '',
      supervisorCompanyAddress: userRole === 'SUPERVISOR' ? updatedProfileData.supervisorCompanyAddress || '' : '',
      avatarUrl: `https://placehold.co/150x150.png?text=${getInitials(updatedProfileData.name)}`,
    }));
    
    setIsEditingProfile(false);
    
    if (userRole === 'STUDENT' && (userData.internship.status === 'NOT_SUBMITTED' || userData.internship.status === 'REJECTED')) {
        setIsEditingInternship(true);
    } else if (userRole === 'STUDENT' && userData.internship.status === 'APPROVED') {
        localStorage.setItem('onboardingComplete', 'true');
    }
  };

  const handleInternshipSaveSuccess = (updatedInternshipData: InternshipDetails) => {
    // InternshipDetailsForm handles its own localStorage saving now
    setUserData(prev => ({
        ...prev,
        internship: updatedInternshipData
    }));
    setIsEditingInternship(false);
    if (updatedInternshipData.status === 'APPROVED') {
        localStorage.setItem('onboardingComplete', 'true');
    } else {
        localStorage.removeItem('onboardingComplete');
    }
  };
  
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (profileError && !isEditingProfile && !isEditingInternship) {
    return <div className="p-6 text-center text-destructive">{profileError}</div>;
  }

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
      {profileError && (isEditingProfile || isEditingInternship) && (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Loading Error</AlertTitle>
            <AlertDescription>{profileError} Some information might be outdated. Proceed with caution or refresh.</AlertDescription>
        </Alert>
      )}

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
          {!isEditingInternship && !isEditingProfile && 
           (userRole === 'STUDENT' ? currentInternshipStatus !== 'PENDING_APPROVAL' : true) && (
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
              userRole={userRole}
              defaultValues={userData} 
              onSuccess={handleProfileSaveSuccess} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              {userRole === 'STUDENT' && (
                <>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="font-medium text-foreground">Faculty:</p>
                        <p className="text-muted-foreground">{userData.facultyName || 'Not Set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="font-medium text-foreground">Department:</p>
                        <p className="text-muted-foreground">{userData.departmentName || 'Not Set'}</p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-primary"/>
                <div>
                    <p className="font-medium text-foreground">Contact Number:</p>
                    <p className="text-muted-foreground">{userData.contactNumber || 'Not set'}</p>
                </div>
              </div>
               {userRole === 'SUPERVISOR' && userData.supervisorCompanyName && (
                 <>
                    <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-medium text-foreground">Company Name:</p>
                            <p className="text-muted-foreground">{userData.supervisorCompanyName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-medium text-foreground">Company Address:</p>
                            <p className="text-muted-foreground">{userData.supervisorCompanyAddress || 'Not set'}</p>
                        </div>
                    </div>
                 </>
               )}
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
               {!isEditingProfile && !isEditingInternship && 
                (currentInternshipStatus === 'NOT_SUBMITTED' || currentInternshipStatus === 'REJECTED' || currentInternshipStatus === 'APPROVED') && (
                <Button variant="outline" onClick={() => setIsEditingInternship(true)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
                    <Edit3 className="mr-2 h-4 w-4" /> 
                    {currentInternshipStatus === 'NOT_SUBMITTED' || currentInternshipStatus === 'REJECTED' ? 'Enter/Update Details' : 'Edit Internship'}
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
                        {currentInternshipStatus === 'PENDING_APPROVAL' && "Your internship details are currently awaiting HOD review."}
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
                    <p className="text-muted-foreground">{userData.internship.startDate && isValid(parseISO(userData.internship.startDate)) ? format(parseISO(userData.internship.startDate), "PPP") : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">End Date:</p>
                    <p className="text-muted-foreground">{userData.internship.endDate && isValid(parseISO(userData.internship.endDate)) ? format(parseISO(userData.internship.endDate), "PPP") : 'N/A'}</p>
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
                    <p className="text-muted-foreground mb-4">Please add your internship placement information to be approved by your Head of Department.</p>
                    <Button onClick={() => setIsEditingInternship(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                        Add Internship Details
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {userRole === 'SUPERVISOR' && (
         <Card className="shadow-xl rounded-xl mt-6">
          <CardHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Landmark className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Company Affiliation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditingProfile ? (
                <p className="text-muted-foreground text-sm">You can edit your company details in the profile form above.</p>
            ) : userData.supervisorCompanyName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                     <div>
                        <p className="font-medium text-foreground">Company Name:</p>
                        <p className="text-muted-foreground">{userData.supervisorCompanyName}</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Company Address:</p>
                        <p className="text-muted-foreground">{userData.supervisorCompanyAddress || 'Not set'}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <Landmark className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-semibold text-foreground">Company Details Not Set</p>
                    <p className="text-muted-foreground mb-4">Please add your company affiliation by editing your profile.</p>
                    <Button onClick={() => setIsEditingProfile(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                        Edit Profile to Add Company
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      )}
      {userRole !== 'STUDENT' && userRole !== null && userRole !== 'SUPERVISOR' && (
         <Card className="shadow-xl rounded-xl mt-6">
          <CardHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-headline">Role-Specific Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              As a {USER_ROLES[userRole]}, your primary role involves { userRole === 'LECTURER' ? 'managing student assignments, tracking progress, and facilitating communication.' : userRole === 'HOD' ? 'overseeing departmental internship activities, managing assignments, and analyzing overall program performance.' : userRole === 'ADMIN' ? 'managing the entire InternshipTrack platform, including university structure, user accounts, and system settings.' : '' }
              You can manage relevant aspects via the appropriate sections like '{userRole === 'LECTURER' ? 'Assignments' : userRole === 'HOD' ? 'Department Ops' : 'Admin Dashboard'}' and use the 'Feedback Hub' for communication.
            </p>
             {isEditingProfile && <p className="mt-4 text-sm text-destructive">Please save your profile information first to proceed.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
