
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { BarChart3, User, Loader2, AlertTriangle, CheckCircle, FileText, ListChecks, Activity } from 'lucide-react';
import { DUMMY_INTERNS } from '@/app/(app)/interns/page';
import { DUMMY_REPORTS as ALL_DUMMY_REPORTS } from '@/app/(app)/reports/page';
import type { DailyReport } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Progress } from '@/components/ui/progress';

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

export default function InternAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  
  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [internReports, setInternReports] = React.useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setIntern(foundIntern);
      const reports = ALL_DUMMY_REPORTS.filter(report => {
        // Assuming intern1's reports are linked to stu1 as per previous setup
        if (foundIntern.id === 'intern1') return report.studentId === 'stu1';
        // Add more specific logic if other interns have reports
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
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">{reportStatusCounts.APPROVED} approved</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <Progress value={approvalRate} className="h-2 mt-1 bg-muted" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed (Sim.)</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksCompleted}</div>
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
            <ChartContainer config={taskChartConfig} className="h-[300px] w-full">
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
                <ChartContainer config={reportChartConfig} className="h-[300px] w-full max-w-[400px]">
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
            <CardTitle className="font-headline text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Activity Log (Placeholder)</CardTitle>
            <CardDescription>Recent activities and interactions related to {intern.name}.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
            <Activity className="h-16 w-16 text-muted-foreground/30 mb-4"/>
            <p className="text-md font-semibold text-foreground">Detailed Activity Log Coming Soon</p>
            <p className="text-sm text-muted-foreground max-w-md">
                This section will show a timeline of check-ins, report submissions, task updates, feedback received, and communication history.
            </p>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Link href={`/interns/details/${intern.id}`} passHref>
            <Button variant="outline" className="rounded-lg">Back to {intern.name}'s Profile</Button>
        </Link>
      </div>
    </div>
  );
}
