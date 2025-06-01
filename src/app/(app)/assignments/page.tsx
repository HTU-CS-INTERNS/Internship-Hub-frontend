
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Users, UserCheck, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StudentAssignment {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  department: string;
  assignedLecturer?: string;
  companySupervisor?: string;
  status: 'Assigned' | 'Pending Assignment' | 'In Progress';
}

const DUMMY_ASSIGNMENTS: StudentAssignment[] = [
  { id: 'std1', studentName: 'Alice Wonderland', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'alice@example.com', department: 'Software Engineering', assignedLecturer: 'Dr. Elara Vance', companySupervisor: 'Bob The Builder', status: 'In Progress' },
  { id: 'std2', studentName: 'Bob The Intern', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'bob@example.com', department: 'Mechanical Engineering', assignedLecturer: 'Dr. Elara Vance', companySupervisor: 'Alice Wonderland', status: 'Assigned' },
  { id: 'std3', studentName: 'Charlie Brown', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'charlie@example.com', department: 'Marketing', status: 'Pending Assignment' },
  { id: 'std4', studentName: 'Diana Prince', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'diana@example.com', department: 'Software Engineering', assignedLecturer: 'Dr. Ian Malcolm', companySupervisor: 'Carol Danvers', status: 'In Progress' },
];

const statusColors: Record<StudentAssignment['status'], string> = {
  'Assigned': 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  'Pending Assignment': 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  'In Progress': 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]', // Using a chart green for 'In Progress'
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

export default function AssignmentsPage() {
  const [filteredAssignments, setFilteredAssignments] = React.useState<StudentAssignment[]>(DUMMY_ASSIGNMENTS);
  const [statusFilter, setStatusFilter] = React.useState<Record<StudentAssignment['status'], boolean>>({
    'Assigned': true,
    'Pending Assignment': true,
    'In Progress': true,
  });
  
  React.useEffect(() => {
    setFilteredAssignments(DUMMY_ASSIGNMENTS.filter(assignment => statusFilter[assignment.status]));
  }, [statusFilter]);

  const handleStatusFilterChange = (status: StudentAssignment['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };
  
  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Student Assignments"
        description="Manage and view student internship assignments."
        icon={UserCheck}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Assignments" }]}
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground">
                  <ListFilter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(statusFilter) as Array<StudentAssignment['status']>).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter[status]}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Assigned Students List</CardTitle>
          <CardDescription>Overview of students and their assignment status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAssignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned Lecturer</TableHead>
                <TableHead>Company Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={item.studentAvatar} alt={item.studentName} data-ai-hint="person portrait" />
                        <AvatarFallback>{getInitials(item.studentName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.studentName}</p>
                        <p className="text-xs text-muted-foreground">{item.studentEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.assignedLecturer || 'N/A'}</TableCell>
                  <TableCell>{item.companySupervisor || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusColors[item.status])}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/assignments/student/${item.id}`} passHref>
                        <Button variant="ghost" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground p-6">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No assignments found.</p>
              <p>Adjust your filters or check back later.</p>
            </div>
          )}
        </CardContent>
        {filteredAssignments.length > 0 && (
        <CardFooter className="justify-end p-4 border-t">
            <p className="text-sm text-muted-foreground">Showing {filteredAssignments.length} of {DUMMY_ASSIGNMENTS.length} assignments</p>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}
