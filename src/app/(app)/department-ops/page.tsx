
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { SlidersHorizontal, Users, Settings, AlertTriangle, Briefcase, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { UserRole, HODApprovalQueueItem } from '@/types';
import { DEPARTMENTS, FACULTIES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

export default function DepartmentOpsPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [hodDepartmentName, setHodDepartmentName] = React.useState<string>('Your Department');
  const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState(0);

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole);

    if (storedRole === 'HOD') {
      const hodFacultyId = FACULTIES.length > 0 ? FACULTIES[0].id : '';
      const department = DEPARTMENTS.find(d => d.facultyId === hodFacultyId);
      setHodDepartmentName(department ? department.name : 'Your Department');

      const queueRaw = typeof window !== "undefined" ? localStorage.getItem('hodCompanyApprovalQueue') : null;
      if (queueRaw) {
        const queue: HODApprovalQueueItem[] = JSON.parse(queueRaw);
        setPendingApprovalsCount(queue.filter(item => item.status === 'PENDING_APPROVAL').length);
      }
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
              <Briefcase className="mr-2 h-5 w-5 text-primary" /> Internship Placement Approvals
            </CardTitle>
            <CardDescription>Review and approve/reject student internship placements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                You have <Badge variant={pendingApprovalsCount > 0 ? "destructive" : "secondary"}>{pendingApprovalsCount}</Badge> placement(s) pending approval.
                </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/department-ops/approve-placements" className="w-full">
                <Button variant="outline" className="mt-2 w-full rounded-lg">Manage Approvals</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" /> Lecturer Management
            </CardTitle>
            <CardDescription>Oversee lecturer assignments and workload within the department.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View lecturer-student ratios and manage assignments.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>View Lecturer Assignments (Soon)</Button>
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
              Define specific guidelines or criteria unique to {hodDepartmentName}.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>Configure Settings (Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-primary" /> Issue Resolution Center
            </CardTitle>
            <CardDescription>Track and manage escalated issues or grievances.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Address reported issues from students, lecturers, or supervisors.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-lg" disabled>View Open Issues (Soon)</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Program Quality Assurance</CardTitle>
          <CardDescription>Tools and reports for ensuring program quality within {hodDepartmentName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future enhancements may include feedback aggregation, trend analysis, and curriculum alignment tools.
          </p>
           <Link href="/analytics" passHref>
             <Button className="mt-6 rounded-lg">Go to Department Analytics</Button>
           </Link>
        </CardContent>
      </Card>
    </div>
  );
}
