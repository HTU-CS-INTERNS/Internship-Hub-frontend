
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
import type { UserRole, InternshipDetails, InternshipStatus, ProfileFormValues, UserProfileData } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { user, role, isLoading: isAuthLoading } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingInternship, setIsEditingInternship] = React.useState(false);
  
  const [internshipDetails, setInternshipDetails] = React.useState<InternshipDetails | null>(null);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    if(user?.role === 'STUDENT' && !internshipDetails) {
        const detailsRaw = localStorage.getItem(`userInternshipDetails_${user.email}`);
        if (detailsRaw) {
            setInternshipDetails(JSON.parse(detailsRaw));
        } else {
             setInternshipDetails({ status: 'NOT_SUBMITTED' } as InternshipDetails);
        }
    }
  }, [user, role, isAuthLoading, router, internshipDetails]);

  const handleProfileSaveSuccess = (updatedProfileData: Partial<UserProfileData>) => {
    setIsEditingProfile(false);
  };

  const handleInternshipSaveSuccess = (updatedInternshipData: InternshipDetails) => {
    setInternshipDetails(updatedInternshipData);
    setIsEditingInternship(false);
    if (updatedInternshipData.status === 'APPROVED') {
        localStorage.setItem('onboardingComplete', 'true');
    } else {
        localStorage.removeItem('onboardingComplete');
    }
  };

  if (isAuthLoading || !user || !role) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading profile...</p>
      </div>
    );
  }
  
  const userName = `${user.first_name} ${user.last_name}`;
  const facultyName = user.faculty_id ? FACULTIES.find(f => f.id === user.faculty_id)?.name : 'Not Set';
  const departmentName = user.department_id ? DEPARTMENTS.find(d => d.id === user.department_id)?.name : 'Not Set';
  
  const currentInternshipStatus = internshipDetails?.status || 'NOT_SUBMITTED';
  const StatusIcon = statusAlertColors[currentInternshipStatus]?.icon || Edit3;
  let internshipEditButtonText = 'Edit Internship';
  if (currentInternshipStatus === 'NOT_SUBMITTED' || currentInternshipStatus === 'REJECTED') {
    internshipEditButtonText = 'Enter/Update Details';
  } else if (currentInternshipStatus === 'PENDING_APPROVAL') {
    internshipEditButtonText = 'Edit Pending Submission';
  }
  const canEditInternship = currentInternshipStatus !== 'APPROVED';

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Profile"
        description="View and manage your personal and internship information on InternHub."
        icon={UserIcon}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Profile" }]}
      />
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            {role === 'STUDENT' && <TabsTrigger value="internship">Internship Details</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
            <Card className="shadow-xl rounded-xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b">
                <div className="flex items-center gap-4 flex-grow">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={user.avatar_url} alt={userName} data-ai-hint="person portrait"/>
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary">{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-headline">{userName}</CardTitle>
                        {!isEditingProfile && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(true)} className="text-muted-foreground hover:text-primary h-7 w-7">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-card text-card-foreground border-border">
                                        <p>Edit Profile</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <CardDescription className="text-base">{user.email}</CardDescription>
                    <p className="text-sm text-primary font-medium">{USER_ROLES[role]}</p>
                    </div>
                </div>
                {isEditingProfile && (
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg mt-2 sm:mt-0">
                    Cancel Profile Edit
                    </Button>
                )}
                </CardHeader>
                <CardContent className="p-6">
                {isEditingProfile ? (
                    <ProfileSetupForm
                    userRole={role}
                    defaultValues={user}
                    onSuccess={handleProfileSaveSuccess}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                    {role === 'STUDENT' && (
                        <>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-medium text-foreground">Faculty:</p>
                                <p className="text-muted-foreground">{facultyName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-medium text-foreground">Department:</p>
                                <p className="text-muted-foreground">{departmentName}</p>
                            </div>
                        </div>
                        </>
                    )}
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-medium text-foreground">Contact Number:</p>
                            <p className="text-muted-foreground">{user.phone_number || 'Not set'}</p>
                        </div>
                    </div>
                    {role === 'SUPERVISOR' && user.company_name && (
                        <>
                            <div className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary"/>
                                <div>
                                    <p className="font-medium text-foreground">Company Name:</p>
                                    <p className="text-muted-foreground">{user.company_name}</p>
                                </div>
                            </div>
                        </>
                    )}
                    </div>
                )}
                </CardContent>
            </Card>
            {role !== 'STUDENT' && (
                <Card className="shadow-xl rounded-xl mt-6">
                <CardHeader className="p-6 border-b">
                    <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-headline">Role-Specific Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">
                    As a {USER_ROLES[role]}, your primary role involves { role === 'LECTURER' ? 'managing student assignments, tracking progress, and facilitating communication.' : role === 'HOD' ? 'overseeing departmental internship activities, managing assignments, and analyzing overall program performance.' : role === 'ADMIN' ? 'managing the entire InternHub platform, including university structure, user accounts, and system settings.' : role === 'SUPERVISOR' ? 'overseeing assigned interns at your company, providing task guidance, and submitting performance evaluations.' : '' }
                    You can manage relevant aspects via your dashboard and navigation menu.
                    </p>
                </CardContent>
                </Card>
            )}
        </TabsContent>
        {role === 'STUDENT' && internshipDetails && (
             <TabsContent value="internship">
                 <Card className="shadow-xl rounded-xl" id="internship">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b">
                    <div className="flex items-center gap-3 flex-grow">
                        <Briefcase className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl font-headline">Internship Details</CardTitle>
                    </div>
                    {!isEditingInternship && canEditInternship && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditingInternship(true)} className="text-muted-foreground hover:text-primary h-7 w-7">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-card text-card-foreground border-border">
                                        <p>{internshipEditButtonText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                                {currentInternshipStatus === 'REJECTED' && `Your internship details were rejected. ${internshipDetails.rejectionReason ? `Reason: ${internshipDetails.rejectionReason}. ` : ''}Please update and resubmit.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {isEditingInternship ? (
                        <InternshipDetailsForm
                        defaultValues={internshipDetails}
                        onSuccess={handleInternshipSaveSuccess}
                        isResubmitting={currentInternshipStatus === 'REJECTED' || currentInternshipStatus === 'PENDING_APPROVAL'}
                        />
                    ) : currentInternshipStatus !== 'NOT_SUBMITTED' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <div>
                            <p className="font-medium text-foreground">Company Name:</p>
                            <p className="text-muted-foreground">{internshipDetails.companyName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Company Address:</p>
                            <p className="text-muted-foreground">{internshipDetails.companyAddress || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Supervisor Name:</p>
                            <p className="text-muted-foreground">{internshipDetails.supervisorName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Supervisor Email:</p>
                            <p className="text-muted-foreground">{internshipDetails.supervisorEmail || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Start Date:</p>
                            <p className="text-muted-foreground">{internshipDetails.startDate && isValid(parseISO(internshipDetails.startDate)) ? format(parseISO(internshipDetails.startDate), "PPP") : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">End Date:</p>
                            <p className="text-muted-foreground">{internshipDetails.endDate && isValid(parseISO(internshipDetails.endDate)) ? format(parseISO(internshipDetails.endDate), "PPP") : 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="font-medium text-foreground">Location/Work Arrangement:</p>
                            <p className="text-muted-foreground">{internshipDetails.location || 'N/A'}</p>
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
             </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
