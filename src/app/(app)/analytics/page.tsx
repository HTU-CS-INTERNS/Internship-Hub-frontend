'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { BarChart3, Users, ClipboardList, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { UserRole } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';

const DUMMY_CHART_DATA_TASKS = [
  { month: "Jan", pending: 10, submitted: 20, approved: 15 },
  { month: "Feb", pending: 12, submitted: 25, approved: 20 },
  { month: "Mar", pending: 8, submitted: 18, approved: 22 },
  { month: "Apr", pending: 15, submitted: 22, approved: 18 },
  { month: "May", pending: 10, submitted: 28, approved: 25 },
];

const DUMMY_CHART_DATA_REPORTS_STATUS = [
  { name: 'Approved', value: 75, fill: 'var(--color-approved)' },
  { name: 'Pending', value: 15, fill: 'var(--color-pending)' },
  { name: 'Rejected', value: 5, fill: 'var(--color-rejected)' },
  { name: 'Submitted', value: 25, fill: 'var(--color-submitted)' },
];

const chartConfigTasks = {
  pending: { label: "Pending", color: "hsl(var(--chart-1))" },
  submitted: { label: "Submitted", color: "hsl(var(--chart-2))" },
  approved: { label: "Approved", color: "hsl(var(--chart-3))" },
};
const chartConfigReportsStatus = {
  approved: { label: "Approved", color: "hsl(var(--chart-3))" }, // Green
  pending: { label: "Pending", color: "hsl(var(--chart-4))" }, // Yellow
  rejected: { label: "Rejected", color: "hsl(var(--chart-5))" }, // Red
  submitted: { label: "Submitted", color: "hsl(var(--chart-2))" }, // Blue
}

export default function AnalyticsPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [selectedFaculty, setSelectedFaculty] = React.useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('');

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole || 'LECTURER'); // Default for analytics view
  }, []);

  const availableDepartments = selectedFaculty ? DEPARTMENTS.filter(d => d.facultyId === selectedFaculty) : DEPARTMENTS;

  // In a real app, data would be fetched based on filters and user role
  // const { data, isLoading } = useAnalyticsData(userRole, selectedFaculty, selectedDepartment);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reporting & Analytics"
        description={`Insights and statistics for ${userRole ? USER_ROLES[userRole].toLowerCase() : 'the system'}.`}
        icon={BarChart3}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Analytics" }]}
        actions={
          userRole === 'HOD' && ( // Example: HOD can filter
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Faculties</SelectItem>
                  {FACULTIES.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="">All Departments</SelectItem>
                  {availableDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Submitted</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1250</div>
            <p className="text-xs text-muted-foreground">+180 this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Approved</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350</div>
            <p className="text-xs text-muted-foreground">92% approval rate</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 new partnerships</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Task Submissions Over Time</CardTitle>
            <CardDescription>Monthly trend of task statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigTasks} className="h-[300px] w-full">
              <BarChart data={DUMMY_CHART_DATA_TASKS} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
                <Bar dataKey="submitted" fill="var(--color-submitted)" radius={4} />
                <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Report Status Distribution</CardTitle>
            <CardDescription>Overall distribution of report statuses.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfigReportsStatus} className="h-[300px] w-full max-w-[400px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={DUMMY_CHART_DATA_REPORTS_STATUS} dataKey="value" nameKey="name" cy="50%" outerRadius={100}>
                     {DUMMY_CHART_DATA_REPORTS_STATUS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" className="mt-4" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
