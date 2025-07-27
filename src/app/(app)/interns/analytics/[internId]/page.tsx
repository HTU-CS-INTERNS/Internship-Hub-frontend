
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { BarChart3, User, Loader2, AlertTriangle, CheckCircle, FileText, ListChecks, Activity, MapPin, MessageSquare, CheckSquare as CheckSquareIcon } from 'lucide-react';
import { DUMMY_INTERNS } from '@/app/(app)/interns/page';
import { DUMMY_REPORTS } from '@/lib/constants'; // Corrected import
import type { DailyReport } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

// Dummy task data for the intern for analytics
const DUMMY_TASK_ANALYTICS = [
  { month: "Jan", completed: 20, pending: 5, overdue: 2 },
  { month: "Feb", completed: 25, pending: 3, overdue: 1 },
  { month: "Mar", completed: 22, pending: 6, overdue: 3 },
  { month: "Apr", completed: 28, pending: 2, overdue: 0 },
];

const taskChartConfig = {
  completed: { label: "Completed", color: "hsl(var(--chart-3))" },
  pending: { label: "Pending", color: "hsl(var(--chart-4))" },
  overdue: { label: "Overdue", color: "hsl(var(--destructive))" },
};

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'report_submitted' | 'report_approved' | 'report_rejected' | 'task_declared' | 'task_completed' | 'check_in' | 'feedback_received' | 'communication';
  description: string;
  details?: string; 
}

const DUMMY_ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: 'act1', timestamp: subDays(new Date(), 1), type: 'report_submitted', description: 'Submitted Weekly Report #4', details: 'Covered X, Y, Z activities.' },
  { id: 'act2', timestamp: subDays(new Date(), 1), type: 'check_in', description: 'Checked in at Acme Corp HQ', details: 'Location verified via GPS.' },
  { id: 'act3', timestamp: subDays(new Date(), 2), type: 'task_completed', description: 'Completed task: API Integration', details: 'All endpoints functional.' },
  { id: 'act4', timestamp: subDays(new Date(), 3), type: 'feedback_received', description: 'Feedback received on Report #3', details: 'Supervisor: "Good progress, minor revisions needed."' },
  { id: 'act5', timestamp: subDays(new Date(), 3), type: 'report_approved', description: 'Report #3: Mid-term Review Prep approved' },
  { id: 'act6', timestamp: subDays(new Date(), 5), type: 'communication', description: 'Messaged Dr. Carter about project scope' },
  { id: 'act7', timestamp: subDays(new Date(), 6), type: 'task_declared', description: 'Declared task: Research new charting libraries'},
];

const activityIconMap: Record<ActivityLogEntry['type'], React.ElementType> = {
  report_submitted: FileText,
  report_approved: CheckCircle,
  report_rejected: AlertTriangle,
  task_declared: ListChecks,
  task_completed: CheckSquareIcon,
  check_in: MapPin,
  feedback_received: MessageSquare,
  communication: MessageSquare,
};


export default function InternAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  
  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [internReports, setInternReports] = React.useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activityLog] = React.useState<ActivityLogEntry[]>(DUMMY_ACTIVITY_LOG);

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setIntern(foundIntern);
      const reports = DUMMY_REPORTS.filter(report => {
        if (foundIntern.id === 'intern1') return report.studentId === 'stu1'; // Example mapping
        // Add other mappings if internId structure differs from studentId in reports
        return false;
      });
      setInternReports(reports);
    }
    setIsLoading(false);
  }, [internId]);

  const reportStatusCounts = React.useMemo(() => {
    const counts: Record<DailyReport['status'], number> = { APPROVED: 0, PENDING: 0, REJECTED: 0, SUBMITTED: 0 };
    internReports.forEach(report => {
      counts[report.status]++;
    });
    return counts;
  }, [internReports]);

  const reportStatusChartData = [
    { name: 'Approved', value: reportStatusCounts.APPROVED, fill: 'hsl(var(--chart-3))' },
    { name: 'Submitted', value: reportStatusCounts.SUBMITTED, fill: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: reportStatusCounts.PENDING, fill: 'hsl(var(--chart-4))' },
    { name: 'Rejected', value: reportStatusCounts.REJECTED, fill: 'hsl(var(--destructive))' },
  ].filter(item => item.value > 0);

  const reportChartConfig = {
    approved: { label: "Approved", color: "hsl(var(--chart-3))" },
    submitted: { label: "Submitted", color: "hsl(var(--chart-1))" },
    pending: { label: "Pending", color: "hsl(var(--chart-4))" },
    rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
  };

  const totalReports = internReports.length;
  const approvalRate = totalReports > 0 ? (reportStatusCounts.APPROVED / totalReports) * 100 : 0;
  const totalTasksCompleted = DUMMY_TASK_ANALYTICS.reduce((sum, item) => sum + item.completed, 0);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="p-6">
        <PageHeader
          title="Analytics Not Found"
          icon={AlertTriangle}
          breadcrumbs={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/interns", label: "My Interns" },
            { label: "Error" }
          ]}
        />
        <Card className="shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
                <p className="text-lg text-destructive-foreground">Intern details not found for ID: {internId}.</p>
                <Link href="/interns" passHref>
                    <Button variant="outline" className="mt-4">Back to Interns List</Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Performance Analytics: ${intern.name}`}
        description={`Detailed performance metrics and trends for ${intern.name}.`}
        icon={BarChart3}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/interns", label: "My Interns" },
          { href: `/interns/details/${intern.id}`, label: intern.name },
          { label: "Analytics" }
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">{reportStatusCounts.APPROVED} approved</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <Progress value={approvalRate} className="h-2 mt-1 bg-muted" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed (Sim.)</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalTasksCompleted}</div>
            <p className="text-xs text-muted-foreground">Across {DUMMY_TASK_ANALYTICS.length} months</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Task Performance Over Time (Simulated)</CardTitle>
            <CardDescription>Monthly trend of task statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taskChartConfig} className="h-[250px] md:h-[300px] w-full">
              <BarChart data={DUMMY_TASK_ANALYTICS} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
                <Bar dataKey="overdue" fill="var(--color-overdue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Report Status Distribution</CardTitle>
            <CardDescription>Overall distribution of submitted report statuses.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             {reportStatusChartData.length > 0 ? (
                <ChartContainer config={reportChartConfig} className="h-[250px] md:h-[300px] w-full max-w-[400px]">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={reportStatusChartData} dataKey="value" nameKey="name" cy="50%" outerRadius={100}>
                        {reportStatusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" className="mt-4" />} />
                    </PieChart>
                </ResponsiveContainer>
                </ChartContainer>
             ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
                    <p>No report data available for charts.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-xl rounded-xl">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Recent Activity Log</CardTitle>
            <CardDescription>A timeline of recent interactions and submissions by {intern.name}.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            {activityLog.length > 0 ? (
            <ScrollArea className="h-[300px] w-full">
                <div className="p-4 space-y-4">
                    {activityLog.map((item) => {
                        const IconComponent = activityIconMap[item.type] || Activity;
                        return (
                            <div key={item.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg shadow-sm border border-input">
                                <div className="flex-shrink-0 mt-0.5">
                                    <IconComponent className={cn("h-5 w-5", 
                                        item.type === 'report_approved' || item.type === 'task_completed' ? 'text-green-500' :
                                        item.type === 'report_rejected' ? 'text-red-500' : 
                                        item.type === 'report_submitted' || item.type === 'task_declared' ? 'text-blue-500' :
                                        'text-primary'
                                    )} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{item.description}</p>
                                    {item.details && <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>}
                                    <p className="text-xs text-muted-foreground mt-1">{format(item.timestamp, "MMMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
            ) : (
             <div className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <Activity className="h-16 w-16 opacity-30 mb-4"/>
                <p>No recent activity recorded for {intern.name}.</p>
            </div>
            )}
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Link href={`/supervisor/interns/details/${intern.id}`} passHref>
            <Button variant="outline" className="rounded-lg">Back to {intern.name}'s Profile</Button>
        </Link>
      </div>
    </div>
  );
}

    