
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { SlidersHorizontal, Users, Settings, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { UserRole } from '@/types';
import { DEPARTMENTS, FACULTIES } from '@/lib/constants';

export default function DepartmentOpsPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [hodDepartmentName, setHodDepartmentName] = React.useState<string>('Your Department');

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole);

    if (storedRole === 'HOD') {
      // Simulate HOD's department (same logic as dashboard)
      const hodFacultyId = FACULTIES.length > 0 ? FACULTIES[0].id : '';
      const department = DEPARTMENTS.find(d => d.facultyId === hodFacultyId);
      setHodDepartmentName(department ? department.name : 'Your Department');
    }
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Department Operations"
        description={`Manage operational settings and oversight for ${hodDepartmentName}.`}
        icon={SlidersHorizontal}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Department Ops" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" /> Lecturer Management
            </CardTitle>
            <CardDescription>Oversee lecturer assignments and workload within the department.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This section will allow you to view lecturer-student ratios, manage lecturer assignments to specific courses or student groups, and potentially track lecturer engagement metrics.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>View Lecturer Assignments (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" /> Departmental Settings
            </CardTitle>
            <CardDescription>Configure internship program parameters for your department.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Define specific guidelines, reporting frequencies, or evaluation criteria unique to {hodDepartmentName}.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>Configure Settings (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-primary" /> Issue Resolution Center
            </CardTitle>
            <CardDescription>Track and manage escalated issues or grievances.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A centralized place to view and address any reported issues from students, lecturers, or company supervisors pertaining to the department's internship program.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>View Open Issues (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Program Quality Assurance</CardTitle>
          <CardDescription>Tools and reports for ensuring the quality and effectiveness of the internship program within {hodDepartmentName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future enhancements may include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
            <li>Feedback aggregation from all stakeholders.</li>
            <li>Performance trend analysis for cohorts.</li>
            <li>Tools for curriculum alignment with industry needs.</li>
          </ul>
           <Link href="/analytics" passHref>
             <Button className="mt-6 rounded-lg">Go to Department Analytics</Button>
           </Link>
        </CardContent>
      </Card>
    </div>
  );
}
