
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Users, UserPlus, ListFilter, Edit, Eye, Mail, Users2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { DEPARTMENTS } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


interface ManagedLecturer {
    id: string;
    name: string;
    email: string;
    department: string;
    assignedStudents: number;
    maxLoad: number;
}

const DUMMY_LECTURERS: ManagedLecturer[] = [
  { id: 'lec1', name: 'Dr. Elara Vance', email: 'elara.vance@example.com', department: 'Software Engineering', assignedStudents: 15, maxLoad: 20 },
  { id: 'lec2', name: 'Dr. Ian Malcolm', email: 'ian.malcolm@example.com', department: 'Mechanical Engineering', assignedStudents: 12, maxLoad: 18 },
  { id: 'lec3', name: 'Prof. Sarah Connor', email: 'sarah.connor@example.com', department: 'Software Engineering', assignedStudents: 18, maxLoad: 20 },
];

export default function LecturerManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const isMobile = useIsMobile();

  const filteredLecturers = DUMMY_LECTURERS.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LecturerCardMobile: React.FC<{ lecturer: ManagedLecturer }> = ({ lecturer }) => {
    const loadPercentage = (lecturer.assignedStudents / lecturer.maxLoad) * 100;
    return (
        <Card className="shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-3 bg-muted/30">
                <CardTitle className="text-sm font-semibold text-foreground">{lecturer.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{lecturer.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-1 text-xs">
                <div className="flex items-center"><Users2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Department: {lecturer.department}</div>
                <div className="flex items-center"><UserPlus className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Workload: {lecturer.assignedStudents} / {lecturer.maxLoad} students</div>
                <Progress value={loadPercentage} className="h-1.5 mt-1" />
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-md text-xs"><Edit className="mr-1 h-3.5 w-3.5"/>Edit</Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-md text-xs text-primary hover:text-primary/80"><Eye className="mr-1 h-3.5 w-3.5"/>View Assignments</Button>
            </CardFooter>
        </Card>
    );
 };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Lecturer Management"
        description="Oversee lecturer assignments, workload, and student-lecturer ratios within your department."
        icon={Users}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/department-ops", label: "Department Ops" },
          { label: "Lecturer Management" }
        ]}
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg">
                  <ListFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DEPARTMENTS.slice(0,3).map(dept => ( 
                     <DropdownMenuCheckboxItem key={dept.id} onCheckedChange={() => { /* Implement filter logic */ }}>
                        {dept.name}
                    </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Lecturer
            </Button>
          </div>
        }
      />
      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "")}>
        <CardHeader className={cn(isMobile ? "pb-2" : "")}>
          <CardTitle className="font-headline text-lg">Lecturer Roster</CardTitle>
          {!isMobile && <CardDescription>View and manage lecturers in your department.</CardDescription>}
             <Input 
                placeholder="Search lecturers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2 rounded-lg"
            />
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-0" : "")}>
          {filteredLecturers.length > 0 ? (
             isMobile ? (
                <div className="space-y-4">
                    {filteredLecturers.map(lecturer => <LecturerCardMobile key={lecturer.id} lecturer={lecturer} />)}
                </div>
             ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLecturers.map(lecturer => {
                    const loadPercentage = (lecturer.assignedStudents / lecturer.maxLoad) * 100;
                    return (
                    <Card key={lecturer.id} className="rounded-lg shadow-md">
                        <CardHeader>
                            <CardTitle className="text-md">{lecturer.name}</CardTitle>
                            <CardDescription>{lecturer.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><strong>Department:</strong> {lecturer.department}</p>
                            <p><strong>Workload:</strong> {lecturer.assignedStudents} / {lecturer.maxLoad} students</p>
                            <Progress value={loadPercentage} className="h-2" />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="rounded-md">Edit</Button>
                            <Button variant="ghost" size="sm" className="rounded-md">View Assignments</Button>
                        </CardFooter>
                    </Card>
                )})}
            </div>
            )
          ) : (
             <div className={cn("text-center py-10 text-muted-foreground", isMobile ? "p-0 pt-8" : "")}>
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No lecturers found matching your criteria or none added yet.</p>
             </div>
          )}
        </CardContent>
      </Card>
       {!isMobile && (
        <Card className="shadow-lg rounded-xl mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Feature Placeholder</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground">
                This page is a placeholder for lecturer management. Future features will include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
                <li>Assigning students to lecturers.</li>
                <li>Setting and monitoring lecturer workload limits.</li>
                <li>Viewing performance metrics for lecturers.</li>
                <li>Tools for reassigning students if needed.</li>
            </ul>
            </CardContent>
        </Card>
       )}
    </div>
  );
}

