
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { 
    LayoutDashboard, User, Briefcase, Building, CalendarCheck, FileTextIcon as FileTextLucide, MapPinIcon, StarIcon, ClockIcon, UploadCloudIcon, AlertOctagonIcon, UsersIcon, SchoolIcon, CheckCircle2, CircleDot, Circle, MessageSquare, PlusCircle, CalendarIcon as CalendarDays // Renamed CalendarIcon to CalendarDays due to conflict
} from 'lucide-react';
import type { UserRole } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants'; // Assuming FACULTIES & DEPARTMENTS might be used later
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// import { CalendarIcon } from 'lucide-react'; // This was causing a name collision
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

const DUMMY_USER = { name: 'John Doe' }; // From mockup

const DashboardStatsCard: React.FC<{ title: string; value: string; icon: React.ElementType; progress?: number; progressLabel?: string; detail?: React.ReactNode; iconBgColor?: string; iconColor?: string }> = ({ title, value, icon: Icon, progress, progressLabel, detail, iconBgColor = "bg-blue-100 dark:bg-blue-900", iconColor = "text-blue-600 dark:text-blue-300" }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div>
          <CardDescription className="text-sm">{title}</CardDescription>
          <CardTitle className="text-2xl font-bold mt-1">{value}</CardTitle>
        </div>
        <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {progress !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">{progressLabel}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      {detail && (
        typeof detail === 'string' ?
        <p className="text-xs text-muted-foreground mt-2">{detail}</p> :
        <div className="text-xs text-muted-foreground mt-2">{detail}</div>
      )}
    </CardContent>
  </Card>
);

const TaskItem: React.FC<{ title: string; description: string; status: 'Completed' | 'Pending' | 'Overdue'; dueDate: string, statusIcon?: React.ElementType }> = ({ title, description, status, dueDate, statusIcon: StatusIcon = Circle }) => {
  const statusColors = {
    Completed: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
    Overdue: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
  };
  const Icon = status === 'Completed' ? CheckCircle2 : status === 'Pending' ? CircleDot : AlertOctagonIcon; // Used AlertOctagon for Overdue

  return (
    <div className="p-4 flex items-start">
        <div className="flex-shrink-0 mt-1">
            <Icon className={`h-5 w-5 ${status === 'Completed' ? 'text-green-500 dark:text-green-400' : status === 'Pending' ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`} />
        </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
          <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>{status}</Badge>
        </div>
        <p className="text-muted-foreground text-xs mt-1">{description}</p>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <ClockIcon className="mr-1 h-3 w-3" />
          <span>{dueDate}</span>
        </div>
      </div>
    </div>
  );
};

const DeadlineItem: React.FC<{title: string; dueText: string; date: string; icon: React.ElementType; iconBg: string; iconColor: string}> = ({ title, dueText, date, icon: Icon, iconBg, iconColor}) => (
    <div className="p-3">
        <div className="flex items-start">
            <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="ml-3">
                <h4 className="font-medium text-sm text-foreground">{title}</h4>
                <p className="text-muted-foreground text-xs mt-0.5">{dueText}</p>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    <span>{date}</span>
                </div>
            </div>
        </div>
    </div>
);

const FeedbackItem: React.FC<{name: string; role: string; comment: string; time: string; avatarUrl?: string; avatarFallback: string; icon: React.ElementType; status?: 'Approved' | 'Pending'}> = ({name, role, comment, time, avatarUrl, avatarFallback, icon: Icon, status}) => {
    const statusColors = {
        Approved: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return(
    <div className="flex items-start">
        <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
            <AvatarFallback className="bg-primary/20 text-primary">{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
            <div className="flex items-center">
                <h4 className="font-medium text-sm text-foreground">{name}</h4>
                {status && <Badge variant="outline" className={`ml-2 text-xs ${statusColors[status!]}`}>{status}</Badge>}
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{role}</p>
            <div className="mt-1 text-xs text-foreground/80 bg-muted/50 p-2 rounded-md">
                "{comment}"
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <ClockIcon className="mr-1 h-3 w-3" />
                <span>{time}</span>
            </div>
        </div>
    </div>
)};


const checkInChartData = [{ name: 'Checked In', value: 92, fill: 'hsl(var(--primary))' }, { name: 'Remaining', value: 8, fill: 'hsl(var(--muted))' }];
const checkInChartConfig = { "Checked In": { label: "Checked In" }, "Remaining": { label: "Remaining" } };


export default function DashboardPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reportDate, setReportDate] = React.useState<Date | undefined>(new Date());
  const [reportSummary, setReportSummary] = React.useState('');

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole || 'STUDENT'); 
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    // TODO: Make a nice loading skeleton here
    return <div className="p-6 text-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/70 rounded-xl p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, {DUMMY_USER.name}!</h2>
            <p className="opacity-90 text-sm">You have 2 pending tasks and 1 report to submit today.</p>
          </div>
          <Link href="/tasks" passHref>
            <Button className="mt-3 md:mt-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition shrink-0">
              View Tasks
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatsCard title="Days Completed" value="14" icon={CalendarCheck} progress={15.5} progressLabel="Total Days: 90" iconBgColor="bg-blue-100 dark:bg-blue-900/70" iconColor="text-blue-600 dark:text-blue-300" />
        <DashboardStatsCard title="Reports Submitted" value="12" icon={FileTextLucide} detail="Approved: 10 (83.3%)" iconBgColor="bg-green-100 dark:bg-green-900/70" iconColor="text-green-600 dark:text-green-300" />
        <DashboardStatsCard title="Check-in Rate" value="92%" icon={MapPinIcon} detail="Last Check-in: Today (On Time)" iconBgColor="bg-orange-100 dark:bg-orange-900/70" iconColor="text-orange-600 dark:text-orange-300" />
        <DashboardStatsCard title="Supervisor Rating" value="4.8" icon={StarIcon} detail={
          <div className="flex items-center text-xs">
            <div className="flex text-yellow-400"> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon fill="currentColor" className="w-3 h-3"/> <StarIcon className="w-3 h-3"/></div>
            <span className="ml-1 text-muted-foreground">(12 reviews)</span>
          </div>
        } iconBgColor="bg-yellow-100 dark:bg-yellow-900/70" iconColor="text-yellow-500 dark:text-yellow-300" />
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
            <CardHeader className="border-b border-border flex flex-row justify-between items-center">
              <CardTitle className="font-headline text-lg">Today's Tasks</CardTitle>
              <Link href="/tasks" passHref>
                <Button variant="link" className="text-primary hover:text-primary/80">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              <TaskItem title="Complete project documentation" description="Submit final version to supervisor" status="Completed" dueDate="Today 5:00 PM" />
              <TaskItem title="Attend team meeting" description="Discuss project milestones" status="Pending" dueDate="Today 2:00 PM" />
              <TaskItem title="Submit daily report" description="Include all completed tasks" status="Overdue" dueDate="Today 12:00 PM" />
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 border-t border-border">
                <Link href="/tasks/new" className="w-full">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add New Task
                    </Button>
                </Link>
            </CardFooter>
          </Card>

          {/* Simplified Log Work Section */}
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
                                className="w-full justify-start text-left font-normal border-input text-foreground"
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
                        <Input id="attachment-file" type="file" className="text-xs border-input text-foreground file:text-foreground"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="work-summary" className="block text-sm font-medium text-foreground mb-1">Work Summary</label>
                    <Textarea id="work-summary" value={reportSummary} onChange={(e) => setReportSummary(e.target.value)} placeholder="Briefly describe what you accomplished..." rows={3} className="border-input text-foreground" />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" className="border-input text-foreground hover:bg-accent hover:text-accent-foreground">Save Draft</Button>
                    <Link href="/reports/new" passHref>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Submit Full Report
                        </Button>
                    </Link>
                </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Check-in Status */}
          <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-headline text-lg">Check-in Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <ChartContainer config={checkInChartConfig} className="mx-auto aspect-square h-[120px]">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent hideLabel className="text-xs bg-popover text-popover-foreground border-border" />} />
                    <Pie data={checkInChartData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={50} strokeWidth={2}>
                      <Cell fill="var(--color-primary)" radius={8}/>
                      <Cell fill="var(--color-muted)" radius={8}/>
                    </Pie>
                     <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-lg font-bold">
                        92%
                     </text>
                  </PieChart>
                </ChartContainer>
                <div className="text-center mt-2">
                  <h4 className="font-medium text-base text-foreground">On-site Attendance</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">12 of 14 days checked in</p>
                </div>
                <Button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground">Check-in Now</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Deadlines */}
          <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-headline text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
                <DeadlineItem title="Final Project Submission" dueText="Due in 3 days" date="June 15, 2024" icon={AlertOctagonIcon} iconBg="bg-red-100 dark:bg-red-900/70" iconColor="text-red-600 dark:text-red-300" />
                <DeadlineItem title="Mid-term Evaluation" dueText="Due in 7 days" date="June 19, 2024" icon={FileTextLucide} iconBg="bg-yellow-100 dark:bg-yellow-900/70" iconColor="text-yellow-600 dark:text-yellow-300" />
                <DeadlineItem title="Team Presentation" dueText="Due in 10 days" date="June 22, 2024" icon={UsersIcon} iconBg="bg-blue-100 dark:bg-blue-900/70" iconColor="text-blue-600 dark:text-blue-300" />
            </CardContent>
          </Card>
          
          {/* Recent Feedback */}
          <Card className="shadow-lg rounded-xl overflow-hidden bg-card text-card-foreground">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-headline text-lg">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <FeedbackItem name="Mr. Smith" role="Company Supervisor" comment="Great progress on the documentation. Just a few minor corrections needed on section 3.2." time="2 hours ago" avatarUrl="https://placehold.co/100x100.png?text=MS" avatarFallback="MS" icon={Briefcase} status="Approved"/>
                <FeedbackItem name="Prof. Johnson" role="Faculty Lecturer" comment="Please provide more details about the team collaboration aspect in your next report." time="1 day ago" avatarUrl="https://placehold.co/100x100.png?text=PJ" avatarFallback="PJ" icon={SchoolIcon} status="Pending"/>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
