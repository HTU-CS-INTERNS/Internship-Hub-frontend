
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Users, UserPlus, ListFilter } from 'lucide-react';
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
import { DEPARTMENTS, FACULTIES } from '@/lib/constants';

// Placeholder data for lecturers
const DUMMY_LECTURERS = [
  { id: 'lec1', name: 'Dr. Elara Vance', email: 'elara.vance@example.com', department: 'Software Engineering', assignedStudents: 15, maxLoad: 20 },
  { id: 'lec2', name: 'Dr. Ian Malcolm', email: 'ian.malcolm@example.com', department: 'Mechanical Engineering', assignedStudents: 12, maxLoad: 18 },
  { id: 'lec3', name: 'Prof. Sarah Connor', email: 'sarah.connor@example.com', department: 'Software Engineering', assignedStudents: 18, maxLoad: 20 },
];

export default function LecturerManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  // Add state for filters if needed

  const filteredLecturers = DUMMY_LECTURERS.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {DEPARTMENTS.slice(0,3).map(dept => ( // Show a few example departments
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
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Lecturer Roster</CardTitle>
          <CardDescription>
            View and manage lecturers in your department.
             <Input 
                placeholder="Search lecturers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2 rounded-lg"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLecturers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLecturers.map(lecturer => (
                    <Card key={lecturer.id} className="rounded-lg shadow-md">
                        <CardHeader>
                            <CardTitle className="text-md">{lecturer.name}</CardTitle>
                            <CardDescription>{lecturer.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p><strong>Department:</strong> {lecturer.department}</p>
                            <p><strong>Assigned Students:</strong> {lecturer.assignedStudents} / {lecturer.maxLoad}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="rounded-md">Edit</Button>
                            <Button variant="ghost" size="sm" className="rounded-md">View Assignments</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No lecturers found matching your criteria or none added yet.</p>
             </div>
          )}
        </CardContent>
      </Card>
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
    </div>
  );
}
