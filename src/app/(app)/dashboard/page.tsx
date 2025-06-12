
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { 
    LayoutDashboard, User, Briefcase, Building, CalendarCheck, FileText as FileTextLucide, MapPinIcon, StarIcon, ClockIcon, AlertOctagonIcon, UsersIcon, SchoolIcon, CheckCircle2, CircleDot, PlusCircle, CalendarDays, UploadCloud, Edit, MessageSquarePlus, BarChart3, SettingsIcon, UserCheck, FileUp, Users2, Activity, CheckSquare, Contact, Eye
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
    
    const studentCheckInChartData = isCheckedInToday 
        ? [{ name: 'Checked In', value: 100, fill: 'hsl(var(--primary))' }]
        : [{ name: 'Not Checked In', value: 100, fill: 'hsl(var(--muted))' }];
    
    const studentCheckInChartConfig = isCheckedInToday
        ? { "Checked In": { label: "Checked In" } }
        : { "Not Checked In": { label: "Not Checked In" } };


    const handleQuickReportSubmit = () => {
        if (!reportSummary.trim()) {
            toast({ title: "Error", description: "Work summary cannot be empty.", variant: "destructive"});
            return;
        }
        toast({ title: "Quick Report Submitted!", description: `Summary for ${format(reportDate!, "PPP")} recorded.`});
        setReportSummary('');
    };
    
    const companySupervisor = { name: 'Mr. John Smith', avatarUrl: 'https://placehold.co/100x100.png', role: 'Company Supervisor' };
    const facultyLecturer = { name: 'Dr. Elara Vance', avatarUrl: 'https://placehold.co/100x100.png', role: 'Faculty Lecturer' };

    return (
        <>
            <Card className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Welcome back, {userName.split(' ')[0]}!</h2>
                    <p className="opacity-90 text-sm">You have 2 pending tasks and 1 report to submit today.</p>
                </div>
                <Link href="/student/tasks" passHref>
                    <Button className="mt-3 md:mt-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition shrink-0 rounded-lg">
                    View Tasks
                    </Button>
                </Link>
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
                        <div className="flex justify-end space-x-2">
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
                                <MapPinIcon className="mr-2 h-5 w-5 text-primary"/> Check-in Status
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
                    
                    <Card className="shadow-lg rounded-xl bg-card text-card-foreground">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="font-headline text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Company Supervisor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={companySupervisor.avatarUrl} alt={companySupervisor.name} data-ai-hint="person office" />
                                    <AvatarFallback className="bg-primary/20 text-primary">{getInitials(companySupervisor.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{companySupervisor.name}</p>
                                    <p className="text-xs text-muted-foreground">{companySupervisor.role}</p>
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
            </div>
        </>
    );
}

interface AssignedStudent {
  id: string; name: string; department: string; avatar: string; dataAiHint: string; overdueTasks: number; pendingReports: number;
}
interface SupervisorIntern {
  id: string; name: string; university: string; avatar: string; dataAiHint: string; pendingTasks: number; pendingReports: number;
}
interface HODStudent {
  id: string; name: string; avatarUrl: string; faculty: string; department: string; compliance: string; issues: number;
}

const LecturerStudentCardMobile: React.FC<{ student: AssignedStudent }> = ({ student }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{student.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{student.department}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 space-y-1.5 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Overdue Tasks:</span>
        <Badge variant={student.overdueTasks > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{student.overdueTasks}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Reports:</span>
        <Badge variant={student.pendingReports > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{student.pendingReports}</Badge>
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t bg-muted/20">
      <Link href={`/assignments/student/${student.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

const SupervisorInternCardMobile: React.FC<{ intern: SupervisorIntern }> = ({ intern }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint={intern.dataAiHint} />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(intern.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{intern.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{intern.university}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 space-y-1.5 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Tasks:</span>
        <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{intern.pendingTasks}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Reports:</span>
        <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{intern.pendingReports}</Badge>
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t bg-muted/20">
      <Link href={`/supervisor/interns/details/${intern.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

const HODStudentCardMobile: React.FC<{ student: HODStudent }> = ({ student }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person student" />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{student.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{student.department}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 space-y-1.5 text-xs">
      <div className="flex items-center gap-1.5"><SchoolIcon className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Faculty:</span> {student.faculty}</div>
      <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Compliance:</span> {student.compliance}</div>
      <Progress value={parseInt(student.compliance)} className="h-1.5 mt-1" />
      <div className="flex items-center gap-1.5"><AlertOctagonIcon className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Open Issues:</span> <Badge variant={student.issues > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{student.issues}</Badge></div>
    </CardContent>
    <CardFooter className="p-3 border-t bg-muted/20">
      <Link href={`/analytics?studentId=${student.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
        </Button>
      </Link>
    </CardFooter>
  </Card>
);


const LecturerDashboard: React.FC<{ userName: string }> = ({ userName }) => {
    const isMobile = useIsMobile();
    const assignedStudents: AssignedStudent[] = [
        { id: 'std1', name: 'Alice Wonderland', department: 'Software Engineering', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 1, pendingReports: 0 },
        { id: 'std2', name: 'Bob The Intern', department: 'Mechanical Engineering', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 0, pendingReports: 1 },
        { id: 'std3', name: 'Charlie Brown', department: 'Marketing', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 2, pendingReports: 2 },
    ];
    return (
        <>
            <Card className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-1">Welcome, {userName.split(' ')[0]}!</h2>
                <p className="opacity-90 text-sm">Oversee your assigned students and their progress.</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatsCard title="Assigned Students" value={assignedStudents.length} icon={UsersIcon} iconBgColor="bg-blue-100 dark:bg-blue-900" iconColor="text-blue-500 dark:text-blue-300" actionLink="/assignments" actionLabel="Manage Assignments"/>
                <DashboardStatsCard title="Pending Reviews" value="3" icon={FileUp} detail="2 Reports, 1 Task" iconBgColor="bg-yellow-100 dark:bg-yellow-900" iconColor="text-yellow-500 dark:text-yellow-300" actionLink="/assignments" actionLabel="View Pending Items" />
                <DashboardStatsCard title="Overdue Items" value="2" icon={AlertOctagonIcon} detail="Students with late submissions" iconBgColor="bg-red-100 dark:bg-red-900" iconColor="text-red-500 dark:text-red-300" actionLink="/analytics" actionLabel="View Compliance"/>
            </div>
            <Card className="shadow-lg rounded-xl mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">My Students</CardTitle>
                    <CardDescription>Quick overview of students you are supervising.</CardDescription>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
                    {isMobile ? (
                        assignedStudents.map(student => <LecturerStudentCardMobile key={student.id} student={student} />)
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-center">Overdue Tasks</TableHead>
                                    <TableHead className="text-center">Pending Reports</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignedStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
                                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{student.department}</TableCell>
                                        <TableCell className="text-center"><Badge variant={student.overdueTasks > 0 ? "destructive" : "secondary"}>{student.overdueTasks}</Badge></TableCell>
                                        <TableCell className="text-center"><Badge variant={student.pendingReports > 0 ? "destructive" : "secondary"}>{student.pendingReports}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/assignments/student/${student.id}`} passHref>
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 <CardFooter className="justify-end p-4 border-t">
                    <Button variant="outline" size="sm" asChild><Link href="/assignments">View All Students</Link></Button>
                </CardFooter>
            </Card>
        </>
    );
}

const SupervisorDashboard: React.FC<{ userName: string }> = ({ userName }) => {
    const isMobile = useIsMobile();
    const supervisedInterns: SupervisorIntern[] = [
        { id: 'intern1', name: 'Samuel Green', university: 'State University - CompSci', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', pendingTasks: 2, pendingReports: 1 },
        { id: 'intern2', name: 'Olivia Blue', university: 'Tech Institute - Design', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', pendingTasks: 0, pendingReports: 0 },
    ];
    return (
        <>
            <Card className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground shadow-lg">
                <h2 className="text-2xl font-bold mb-1">Welcome, {userName.split(' ')[0]}!</h2>
                <p className="opacity-90 text-sm">Manage your assigned interns and their submissions.</p>
            </Card>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatsCard title="Assigned Interns" value={supervisedInterns.length} icon={Users2} iconBgColor="bg-green-100 dark:bg-green-900" iconColor="text-green-500 dark:text-green-300" actionLink="/supervisor/interns" actionLabel="View My Interns"/>
                <DashboardStatsCard title="Pending Approvals" value="4" icon={CheckSquare} detail="3 Tasks, 1 Report" iconBgColor="bg-orange-100 dark:bg-orange-900" iconColor="text-orange-500 dark:text-orange-300" actionLink="/supervisor/interns/approve-reports" actionLabel="Review Submissions" />
                <DashboardStatsCard title="Intern Activity" value="High" icon={Activity} detail="Most interns active daily" iconBgColor="bg-purple-100 dark:bg-purple-900" iconColor="text-purple-500 dark:text-purple-300" actionLink="/supervisor/interns" actionLabel="Monitor Activity" />
            </div>
            <Card className="shadow-lg rounded-xl mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">My Interns</CardTitle>
                    <CardDescription>Quick overview of interns you are supervising.</CardDescription>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
                    {isMobile ? (
                        supervisedInterns.map(intern => <SupervisorInternCardMobile key={intern.id} intern={intern} />)
                    ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Intern</TableHead>
                                <TableHead>University/Program</TableHead>
                                <TableHead className="text-center">Pending Tasks</TableHead>
                                <TableHead className="text-center">Pending Reports</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisedInterns.map(intern => (
                                <TableRow key={intern.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint={intern.dataAiHint} />
                                                <AvatarFallback>{getInitials(intern.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{intern.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{intern.university}</TableCell>
                                    <TableCell className="text-center"><Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>{intern.pendingTasks}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"}>{intern.pendingReports}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/supervisor/interns/details/${intern.id}`} passHref>
                                            <Button variant="ghost" size="sm">View Profile</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
                 <CardFooter className="justify-end p-4 border-t">
                    <Button variant="outline" size="sm" asChild><Link href="/supervisor/interns">View All Interns</Link></Button>
                </CardFooter>
            </Card>
        </>
    );
}

const HODDashboard: React.FC<{ userName: string }> = ({ userName }) => {
    const isMobile = useIsMobile();
    const hodFacultyId = FACULTIES.length > 0 ? FACULTIES[0].id : '';
    const hodDepartment = DEPARTMENTS.find(d => d.facultyId === hodFacultyId);
    const hodDepartmentId = hodDepartment ? hodDepartment.id : '';
    const hodDepartmentName = hodDepartment ? hodDepartment.name : 'N/A';

    const departmentStudents: HODStudent[] = DUMMY_STUDENTS_DATA.filter(student => 
        student.department === hodDepartmentName 
    ).map(student => ({ 
        ...student,
        faculty: FACULTIES.find(f => f.id === hodFacultyId)?.name || 'N/A',
        compliance: `${Math.floor(Math.random() * 30) + 70}%`, 
        issues: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0 
    }));


    return (
        <>
            <Card className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Welcome, {userName.split(' ')[0]}!</h2>
                        <p className="opacity-90 text-sm">Departmental Internship Overview: {hodDepartmentName}</p>
                    </div>
                    <Link href="/analytics" passHref>
                        <Button className="mt-3 md:mt-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition shrink-0 rounded-lg">
                            View Full Analytics
                        </Button>
                    </Link>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatsCard title="Total Interns (Dept.)" value={departmentStudents.length} icon={UsersIcon} iconBgColor="bg-indigo-100 dark:bg-indigo-900" iconColor="text-indigo-500 dark:text-indigo-300" actionLink="/analytics" actionLabel="View Student List"/>
                <DashboardStatsCard title="Compliance Rate (Dept.)" value="88%" icon={CheckCircle2} detail="Avg. report & check-in" iconBgColor="bg-teal-100 dark:bg-teal-900" iconColor="text-teal-500 dark:text-teal-300" actionLink="/analytics" actionLabel="Detailed Compliance Report"/>
                <DashboardStatsCard title="Students with Issues" value={departmentStudents.filter(s=>s.issues > 0).length} icon={AlertOctagonIcon} detail="Needs attention" iconBgColor="bg-amber-100 dark:bg-amber-900" iconColor="text-amber-500 dark:text-amber-300" actionLink="/analytics" actionLabel="View Issue Log"/>
            </div>
            
            <Card className="shadow-lg rounded-xl mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">{hodDepartmentName} Student Overview</CardTitle>
                    <CardDescription>Summary of student progress within your department.</CardDescription>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
                    {isMobile ? (
                        departmentStudents.map(student => <HODStudentCardMobile key={student.id} student={student} />)
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Compliance</TableHead>
                                    <TableHead className="text-center">Open Issues</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departmentStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person student" />
                                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{student.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{FACULTIES.find(f => f.id === hodFacultyId)?.name || 'N/A'}</TableCell>
                                        <TableCell><Progress value={parseInt(student.compliance)} className="h-2" /> <span className="text-xs">{student.compliance}</span></TableCell>
                                        <TableCell className="text-center"><Badge variant={student.issues > 0 ? "destructive" : "default"}>{student.issues}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/analytics?studentId=${student.id}`} passHref> 
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter className="p-4 border-t">
                     <Link href="/assignments" className="w-full sm:w-auto mr-auto">
                        <Button variant="outline" className="w-full sm:w-auto rounded-lg">
                            Manage Assignments
                        </Button>
                    </Link>
                     <Link href="/analytics" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
                            <BarChart3 className="mr-2 h-4 w-4"/> Go to Department Analytics
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </>
    );
}


export default function DashboardPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userName, setUserName] = React.useState('User');

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    const storedName = typeof window !== "undefined" ? localStorage.getItem('userName') : 'User';
    setUserRole(storedRole || 'STUDENT'); 
    setUserName(storedName || 'User');
    setIsLoading(false);
  }, []);
  
  const renderDashboardContent = () => {
    switch (userRole) {
      case 'STUDENT':
        return <StudentDashboard userName={userName} />;
      case 'LECTURER':
        return <LecturerDashboard userName={userName} />;
      case 'SUPERVISOR':
        return <SupervisorDashboard userName={userName} />;
      case 'HOD':
        return <HODDashboard userName={userName} />;
      default:
        // For ADMIN, the dashboard is at /admin/dashboard
        // This page might redirect or show a generic message if an ADMIN lands here directly.
        if (userRole === 'ADMIN') {
            return <div className="text-center p-8"><p>Redirecting to Admin Dashboard...</p><script>{`setTimeout(() => window.location.href = '/admin/dashboard', 100);`}</script></div>;
        }
        return <div className="text-center p-8"><p>No dashboard available for this role or role not identified.</p></div>;
    }
  };

  if (isLoading) {
    return <div className="p-6 text-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
        <PageHeader
            title={`${USER_ROLES[userRole!] || 'User'} Dashboard`}
            description={`Welcome to your InternshipTrack ${USER_ROLES[userRole!]?.toLowerCase()} dashboard.`}
            icon={LayoutDashboard}
        />
        {renderDashboardContent()}
    </div>
  );
}
