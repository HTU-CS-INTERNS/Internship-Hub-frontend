
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { School, Users, BarChart3, Landmark, UserCog, Building, UserCheck, TrendingUp, Briefcase, Settings, Loader2 } from 'lucide-react';

const AdminDashboardStatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; description?: string; actionLink?: string; actionLabel?: string; isLoading?: boolean }> = ({ title, value, icon: Icon, description, actionLink, actionLabel, isLoading }) => (
  <Card className="shadow-lg rounded-xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-[36px] flex items-center"> 
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="text-3xl font-bold">{value}</div>
      )}
      {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
    {actionLink && actionLabel && !isLoading && (
      <CardFooter>
        <Link href={actionLink} className="w-full">
            <Button variant="outline" className="w-full rounded-lg">{actionLabel}</Button>
        </Link>
      </CardFooter>
    )}
  </Card>
);

interface UniversityStats {
  totalInterns: number;
  activeInternships: number;
  unassignedInterns: number;
  totalLecturers: number;
  avgLecturerWorkload: number;
  totalCompanies: number;
}

export default function AdminDashboardPage() {
  const [universityStats, setUniversityStats] = React.useState<UniversityStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching data
    const fetchStats = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Placeholder data - in a real app, this would be fetched from Firestore
      const fetchedData: UniversityStats = {
        totalInterns: 782,
        activeInternships: 715,
        unassignedInterns: 28,
        totalLecturers: 85,
        avgLecturerWorkload: 9.2, 
        totalCompanies: 125,
      };
      setUniversityStats(fetchedData);
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const engagementPercentage = universityStats ? ((universityStats.activeInternships / universityStats.totalInterns) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Administrator Dashboard"
        description="University-wide Internship Program Oversight."
        icon={School}
        breadcrumbs={[{ href: "/admin/dashboard", label: "Admin Dashboard" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardStatCard title="Total Interns" value={universityStats?.totalInterns ?? '...'} icon={Users} description="Across all faculties" isLoading={isLoading} />
        <AdminDashboardStatCard title="Active Internships" value={universityStats?.activeInternships ?? '...'} icon={Building} description={!isLoading && universityStats ? `${engagementPercentage}% engagement` : undefined} isLoading={isLoading} />
        <AdminDashboardStatCard title="Unassigned Interns" value={universityStats?.unassignedInterns ?? '...'} icon={UserCheck} description="Require lecturer assignment" actionLink="/admin/lecturer-assignments" actionLabel="Assign Lecturers" isLoading={isLoading}/>
        <AdminDashboardStatCard title="Total Lecturers" value={universityStats?.totalLecturers ?? '...'} icon={UserCog} description="Faculty members supervising interns" isLoading={isLoading} />
        <AdminDashboardStatCard title="Avg. Lecturer Workload" value={universityStats ? `${universityStats.avgLecturerWorkload.toFixed(1)} interns` : '...'} icon={TrendingUp} description="University average" isLoading={isLoading} />
        <AdminDashboardStatCard title="Partner Companies" value={universityStats?.totalCompanies ?? '...'} icon={Briefcase} description="Providing internship opportunities" isLoading={isLoading} />
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
                        <UserCog className="h-6 w-6 mb-2 text-primary"/>
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
            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
                    <p className="ml-2 text-muted-foreground">Loading program health...</p>
                </div>
            ) : (
            <>
                <p className="text-muted-foreground">
                Detailed charts and tables showing breakdowns by Faculty and Department will be displayed here.
                For example:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
                <li>Internship Completion Rates by Faculty.</li>
                <li>Average Supervisor Engagement per Department.</li>
                <li>Student Compliance (Reports/Tasks) by Department.</li>
                </ul>
            </>
            )}
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
