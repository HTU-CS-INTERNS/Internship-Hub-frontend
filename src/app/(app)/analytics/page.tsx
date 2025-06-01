
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { BarChart3, Users, ClipboardList, FileText, School, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { UserRole } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
  pending: { label: "Pending", color: "hsl(var(--chart-4))" },
  submitted: { label: "Submitted", color: "hsl(var(--chart-2))" },
  approved: { label: "Approved", color: "hsl(var(--chart-3))" },
};
const chartConfigReportsStatus = {
  approved: { label: "Approved", color: "hsl(var(--chart-3))" },
  pending: { label: "Pending", color: "hsl(var(--chart-4))" },
  rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
  submitted: { label: "Submitted", color: "hsl(var(--chart-2))" },
};

const ALL_FACULTIES_ITEM_VALUE = "__ALL_FACULTIES__";
const ALL_DEPARTMENTS_ITEM_VALUE = "__ALL_DEPARTMENTS__";

export default function AnalyticsPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [selectedFaculty, setSelectedFaculty] = React.useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('');

  // Simulate HOD's default scope
  const hodFacultyId = FACULTIES.length > 0 ? FACULTIES[0].id : '';
  const hodDepartmentId = DEPARTMENTS.find(d => d.facultyId === hodFacultyId)?.id || '';

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole || 'LECTURER'); 

    if (storedRole === 'HOD') {
      if (!selectedFaculty) setSelectedFaculty(hodFacultyId);
      if (hodFacultyId && !selectedDepartment) {
         const defaultDeptForHod = DEPARTMENTS.find(d => d.facultyId === hodFacultyId)?.id;
         if (defaultDeptForHod) setSelectedDepartment(defaultDeptForHod);
      }
    } else if (storedRole === 'ADMIN') {
      // Admins see all by default, so no pre-selected faculty/department
      setSelectedFaculty(""); // Explicitly set to empty to signify "All" or no filter
      setSelectedDepartment("");
    }
  }, [selectedFaculty, selectedDepartment, hodFacultyId, hodDepartmentId]); // Removed userRole from deps to avoid re-triggering on userRole change if filters are already set

  const handleFacultyChange = (value: string) => {
    const facultyId = value === ALL_FACULTIES_ITEM_VALUE ? "" : value;
    setSelectedFaculty(facultyId);
    setSelectedDepartment(""); 
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value === ALL_DEPARTMENTS_ITEM_VALUE ? "" : value);
  };

  const availableDepartments = selectedFaculty ? DEPARTMENTS.filter(d => d.facultyId === selectedFaculty) : DEPARTMENTS;
  
  let pageTitle = "Reporting & Analytics";
  let pageDescription = `Insights and statistics for ${userRole ? USER_ROLES[userRole].toLowerCase() : 'the system'}.`;

  if (userRole === 'HOD') {
    pageTitle = "Departmental Analytics";
    pageDescription = `Insights for ${DEPARTMENTS.find(d => d.id === (selectedDepartment || hodDepartmentId))?.name || 'your department'}`;
  } else if (userRole === 'ADMIN') {
    pageTitle = "University-Wide Analytics";
    if (selectedFaculty && selectedDepartment) {
      pageDescription = `Analytics for ${DEPARTMENTS.find(d => d.id === selectedDepartment)?.name}, ${FACULTIES.find(f => f.id === selectedFaculty)?.name}.`;
    } else if (selectedFaculty) {
      pageDescription = `Analytics for ${FACULTIES.find(f => f.id === selectedFaculty)?.name}.`;
    } else {
      pageDescription = "Overall university internship program analytics.";
    }
  }


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={BarChart3}
        breadcrumbs={[{ href: userRole === 'ADMIN' ? "/admin/dashboard" : "/dashboard", label: "Dashboard" }, { label: "Analytics" }]}
        actions={
          (userRole === 'HOD' || userRole === 'LECTURER' || userRole === 'ADMIN') && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Select 
                value={selectedFaculty || (userRole === 'HOD' ? hodFacultyId : '')} 
                onValueChange={handleFacultyChange}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <SelectValue placeholder="Filter by Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FACULTIES_ITEM_VALUE}>All Faculties</SelectItem>
                  {FACULTIES.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select 
                value={selectedDepartment || (userRole === 'HOD' && selectedFaculty === hodFacultyId ? hodDepartmentId : '')} 
                onValueChange={handleDepartmentChange}
                disabled={!selectedFaculty && availableDepartments.length === DEPARTMENTS.length && userRole !== 'HOD' && userRole !== 'ADMIN'}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value={ALL_DEPARTMENTS_ITEM_VALUE}>All Departments</SelectItem>
                  {availableDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students {userRole === 'HOD' ? '(Dept.)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === 'HOD' ? '35' : userRole === 'ADMIN' ? '750' : '150'}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Submitted {userRole === 'HOD' ? '(Dept.)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === 'HOD' ? '280' : userRole === 'ADMIN' ? '5200' : '1250'}</div>
            <p className="text-xs text-muted-foreground">+40 this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Approved {userRole === 'HOD' ? '(Dept.)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === 'HOD' ? '80' : userRole === 'ADMIN' ? '2350' : '350'}</div>
            <p className="text-xs text-muted-foreground">90% approval rate</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies {userRole === 'HOD' ? '(Dept. Placements)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === 'HOD' ? '12' : userRole === 'ADMIN' ? '120' :'42'}</div>
            <p className="text-xs text-muted-foreground">+2 new partnerships</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Task Submissions Over Time {userRole === 'HOD' ? '(Dept.)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <CardDescription>Monthly trend of task statuses. {(userRole === 'HOD' || userRole === 'ADMIN') && !selectedDepartment && '(Select a department to refine)'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigTasks} className="h-[300px] w-full">
              <BarChart data={DUMMY_CHART_DATA_TASKS} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="pending" fill="var(--color-pending, hsl(var(--chart-4)))" radius={4} />
                <Bar dataKey="submitted" fill="var(--color-submitted, hsl(var(--chart-2)))" radius={4} />
                <Bar dataKey="approved" fill="var(--color-approved, hsl(var(--chart-3)))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Report Status Distribution {userRole === 'HOD' ? '(Dept.)' : userRole === 'ADMIN' && selectedDepartment ? '(Dept.)' : userRole === 'ADMIN' && selectedFaculty ? '(Faculty)' : ''}</CardTitle>
            <CardDescription>Overall distribution of report statuses. {(userRole === 'HOD' || userRole === 'ADMIN') && !selectedDepartment && '(Select a department to refine)'}</CardDescription>
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
      {userRole === 'HOD' && (
        <div className="grid gap-6 md:grid-cols-1">
             <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center"><School className="mr-2 h-5 w-5 text-primary"/>Lecturer Activity Overview (Department)</CardTitle>
                    <CardDescription>Summary of lecturer engagement and student supervision within {DEPARTMENTS.find(d => d.id === (selectedDepartment || hodDepartmentId))?.name || 'your department'}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Lecturer-specific analytics and activity summaries will be displayed here. (e.g., number of students supervised, average report review time, etc.)</p>
                </CardContent>
             </Card>
             <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Detailed Student Progress (Department)</CardTitle>
                    <CardDescription>In-depth view of student performance and compliance in {DEPARTMENTS.find(d => d.id === (selectedDepartment || hodDepartmentId))?.name || 'your department'}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A comprehensive table listing all students in the selected department with detailed progress metrics (report status, task completion, feedback summaries, etc.) will be shown here.</p>
                </CardContent>
             </Card>
        </div>
      )}
    </div>
  );
}

    