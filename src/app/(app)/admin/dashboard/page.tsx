
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { School, Users, BarChart3, Landmark, UsersCog, Building, UserCheck, TrendingUp } from 'lucide-react';

const AdminDashboardStatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; description?: string; actionLink?: string; actionLabel?: string }> = ({ title, value, icon: Icon, description, actionLink, actionLabel }) => (
  <Card className="shadow-lg rounded-xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
    {actionLink && actionLabel && (
      <CardFooter>
        <Link href={actionLink} className="w-full">
            <Button variant="outline" className="w-full rounded-lg">{actionLabel}</Button>
        </Link>
      </CardFooter>
    )}
  </Card>
);

export default function AdminDashboardPage() {
  // Placeholder data - in a real app, this would be fetched
  const universityStats = {
    totalInterns: 750,
    activeInternships: 680,
    unassignedInterns: 35,
    totalLecturers: 80,
    avgLecturerWorkload: 9, // interns per lecturer
    totalCompanies: 120,
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Administrator Dashboard"
        description="University-wide Internship Program Oversight."
        icon={School}
        breadcrumbs={[{ href: "/admin/dashboard", label: "Admin Dashboard" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardStatCard title="Total Interns" value={universityStats.totalInterns} icon={Users} description="Across all faculties" />
        <AdminDashboardStatCard title="Active Internships" value={universityStats.activeInternships} icon={Building} description={`${((universityStats.activeInternships / universityStats.totalInterns) * 100).toFixed(0)}% engagement`} />
        <AdminDashboardStatCard title="Unassigned Interns" value={universityStats.unassignedInterns} icon={UserCheck} description="Require lecturer assignment" actionLink="/admin/lecturer-assignments" actionLabel="Assign Lecturers"/>
        <AdminDashboardStatCard title="Total Lecturers" value={universityStats.totalLecturers} icon={UsersCog} description="Faculty members supervising interns" />
        <AdminDashboardStatCard title="Avg. Lecturer Workload" value={`${universityStats.avgLecturerWorkload} interns`} icon={TrendingUp} description="University average" />
        <AdminDashboardStatCard title="Partner Companies" value={universityStats.totalCompanies} icon={Briefcase} description="Providing internship opportunities" />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-xl rounded-xl">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Quick Actions</CardTitle>
                <CardDescription>Access key administrative functions.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Link href="/admin/university-structure" passHref>
                    <Button variant="outline" className="w-full h-auto py-3 rounded-lg flex-col items-start text-left">
                        <Landmark className="h-6 w-6 mb-2 text-primary"/>
                        <span className="font-semibold">Manage University Structure</span>
                        <span className="text-xs text-muted-foreground">Faculties & Departments</span>
                    </Button>
                </Link>
                 <Link href="/admin/user-management" passHref>
                    <Button variant="outline" className="w-full h-auto py-3 rounded-lg flex-col items-start text-left">
                        <UsersCog className="h-6 w-6 mb-2 text-primary"/>
                        <span className="font-semibold">Manage Users</span>
                        <span className="text-xs text-muted-foreground">Students, Lecturers, etc.</span>
                    </Button>
                </Link>
                <Link href="/analytics" passHref>
                    <Button variant="outline" className="w-full h-auto py-3 rounded-lg flex-col items-start text-left">
                        <BarChart3 className="h-6 w-6 mb-2 text-primary"/>
                        <span className="font-semibold">View Reports & Analytics</span>
                        <span className="text-xs text-muted-foreground">University-wide insights</span>
                    </Button>
                </Link>
                 <Link href="/admin/settings" passHref>
                    <Button variant="outline" className="w-full h-auto py-3 rounded-lg flex-col items-start text-left">
                        <Settings className="h-6 w-6 mb-2 text-primary"/>
                        <span className="font-semibold">System Settings</span>
                        <span className="text-xs text-muted-foreground">Configure program parameters</span>
                    </Button>
                </Link>
            </CardContent>
        </Card>
        
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Program Health Overview</CardTitle>
            <CardDescription>Breakdown of key metrics by Faculty and Department (Placeholder).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Detailed charts and tables showing breakdowns by Faculty and Department will be displayed here.
              For example:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
              <li>Internship Completion Rates by Faculty.</li>
              <li>Average Supervisor Engagement per Department.</li>
              <li>Student Compliance (Reports/Tasks) by Department.</li>
            </ul>
          </CardContent>
           <CardFooter>
                <Link href="/analytics" passHref>
                    <Button className="rounded-lg">View Detailed Analytics</Button>
                </Link>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
