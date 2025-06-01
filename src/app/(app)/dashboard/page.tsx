'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { LayoutDashboard, User, Briefcase, Building } from 'lucide-react';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Placeholder components for role-specific dashboard content
const StudentDashboardContent = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">My Tasks</CardTitle>
        <CardDescription>View and manage your daily tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">You have 3 pending tasks.</p>
        <Link href="/tasks" passHref><Button className="w-full">Go to Tasks</Button></Link>
      </CardContent>
    </Card>
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">My Reports</CardTitle>
        <CardDescription>Submit and track your work reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">1 report awaiting approval.</p>
        <Link href="/reports" passHref><Button className="w-full">Go to Reports</Button></Link>
      </CardContent>
    </Card>
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Internship Details</CardTitle>
        <CardDescription>View your current internship information.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Company: Tech Solutions Inc.</p>
        <Link href="/profile#internship" passHref><Button variant="outline" className="w-full">View Details</Button></Link>
      </CardContent>
    </Card>
  </div>
);

const LecturerDashboardContent = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Student Assignments</CardTitle>
        <CardDescription>Oversee students assigned to you.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">You are supervising 5 students.</p>
        <Link href="/assignments" passHref><Button className="w-full">Manage Assignments</Button></Link>
      </CardContent>
    </Card>
     <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Approve Reports</CardTitle>
        <CardDescription>Review and approve student reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">2 reports need your review.</p>
        <Link href="/assignments/approve-reports" passHref><Button className="w-full">Review Reports</Button></Link>
      </CardContent>
    </Card>
  </div>
);

const SupervisorDashboardContent = () => (
 <div className="grid gap-6 md:grid-cols-2">
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Intern Management</CardTitle>
        <CardDescription>View interns under your supervision.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">You have 3 interns.</p>
        <Link href="/interns" passHref><Button className="w-full">View Interns</Button></Link>
      </CardContent>
    </Card>
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Task & Report Approvals</CardTitle>
        <CardDescription>Approve daily tasks and work reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">5 items awaiting approval.</p>
        <Link href="/interns/approve-tasks" passHref><Button className="w-full">Go to Approvals</Button></Link>
      </CardContent>
    </Card>
  </div>
);

const HODDashboardContent = () => (
 <div className="grid gap-6 md:grid-cols-2">
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Department Overview</CardTitle>
        <CardDescription>Monitor department internship activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">View overall progress and statistics.</p>
        <Link href="/department/overview" passHref><Button className="w-full">Department Dashboard</Button></Link>
      </CardContent>
    </Card>
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Lecturer Assignments</CardTitle>
        <CardDescription>Manage and oversee lecturer workloads.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">10 lecturers in your department.</p>
        <Link href="/department/lecturers" passHref><Button className="w-full">Manage Lecturers</Button></Link>
      </CardContent>
    </Card>
  </div>
);


export default function DashboardPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole || 'STUDENT'); // Default to student if no role, or handle error
    setIsLoading(false);
  }, []);

  const roleSpecificContent = () => {
    switch (userRole) {
      case 'STUDENT':
        return <StudentDashboardContent />;
      case 'LECTURER':
        return <LecturerDashboardContent />;
      case 'SUPERVISOR':
        return <SupervisorDashboardContent />;
      case 'HOD':
        return <HODDashboardContent />;
      default:
        return <p>No specific dashboard content for this role.</p>;
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'STUDENT': return User;
      case 'LECTURER': return Users; // Using Users from lucide-react
      case 'SUPERVISOR': return Briefcase;
      case 'HOD': return Building;
      default: return LayoutDashboard;
    }
  };
  
  if (isLoading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${userRole ? USER_ROLES[userRole] : ''} Dashboard`}
        description={`Welcome to your InternshipTrack dashboard. Here's a quick overview.`}
        icon={getRoleIcon()}
        breadcrumbs={[{ label: 'Dashboard' }]}
      />
      {roleSpecificContent()}
    </div>
  );
}

// Placeholder for Users icon if not directly imported from lucide-react, usually it would be
// import { Users } from 'lucide-react';
const Users = LayoutDashboard; 
