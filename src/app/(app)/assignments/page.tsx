
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Users, UserCheck, ListFilter, Eye, Briefcase, Landmark, Building as BuildingIcon, User } from 'lucide-react'; // Added User here
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudentAssignment {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  department: string;
  faculty?: string; 
  assignedLecturer?: string;
  companySupervisor?: string;
  companyName?: string; 
  status: 'Assigned' | 'Pending Assignment' | 'In Progress';
}

export const DUMMY_ASSIGNMENTS: StudentAssignment[] = [
  { id: 'std1', studentName: 'Alice Wonderland', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'alice@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', assignedLecturer: 'Dr. Elara Vance', companySupervisor: 'Bob The Builder', companyName: 'Acme Innovations', status: 'In Progress' },
  { id: 'std2', studentName: 'Bob The Intern', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'bob@example.com', department: 'Mechanical Engineering', faculty: 'Faculty of Engineering', assignedLecturer: 'Dr. Elara Vance', companySupervisor: 'Alice Wonderland', companyName: 'ConstructCo', status: 'Assigned' },
  { id: 'std3', studentName: 'Charlie Brown', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'charlie@example.com', department: 'Marketing', faculty: 'Faculty of Business', status: 'Pending Assignment', assignedLecturer: 'Dr. Ian Malcolm', companyName: 'MarketGurus' },
  { id: 'std4', studentName: 'Diana Prince', studentAvatar: 'https://placehold.co/100x100.png', studentEmail: 'diana@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', assignedLecturer: 'Dr. Ian Malcolm', companySupervisor: 'Carol Danvers', companyName: 'Stark Industries', status: 'In Progress' },
];

const CURRENT_LECTURER_NAME = 'Dr. Elara Vance'; 

const statusColors: Record<StudentAssignment['status'], string> = {
  'Assigned': 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  'Pending Assignment': 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  'In Progress': 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

export default function AssignmentsPage() {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [assignmentsToShow, setAssignmentsToShow] = React.useState<StudentAssignment[]>(DUMMY_ASSIGNMENTS);
  const [statusFilter, setStatusFilter] = React.useState<Record<StudentAssignment['status'], boolean>>({
    'Assigned': true,
    'Pending Assignment': true,
    'In Progress': true,
  });
  const isMobile = useIsMobile();
  
  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    setUserRole(storedRole);

    let currentAssignments = DUMMY_ASSIGNMENTS;
    if (storedRole === 'LECTURER') {
      currentAssignments = DUMMY_ASSIGNMENTS.filter(
        assignment => assignment.assignedLecturer === CURRENT_LECTURER_NAME
      );
    }
    setAssignmentsToShow(currentAssignments.filter(assignment => statusFilter[assignment.status]));
  }, [statusFilter]);

  const handleStatusFilterChange = (status: StudentAssignment['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };
  
  const pageTitle = userRole === 'LECTURER' ? "My Assigned Students" : "Student Assignments";
  const pageDescription = userRole === 'LECTURER' 
    ? "View and manage students assigned to you." 
    : "Manage and view all student internship assignments.";

  const AssignmentCardMobile: React.FC<{ assignment: StudentAssignment }> = ({ assignment }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden border-l-4" style={{borderColor: `hsl(var(--${assignment.status === 'In Progress' ? 'chart-3' : assignment.status === 'Assigned' ? 'primary' : 'accent'}))`}}>
        <CardHeader className="p-3 bg-muted/30">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={assignment.studentAvatar} alt={assignment.studentName} data-ai-hint="person portrait" />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(assignment.studentName)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{assignment.studentName}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{assignment.studentEmail}</CardDescription>
                </div>
                 <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 ml-auto", statusColors[assignment.status])}>{assignment.status}</Badge>
            </div>
        </CardHeader>
      <CardContent className="p-3 space-y-1.5 text-xs">
         {assignment.faculty && <div className="flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Faculty:</span> {assignment.faculty}</div>}
        <div className="flex items-center gap-1.5"><BuildingIcon className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Dept:</span> {assignment.department}</div>
        {userRole !== 'LECTURER' && assignment.assignedLecturer && <div className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Lecturer:</span> {assignment.assignedLecturer}</div>}
        {assignment.companyName && <div className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" />  <span className="text-muted-foreground">Company:</span> {assignment.companyName}</div>}
        {assignment.companySupervisor && <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Supervisor:</span> {assignment.companySupervisor}</div>}
      </CardContent>
       <CardFooter className="p-3 border-t bg-muted/20">
          <Link href={`/assignments/student/${assignment.id}`} passHref className="w-full">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
            </Button>
          </Link>
       </CardFooter>
    </Card>
  );


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={UserCheck}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Assignments" }]}
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
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
      <Card className={cn("shadow-lg rounded-xl overflow-hidden", isMobile ? "bg-transparent border-none shadow-none" : "")}>
        {!isMobile && (
            <CardHeader>
            <CardTitle className="font-headline text-lg">{assignmentsToShow.length > 0 ? "Students List" : "No Students Found"}</CardTitle>
            <CardDescription>
                {userRole === 'LECTURER' 
                    ? "Overview of students you are supervising." 
                    : "Overview of students and their assignment status."}
            </CardDescription>
            </CardHeader>
        )}
        <CardContent className={cn(isMobile && assignmentsToShow.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {assignmentsToShow.length > 0 ? (
            isMobile ? (
                assignmentsToShow.map(item => <AssignmentCardMobile key={item.id} assignment={item} />)
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                {userRole !== 'LECTURER' && <TableHead>Assigned Lecturer</TableHead>}
                <TableHead>Company Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignmentsToShow.map((item) => (
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
                  {userRole !== 'LECTURER' && <TableCell>{item.assignedLecturer || 'N/A'}</TableCell>}
                  <TableCell>{item.companySupervisor || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusColors[item.status])}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/assignments/student/${item.id}`} passHref>
                        <Button variant="ghost" size="sm" className="rounded-md">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            )
          ) : (
            <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold">
                {userRole === 'LECTURER' ? "No students are currently assigned to you." : "No assignments match your filters."}
              </p>
              <p>Adjust your filters or check back later.</p>
            </div>
          )}
        </CardContent>
        {!isMobile && assignmentsToShow.length > 0 && (
        <CardFooter className="justify-end p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {assignmentsToShow.length} of {
                userRole === 'LECTURER' 
                ? DUMMY_ASSIGNMENTS.filter(a => a.assignedLecturer === CURRENT_LECTURER_NAME).length 
                : DUMMY_ASSIGNMENTS.length
              } assignments
            </p>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}
    
