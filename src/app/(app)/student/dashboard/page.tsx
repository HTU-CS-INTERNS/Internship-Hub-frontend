
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { 
    LayoutDashboard, User, Briefcase, Building, CalendarCheck, FileText as FileTextLucide, MapPin, StarIcon, ClockIcon, AlertOctagonIcon, UsersIcon, SchoolIcon, CheckCircle2, CircleDot, PlusCircle, CalendarDays, UploadCloud, Edit, MessageSquarePlus, BarChart3, SettingsIcon, UserCheck, FileUp, Users2, Activity, CheckSquare, Contact, Eye, ListChecks, ShieldAlert, AlertCircle, Loader2
} from 'lucide-react'; 
import type { UserRole } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS, DUMMY_STUDENTS_DATA } from '@/lib/constants';
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
import { format, parseISO } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { CheckIn } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { reportAbuse } from '@/lib/services/issue.service';

const getInitials = (name: string) => {
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

const StudentTaskItem: React.FC<{ title: string; description: string; status: 'Completed' | 'Pending' | 'Overdue'; dueDate: string, statusIcon?: React.ElementType }> = ({ title, description, status, dueDate }) => {
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
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
          <Badge variant="outline" className={`text-xs ${statusStyles[status].badge}`}>{status}</Badge>
        </div>
        <p className="text-muted-foreground text-xs mt-1">{description}</p>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <ClockIcon className="mr-1 h-3 w-3" />
          <span>{dueDate}</span>
        </div>
      </div>
       <Button variant="ghost" size="icon" className="ml-2 h-7 w-7 self-center text-muted-foreground hover:text-primary">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Task</span>
        </Button>
    </div>
  );
};

interface StoredCheckinData {
  time: string;
  location: string;
  date: string; 
  photoPreview?: string | null;
  isGpsVerified?: boolean;
}

const CHECKINS_STORAGE_KEY = 'internshipTrack_checkIns_v1';

const StudentDashboard: React.FC<{ userName: string }> = ({ userName }) => {
    const [reportDate, setReportDate] = React.useState<Date | undefined>(new Date());
    const [reportSummary, setReportSummary] = React.useState('');
    const { toast } = useToast();
    const [isCheckedInToday, setIsCheckedInToday] = React.useState(false);
    const [checkinDetails, setCheckinDetails] = React.useState<StoredCheckinData | null>(null);

    // Report Abuse Dialog State
    const [reportAbuseDialogOpen, setReportAbuseDialogOpen] = React.useState(false);
    const [reportTitle, setReportTitle] = React.useState('');
    const [reportDescription, setReportDescription] = React.useState('');
    const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);

    const getTodayDateString = React.useCallback(() => format(new Date(), 'yyyy-MM-dd'), []);

    React.useEffect(() => {
        const todayDateStr = getTodayDateString();
        const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';

        const checkInsRaw = typeof window !== "undefined" ? localStorage.getItem(CHECKINS_STORAGE_KEY) : null;
        if (checkInsRaw) {
            try {
                const allCheckIns: CheckIn[] = JSON.parse(checkInsRaw);
                const todayCheckInsForStudent = allCheckIns.filter(
                    ci => ci.student_id === studentId && format(parseISO(ci.check_in_timestamp), 'yyyy-MM-dd') === todayDateStr
                );

                if (todayCheckInsForStudent.length > 0) {
                    const latestCheckIn = todayCheckInsForStudent.sort((a, b) =>
                        new Date(b.check_in_timestamp).getTime() - new Date(a.check_in_timestamp).getTime()
                    )[0];

                    setIsCheckedInToday(true);
                    setCheckinDetails({
                        time: format(parseISO(latestCheckIn.check_in_timestamp), 'p'),
                        location: latestCheckIn.address_resolved || latestCheckIn.manual_reason || 'Checked In',
                        date: format(parseISO(latestCheckIn.check_in_timestamp), 'yyyy-MM-dd'),
                        photoPreview: latestCheckIn.photo_url,
                        isGpsVerified: latestCheckIn.is_gps_verified,
                    });
                } else {
                    setIsCheckedInToday(false);
                    setCheckinDetails(null);
                }
            } catch (e) {
                console.error("Failed to parse check-in data for dashboard", e);
                setIsCheckedInToday(false);
                setCheckinDetails(null);
            }
        } else {
            setIsCheckedInToday(false);
            setCheckinDetails(null);
        }
    }, [getTodayDateString]);
    
    const studentCheckInChartData = [{ 
        name: isCheckedInToday ? 'Checked In' : 'Not Checked In', 
        value: 100, 
        fill: isCheckedInToday ? 'hsl(var(--primary))' : 'hsl(var(--muted))' 
    }];
    
    const studentCheckInChartConfig = {
        "Checked In": { label: "Checked In" },
        "Not Checked In": { label: "Not Checked In" }
    };


    const handleQuickReportSubmit = () => {
        if (!reportSummary.trim()) {
            toast({ title: "Error", description: "Work summary cannot be empty.", variant: "destructive"});
            return;
        }
        toast({ title: "Quick Report Submitted!", description: `Summary for ${format(reportDate!, "PPP")} recorded.`});
        setReportSummary('');
    };

    const handleReportAbuseSubmit = async () => {
        if (!reportTitle.trim() || !reportDescription.trim()) {
            toast({ title: "Error", description: "Title and description are required.", variant: "destructive" });
            return;
        }
        setIsSubmittingReport(true);
        const studentId = localStorage.getItem('userEmail') || 'anonymous';
        const studentName = localStorage.getItem('userName') || 'Anonymous';
        
        await reportAbuse({
            title: reportTitle,
            description: reportDescription,
            reportedByStudentId: studentId,
            reportedByName: studentName,
        });

        toast({
            title: "Issue Reported",
            description: "Your report has been submitted anonymously to the administrator.",
        });
        setIsSubmittingReport(false);
        setReportAbuseDialogOpen(false);
        setReportTitle('');
        setReportDescription('');
    };
    
    const industrialSupervisor = { name: 'Mr. John Smith', avatarUrl: 'https://placehold.co/100x100.png', role: 'Industrial Supervisor' };
    const facultyLecturer = { name: 'Dr. Elara Vance', avatarUrl: 'https://placehold.co/100x100.png', role: 'Faculty Lecturer' };

    return (
        <>
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-yellow-900 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Welcome back, {userName.split(' ')[0]}!</h2>
                    <p className="opacity-90 text-sm">You have 2 pending tasks and 1 report to submit today.</p>
                </div>
                <div className="flex-shrink-0 mt-3 md:mt-0">
                    {isCheckedInToday ? (
                        <Link href="/student/tasks" passHref>
                            <Button className="bg-white text-yellow-900 hover:bg-white/90 font-medium transition rounded-lg px-4 py-2 text-sm">
                                <ListChecks className="mr-2 h-4 w-4" /> View Tasks
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/student/check-in" passHref>
                            <Button variant="destructive" className="font-medium transition rounded-lg px-4 py-2 text-sm animate-pulse">
                                <MapPin className="mr-2 h-4 w-4" /> Check-in Now
                            </Button>
                        </Link>
                    )}
                </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatsCard title="Days Completed" value="14" icon={CalendarCheck} progress={15.5} progressLabel="Total Days: 90" iconBgColor="bg-indigo-100 dark:bg-indigo-900/70" iconColor="text-indigo-600 dark:text-indigo-300" />
                <DashboardStatsCard title="Reports Submitted" value="12" icon={FileTextLucide} detail={<span>Approved: 10 <span className="text-green-600">(83.3%)</span></span>} iconBgColor="bg-green-100 dark:bg-green-900/70" iconColor="text-green-600 dark:text-green-300" />
                <DashboardStatsCard title="Supervisor Rating" value="4.8" icon={StarIcon} detail={
                <div className="flex items-center text-xs">
                    <div className="flex text-yellow-400"> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" stroke="currentColor" strokeWidth={1} className="w-3 h-3 text-yellow-400/80"/></div>
                    <span className="ml-1 text-muted-foreground">(12 reviews)</span>
                </div>
                } iconBgColor="bg-yellow-100 dark:bg-yellow-900/70" iconColor="text-yellow-600 dark:text-yellow-300" />
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
                    <StudentTaskItem title="Complete project documentation" description="Submit final version to supervisor" status="Completed" dueDate="Today 5:00 PM" />
                    <StudentTaskItem title="Attend team meeting" description="Discuss project milestones" status="Pending" dueDate="Today 2:00 PM" />
                    <StudentTaskItem title="Submit daily report" description="Include all completed tasks" status="Overdue" dueDate="Today 12:00 PM" />
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-4 border-t border-border">
                        <Link href="/student/tasks/new" className="w-full">
                            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
                                <PlusCircle className="mr-2 h-4 w-4"/> Add New Task
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                    <CardHeader className="border-b border-border">
                    <CardTitle className="font-headline text-lg">Log Work / Quick Report</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="report-date" className="block text-sm font-medium text-foreground mb-1">Date</label>
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
                                <label htmlFor="attachment-file" className="block text-sm font-medium text-foreground mb-1">Attachment (Optional)</label>
                                <Input id="attachment-file" type="file" className="text-xs border-input text-foreground file:text-foreground rounded-lg"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="work-summary" className="block text-sm font-medium text-foreground mb-1">Work Summary</label>
                            <Textarea id="work-summary" value={reportSummary} onChange={(e) => setReportSummary(e.target.value)} placeholder="Briefly describe what you accomplished..." rows={3} className="border-input text-foreground rounded-lg" />
                        </div>
                        <div className="flex justify-center space-x-2">
                            <Button variant="outline" className="border-input text-foreground hover:bg-muted hover:text-muted-foreground rounded-lg" onClick={() => toast({title: "Draft Saved!", description: "Your quick report draft has been saved."})}>Save Draft</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg" onClick={handleQuickReportSubmit}>
                                Submit Quick Report
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">For a detailed submission, go to <Link href="/student/reports/new" className="text-primary hover:underline">Full Report Page</Link>.</p>
                    </CardContent>
                </Card>
                </div>
                
                <div className="space-y-6">
                    <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="font-headline text-lg flex items-center">
                                <MapPin className="mr-2 h-5 w-5 text-primary"/> Check-in Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center">
                                <ChartContainer config={studentCheckInChartConfig} className="mx-auto aspect-square h-[120px]">
                                <PieChart accessibilityLayer>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel className="text-xs bg-popover text-popover-foreground border-border" />} />
                                    <Pie data={studentCheckInChartData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={50} strokeWidth={2}>
                                    <Cell fill={isCheckedInToday ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} radius={8}/>
                                    </Pie>
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`fill-current ${isCheckedInToday ? 'text-primary' : 'text-muted-foreground'} text-lg font-bold`}>
                                        {isCheckedInToday ? 'Done' : 'N/A'}
                                    </text>
                                </PieChart>
                                </ChartContainer>
                                <div className="text-center mt-2">
                                <h4 className="font-medium text-base text-foreground">{isCheckedInToday ? "Checked In for Today!" : "Awaiting Check-in"}</h4>
                                {isCheckedInToday && checkinDetails && (
                                    <p className="text-muted-foreground text-xs mt-0.5">{checkinDetails.time} at {checkinDetails.location.substring(0, 25) + (checkinDetails.location.length > 25 ? '...' : '')}</p>
                                )}
                                {!isCheckedInToday && (
                                     <p className="text-muted-foreground text-xs mt-0.5">Verify your location for attendance.</p>
                                )}
                                </div>
                                <Link href="/student/check-in" className="w-full">
                                    <Button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                                        {isCheckedInToday ? "View Check-in" : "Check-in Now"}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg rounded-xl bg-destructive/10 border-destructive/30 text-destructive-foreground">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center text-destructive"><AlertCircle className="mr-2 h-5 w-5"/> Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive-foreground/90">If you are facing any issues or grievances at your workplace, please report it immediately.</p>
                        </CardContent>
                        <CardFooter>
                            <Dialog open={reportAbuseDialogOpen} onOpenChange={setReportAbuseDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full rounded-lg">
                                        <ShieldAlert className="mr-2 h-4 w-4"/> Report an Issue
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Report an Issue or Grievance</DialogTitle>
                                        <DialogDescription>
                                            Your report will be sent to the university administrator for review. Please be as detailed as possible.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="report-title">Title</Label>
                                            <Input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g., Unsafe working conditions" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="report-description">Description</Label>
                                            <Textarea id="report-description" value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe the issue in detail..." rows={5}/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="button" onClick={handleReportAbuseSubmit} disabled={isSubmittingReport}>
                                            {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Submit Report
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
                            <CardTitle className="font-headline text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Industrial Supervisor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={industrialSupervisor.avatarUrl} alt={industrialSupervisor.name} data-ai-hint="person office" />
                                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(industrialSupervisor.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{industrialSupervisor.name}</p>
                                    <p className="text-xs text-muted-foreground">{industrialSupervisor.role}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 border-t border-border">
                             <Link href="/communication" className="w-full">
                                <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted">
                                    <Contact className="mr-2 h-4 w-4"/> Contact Supervisor
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="font-headline text-lg flex items-center"><SchoolIcon className="mr-2 h-5 w-5 text-primary"/>Assigned Lecturer</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                             <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={facultyLecturer.avatarUrl} alt={facultyLecturer.name} data-ai-hint="person academic" />
                                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(facultyLecturer.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{facultyLecturer.name}</p>
                                    <p className="text-xs text-muted-foreground">{facultyLecturer.role}</p>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter className="p-4 border-t border-border">
                            <Link href="/communication" className="w-full">
                                <Button variant="outline" className="w-full rounded-lg border-input text-foreground hover:bg-muted">
                                    <Contact className="mr-2 h-4 w-4"/> Contact Lecturer
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
            </div>
        </>
    );
}

export default function DashboardPage() {
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Student' : 'Student';
    return (
        <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
            <PageHeader
                title="Student Dashboard"
                description="Welcome to your InternHub student dashboard."
                icon={LayoutDashboard}
            />
            <StudentDashboard userName={userName} />
        </div>
    );
}
