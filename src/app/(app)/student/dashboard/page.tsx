
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import {
    LayoutDashboard, User, Briefcase, Building, CalendarCheck, FileText as FileTextLucide, MapPin, StarIcon, ClockIcon, AlertOctagonIcon, UsersIcon, SchoolIcon, CheckCircle2, CircleDot, PlusCircle, CalendarDays, UploadCloud, Edit, MessageSquarePlus, BarChart3, SettingsIcon, UserCheck, FileUp, Users2, Activity, CheckSquare, Contact, Eye, ListChecks, ShieldAlert, AlertCircle, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
// Assume these are correctly imported or defined elsewhere
import { reportAbuse } from '@/lib/services/issue.service'; // Ensure this service exists and calls apiClient.reportIssue()
import { StudentApiService } from '@/lib/services/studentApi'; // Use StudentApiService instead of apiClient
// Add these imports to the top of your file
import { Info } from 'lucide-react';

// Define types for data fetched from API to ensure type safety
import type { UserProfileData, DailyTask, DailyReport } from '@/types'; // Ensure these types are correctly defined based on your Prisma schema

// Define additional types for the dashboard
interface StudentProfileData {
  id: string;
  user_id: string;
  student_id_number: string;
  faculty_id: string;
  department_id: string;
  program_of_study?: string;
  is_verified: boolean;
  profile_complete: boolean;
}

interface Internship {
  id: string;
  student_id: string;
  company_id: string;
  start_date: string;
  end_date: string;
  status: string;
  companies?: {
    name: string;
    address: string;
  };
  company_supervisor?: {
    users?: {
      id: string;
      first_name: string;
      last_name: string;
      profile_picture_url?: string;
    };
  };
  lecturer?: {
    users?: {
      id: string;
      first_name: string;
      last_name: string;
      profile_picture_url?: string;
    };
  };
}

interface PendingInternship {
  id: string;
  student_id: string;
  company_name: string;
  company_address: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
}

interface CheckIn {
  id: string;
  student_id: string;
  check_in_timestamp: string;
  latitude?: number;
  longitude?: number;
  address_resolved?: string;
  manual_reason?: string;
  is_gps_verified: boolean;
  is_outside_geofence: boolean;
}

const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const DashboardStatsCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; progress?: number; progressLabel?: string; detail?: React.ReactNode; iconBgColor?: string; iconColor?: string, actionLink?: string, actionLabel?: string }> = ({ title, value, icon: Icon, progress, progressLabel, detail, iconBgColor = "bg-primary/10", iconColor = "text-primary", actionLink, actionLabel }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl dashboard-card flex flex-col">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <div>
                    <CardDescription className="text-sm">{title}</CardDescription>
                    <CardTitle className="text-2xl font-bold mt-1">{value}</CardTitle>
                </div>
                <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            {progress !== undefined && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{progressLabel}</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-muted" />
                </div>
            )}
            {detail && (
                <div className="text-xs text-muted-foreground mt-2">{detail}</div>
            )}
        </CardContent>
        {actionLink && actionLabel && (
            <CardFooter className="pt-0">
                <Link href={actionLink} passHref className="w-full">
                    <Button variant="outline" className="w-full rounded-lg text-xs">{actionLabel}</Button>
                </Link>
            </CardFooter>
        )}
    </Card>
);

const StudentTaskItem: React.FC<{
    task: DailyTask; // Expecting a DailyTask object
    onEdit?: (task: DailyTask) => void;
}> = ({ task, onEdit }) => {
    const today = new Date();
    const taskDate = new Date(task.date);
    let status: 'Completed' | 'Pending' | 'Overdue' = 'Pending';
    const isCompleted = task.status === 'SUBMITTED' || task.status === 'APPROVED';
    if (isCompleted) {
        status = 'Completed';
    } else if (taskDate < today && !isCompleted) {
        status = 'Overdue';
    }

    const statusStyles = {
        Completed: { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400', badge: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50' },
        Pending: { icon: CircleDot, color: 'text-yellow-500 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50' },
        Overdue: { icon: AlertOctagonIcon, color: 'text-red-500 dark:text-red-400', badge: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50' },
    };
    const CurrentIcon = statusStyles[status].icon;

    return (
        <div className="p-4 flex items-start hover:bg-muted/30 transition-colors">
            <div className="flex-shrink-0 mt-1">
                <CurrentIcon className={`h-5 w-5 ${statusStyles[status].color}`} />
            </div>
            <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-foreground">{task.description}</h4>
                    <Badge variant="outline" className={`text-xs ${statusStyles[status].badge}`}>{status}</Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">{task.learningObjectives}</p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <ClockIcon className="mr-1 h-3 w-3" />
                    <span>{format(new Date(task.date), 'PPP')}</span>
                </div>
            </div>
            {onEdit && (
                <Button variant="ghost" size="icon" className="ml-2 h-7 w-7 self-center text-muted-foreground hover:text-primary" onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Task</span>
                </Button>
            )}
        </div>
    );
};


const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [studentProfile, setStudentProfile] = React.useState<StudentProfileData | null>(null);
    const [myInternshipSubmission, setMyInternshipSubmission] = React.useState<PendingInternship | null>(null);
    const [activeInternship, setActiveInternship] = React.useState<Internship | null>(null);
    const [dailyTasks, setDailyTasks] = React.useState<DailyTask[]>([]);
    const [todayCheckIn, setTodayCheckIn] = React.useState<CheckIn | null>(null);
    const [reportStats, setReportStats] = React.useState({ total: 0, approved: 0 });

    const [reportDate, setReportDate] = React.useState<Date | undefined>(new Date());
    const [reportSummary, setReportSummary] = React.useState('');
    const [reportFile, setReportFile] = React.useState<File | null>(null);

    // Report Abuse Dialog State
    const [reportAbuseDialogOpen, setReportAbuseDialogOpen] = React.useState(false);
    const [reportTitle, setReportTitle] = React.useState('');
    const [reportDescription, setReportDescription] = React.useState('');
    const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const getTodayDateString = React.useCallback(() => format(new Date(), 'yyyy-MM-dd'), []);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                if (user.role === 'STUDENT') {
                    const studentData = await StudentApiService.getStudentProfile();
                    if (studentData) {
                        // Map UserProfileData to StudentProfileData format
                        const mappedProfile: StudentProfileData = {
                            id: studentData.id,
                            user_id: studentData.id,
                            student_id_number: studentData.id, // Using id as student number for now
                            faculty_id: studentData.faculty_id || '',
                            department_id: studentData.department_id || '',
                            program_of_study: undefined,
                            is_verified: studentData.status === 'ACTIVE',
                            profile_complete: true
                        };
                        setStudentProfile(mappedProfile);
                    }

                    const submission = await StudentApiService.getMyInternshipSubmission() as PendingInternship | null;
                    setMyInternshipSubmission(submission);

                    const reports = await StudentApiService.getReports();
                    const totalReports = reports.length;
                    const approvedReports = reports.filter(r => r.status === 'APPROVED').length;
                    setReportStats({ total: totalReports, approved: approvedReports });
                    
                    const internship = await StudentApiService.getMyInternship() as Internship | null;
                    setActiveInternship(internship);

                    if (internship) {
                        try {
                            const today_str = getTodayDateString();
                            const tasks = await StudentApiService.getTasks(Number(internship.id), today_str) as DailyTask[];
                            setDailyTasks(tasks || []);
                        } catch (taskError) {
                            console.error('Error fetching tasks:', taskError);
                            setDailyTasks([]);
                        }
                    }

                } else {
                    setError("Access Denied: User is not a student or not logged in.");
                }
            } catch (err: any) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message || "Failed to load dashboard data.");
                if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                    // Consider redirecting to login page
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, getTodayDateString]);

    const handleQuickReportSubmit = async () => {
        if (!reportSummary.trim() || !reportDate) {
            toast({ title: "Error", description: "Date and work summary are required.", variant: "destructive" });
            return;
        }
        if (!activeInternship) {
            toast({ title: "Error", description: "You need an active internship to submit reports.", variant: "destructive" });
            return;
        }

        try {
            await StudentApiService.createReport({
                internshipId: Number(activeInternship.id),
                report_date: format(reportDate, 'yyyy-MM-dd'),
                summary_of_work: reportSummary,
            });
            toast({ title: "Quick Report Submitted!", description: `Summary for ${format(reportDate, "PPP")} recorded.` });
            setReportSummary('');
            setReportFile(null); // Clear file input
            // Refresh report stats
            const reports = await StudentApiService.getReports();
            setReportStats({ total: reports.length, approved: reports.filter(r => r.status === 'APPROVED').length });

        } catch (error: any) {
            toast({ title: "Error submitting report", description: error.message || "Failed to submit report.", variant: "destructive" });
        }
    };

    const handleReportAbuseSubmit = async () => {
        if (!reportTitle.trim() || !reportDescription.trim()) {
            toast({ title: "Error", description: "Title and description are required.", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "Error", description: "User not identified for reporting.", variant: "destructive" });
            return;
        }

        setIsSubmittingReport(true);
        try {
            await reportAbuse({
                title: reportTitle,
                description: reportDescription,
                reportedByStudentId: user.id, // Use actual user ID
                reportedByName: `${user.first_name} ${user.last_name}`, // Use actual user name
            });
            toast({
                title: "Abuse Reported",
                description: "Your report has been submitted to the administrator for review.",
            });
            setReportAbuseDialogOpen(false);
            setReportTitle('');
            setReportDescription('');
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to submit report.", variant: "destructive" });
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const studentCheckInChartData = [{
        name: todayCheckIn ? 'Checked In' : 'Not Checked In',
        value: 100,
        fill: todayCheckIn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
    }];

    const studentCheckInChartConfig = {
        value: {
            label: "Status",
        },
        checkedIn: {
            label: "Checked In",
            color: "hsl(var(--primary))",
        },
        notCheckedIn: {
            label: "Not Checked In",
            color: "hsl(var(--muted))",
        },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Error Loading Dashboard</h3>
                <p className="mt-2">{error}</p>
                <p className="mt-4 text-sm">Please try again or contact support if the issue persists.</p>
            </div>
        );
    }

    if (!user || user.role !== 'STUDENT' || !studentProfile) {
        return (
            <div className="text-center p-8 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                <ShieldAlert className="h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Access Denied</h3>
                <p className="mt-2">You must be logged in as a student to view this page.</p>
                <Link href="/login" passHref>
                    <Button className="mt-4">Go to Login</Button>
                </Link>
            </div>
        );
    }

    // Calculated stats
    const areDatesValid = activeInternship && activeInternship.start_date && activeInternship.end_date && isValid(parseISO(activeInternship.start_date)) && isValid(parseISO(activeInternship.end_date));
    const internshipDurationDays = areDatesValid ? differenceInDays(parseISO(activeInternship.end_date), parseISO(activeInternship.start_date)) + 1 : 0;
    const daysCompleted = areDatesValid ? differenceInDays(new Date(), parseISO(activeInternship.start_date)) + 1 : 0;
    const progressPercentage = internshipDurationDays > 0 ? Math.min(100, Math.round((daysCompleted / internshipDurationDays) * 100)) : 0;
    
    const completedTasksCount = dailyTasks.filter(task => task.status === 'SUBMITTED' || task.status === 'APPROVED').length;
    const pendingTasksCount = dailyTasks.filter(task => task.status === 'PENDING').length;
    const reportApprovalRate = reportStats.total > 0 ? Math.round((reportStats.approved / reportStats.total) * 100) : 0;

    return (
        <>
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-yellow-900 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Welcome back, {user.first_name || 'Student'}!</h2>
                        <p className="opacity-90 text-sm">
                            {activeInternship ? (
                                <>You have {pendingTasksCount} pending tasks to submit today.</>
                            ) : (
                                "Start by submitting your internship details for approval."
                            )}
                        </p>
                    </div>
                    <div className="flex-shrink-0 mt-3 md:mt-0">
                        {activeInternship ? (
                            <Link href="/student/tasks" passHref>
                                <Button className="bg-white text-yellow-900 hover:bg-white/90 font-medium transition rounded-lg px-4 py-2 text-sm">
                                    <ListChecks className="mr-2 h-4 w-4" /> View Tasks
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/profile#internship" passHref>
                                <Button variant="destructive" className="font-medium transition rounded-lg px-4 py-2 text-sm animate-pulse">
                                    <Building className="mr-2 h-4 w-4" /> Submit Internship Details
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatsCard
                    title="Days Completed"
                    value={activeInternship ? `${daysCompleted}` : 'N/A'}
                    icon={CalendarCheck}
                    progress={progressPercentage}
                    progressLabel={activeInternship ? `Total Days: ${internshipDurationDays}` : 'No active internship'}
                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/70"
                    iconColor="text-indigo-600 dark:text-indigo-300"
                />
                <DashboardStatsCard
                    title="Reports Submitted"
                    value={reportStats.total}
                    icon={FileTextLucide}
                    detail={<span>Approved: {reportStats.approved} <span className="text-green-600">({reportApprovalRate}%)</span></span>}
                    iconBgColor="bg-green-100 dark:bg-green-900/70"
                    iconColor="text-green-600 dark:text-green-300"
                    actionLink="/student/reports"
                    actionLabel="View Reports"
                />
                <DashboardStatsCard
                    title="Supervisor Rating"
                    value="N/A"
                    icon={StarIcon}
                    detail={
                        <div className="flex items-center text-xs">
                            <div className="flex text-yellow-400">
                                <StarIcon fill="currentColor" className="w-3 h-3" />
                                <StarIcon fill="currentColor" className="w-3 h-3" />
                                <StarIcon fill="currentColor" className="w-3 h-3" />
                                <StarIcon fill="currentColor" className="w-3 h-3" />
                                <StarIcon fill="currentColor" stroke="currentColor" strokeWidth={1} className="w-3 h-3 text-yellow-400/80" />
                            </div>
                            <span className="ml-1 text-muted-foreground">(0 reviews)</span>
                        </div>
                    }
                    iconBgColor="bg-yellow-100 dark:bg-yellow-900/70"
                    iconColor="text-yellow-600 dark:text-yellow-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
                        <CardHeader className="border-b border-border flex flex-row justify-between items-center">
                            <CardTitle className="font-headline text-lg">Today&apos;s Tasks</CardTitle>
                            <Link href="/student/tasks" passHref>
                                <Button variant="link" className="text-primary hover:text-primary/80 font-medium">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border">
                            {dailyTasks.length > 0 ? (
                                dailyTasks.map(task => (
                                    <StudentTaskItem key={task.id} task={task} onEdit={() => toast({ title: "Edit task", description: "Functionality to be implemented." })} />
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">No tasks assigned for today.</div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-4 border-t border-border">
                            <Link href="/student/tasks/new" className="w-full">
                                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="font-headline text-lg">Log Work / Quick Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {!activeInternship ? (
                                <div className="text-center p-4 text-muted-foreground bg-blue-50 rounded-md border border-blue-200">
                                    <Info className="h-5 w-5 inline-block mr-2 text-blue-500" />
                                    <p>You need an active, approved internship to submit reports.</p>
                                    <Link href="/profile#internship" passHref>
                                        <Button variant="link" className="text-blue-600">Submit Internship Details</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Label htmlFor="report-date" className="block text-sm font-medium text-foreground mb-1">Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className="w-full justify-start text-left font-normal border-input text-foreground rounded-lg"
                                                    >
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                        {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-popover border-border">
                                                    <Calendar
                                                        mode="single"
                                                        selected={reportDate}
                                                        onSelect={setReportDate}
                                                        initialFocus
                                                        className="bg-popover text-popover-foreground"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="attachment-file" className="block text-sm font-medium text-foreground mb-1">Attachment (Optional)</Label>
                                            <Input id="attachment-file" type="file" onChange={(e) => setReportFile(e.target.files ? e.target.files[0] : null)} className="text-xs border-input text-foreground file:text-foreground rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="work-summary" className="block text-sm font-medium text-foreground mb-1">Work Summary</Label>
                                        <Textarea id="work-summary" value={reportSummary} onChange={(e) => setReportSummary(e.target.value)} placeholder="Briefly describe what you accomplished..." rows={3} className="border-input text-foreground rounded-lg" />
                                    </div>
                                    <div className="flex justify-center space-x-2">
                                        <Button variant="outline" className="border-input text-foreground hover:bg-muted hover:text-muted-foreground rounded-lg" onClick={() => toast({ title: "Draft Saved!", description: "Your quick report draft has been saved." })}>Save Draft</Button>
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" onClick={handleQuickReportSubmit}>
                                            Submit Quick Report
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">For a detailed submission, go to <Link href="/student/reports/new" className="text-primary hover:underline">Full Report Page</Link>.</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="font-headline text-lg flex items-center">
                                <MapPin className="mr-2 h-5 w-5 text-primary" /> Check-in Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center">
                                <ChartContainer config={studentCheckInChartConfig} className="mx-auto aspect-square h-[120px]">
                                    <PieChart accessibilityLayer>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel className="text-xs bg-popover text-popover-foreground border-border" />} />
                                        <Pie data={studentCheckInChartData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={50} strokeWidth={2}>
                                            <Cell fill={todayCheckIn ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} radius={8} />
                                        </Pie>
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`fill-current ${todayCheckIn ? 'text-primary' : 'text-muted-foreground'} text-lg font-bold`}>
                                            {todayCheckIn ? 'Done' : 'N/A'}
                                        </text>
                                    </PieChart>
                                </ChartContainer>
                                <div className="text-center mt-2">
                                    <h4 className="font-medium text-base text-foreground">{todayCheckIn ? "Checked In for Today!" : "Awaiting Check-in"}</h4>
                                    {todayCheckIn && (
                                        <p className="text-muted-foreground text-xs mt-0.5">{format(new Date(todayCheckIn.check_in_timestamp), 'p')} at {todayCheckIn.address_resolved || todayCheckIn.manual_reason || 'Unknown location'}</p>
                                    )}
                                    {!todayCheckIn && (
                                        <p className="text-muted-foreground text-xs mt-0.5">Verify your location for attendance.</p>
                                    )}
                                </div>
                                <Link href="/student/check-in" className="w-full">
                                    <Button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                                        {todayCheckIn ? "View Check-in" : "Check-in Now"}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg rounded-xl bg-destructive/10 border-destructive/30 text-destructive-foreground">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center text-destructive"><AlertCircle className="mr-2 h-5 w-5" /> Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground">If you are facing any issues or grievances at your workplace, please report it immediately.</p>
                        </CardContent>
                        <CardFooter>
                            <Dialog open={reportAbuseDialogOpen} onOpenChange={setReportAbuseDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full rounded-lg">
                                        <ShieldAlert className="mr-2 h-4 w-4" /> Report Abuse
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Report Abuse</DialogTitle>
                                        <DialogDescription>
                                            Your report will be sent to the university administrator for review. Please be as detailed as possible. Your identity will be kept confidential.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="report-title">Title</Label>
                                            <Input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g., Unsafe working conditions" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="report-description">Description</Label>
                                            <Textarea id="report-description" value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe the issue in detail..." rows={5} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="button" onClick={handleReportAbuseSubmit} disabled={isSubmittingReport}>
                                            {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Report
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                    <CardHeader className="border-b border-border">
                        <CardTitle className="font-headline text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Industrial Supervisor</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {activeInternship?.company_supervisor ? (
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={activeInternship.company_supervisor.users?.profile_picture_url || undefined} alt={activeInternship.company_supervisor.users?.first_name || 'Supervisor'} />
                                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(`${activeInternship.company_supervisor.users?.first_name} ${activeInternship.company_supervisor.users?.last_name}`)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{activeInternship.company_supervisor.users?.first_name} {activeInternship.company_supervisor.users?.last_name}</p>
                                    <p className="text-xs text-muted-foreground">Industrial Supervisor</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm py-2">No industrial supervisor assigned yet.</div>
                        )}
                    </CardContent>
                    <CardFooter className="p-4 border-t border-border">
                        {activeInternship?.company_supervisor ? (
                            <Link href={`/communication?to=${activeInternship.company_supervisor.users?.id}`} className="w-full">
                                <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted">
                                    <Contact className="mr-2 h-4 w-4" /> Contact Supervisor
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted" disabled>
                                <Contact className="mr-2 h-4 w-4" /> Contact Supervisor
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                    <CardHeader className="border-b border-border">
                        <CardTitle className="font-headline text-lg flex items-center"><SchoolIcon className="mr-2 h-5 w-5 text-primary" />Assigned Lecturer</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {activeInternship?.lecturer ? (
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={activeInternship.lecturer.users?.profile_picture_url || undefined} alt={activeInternship.lecturer.users?.first_name || 'Lecturer'} />
                                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(`${activeInternship.lecturer.users?.first_name} ${activeInternship.lecturer.users?.last_name}`)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{activeInternship.lecturer.users?.first_name} {activeInternship.lecturer.users?.last_name}</p>
                                    <p className="text-xs text-muted-foreground">Faculty Lecturer</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm py-2">No faculty lecturer assigned yet.</div>
                        )}
                    </CardContent>
                    <CardFooter className="p-4 border-t border-border">
                        {activeInternship?.lecturer ? (
                            <Link href={`/communication?to=${activeInternship.lecturer.users?.id}`} className="w-full">
                                <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted">
                                    <Contact className="mr-2 h-4 w-4" /> Contact Lecturer
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted" disabled>
                                <Contact className="mr-2 h-4 w-4" /> Contact Lecturer
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
            <PageHeader
                title="Student Dashboard"
                description="Welcome to your InternHub student dashboard."
                icon={LayoutDashboard}
            />
            <StudentDashboard />
        </div>
    );
}
