
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Dummy data import - replace with actual data fetching
const DUMMY_STUDENTS_DATA = [
  { id: 'std1', name: 'Alice Wonderland', email: 'alice@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std2', name: 'Bob The Intern', email: 'bob@example.com', department: 'Mechanical Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std3', name: 'Charlie Brown', email: 'charlie@example.com', department: 'Marketing', faculty: 'Faculty of Business', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std4', name: 'Diana Prince', email: 'diana@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
];


export default function LecturerStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [student, setStudent] = React.useState<(typeof DUMMY_STUDENTS_DATA[0]) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching student data
    const foundStudent = DUMMY_STUDENTS_DATA.find(s => s.id === studentId);
    if (foundStudent) {
      setStudent(foundStudent);
    }
    setIsLoading(false);
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <PageHeader
          title="Student Not Found"
          icon={AlertTriangle}
          breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { href: "/assignments", label: "Assignments" }, { label: "Error" }]}
        />
        <Card className="shadow-lg rounded-xl">
            <CardContent className="p-10 text-center">
            <p className="text-xl font-semibold text-destructive-foreground">Could not find details for student ID: {studentId}</p>
            <Button asChild className="mt-6">
                <Link href="/assignments">Back to Assignments</Link>
            </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Student Progress: ${student.name}`}
        description={`Oversee tasks, reports, and feedback for ${student.name} (${student.department}).`}
        icon={User}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/assignments", label: "Assignments" },
          { label: student.name }
        ]}
      />

      <Card className="shadow-xl rounded-xl">
        <CardHeader className="p-6">
          <CardTitle className="font-headline text-xl">Student Information</CardTitle>
           <CardDescription>{student.email} | {student.department}, {student.faculty}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">
              Detailed Student Overview Area
            </p>
            <p className="text-muted-foreground max-w-md">
              This section will display the student's submitted tasks, daily/weekly reports,
              provide options for feedback, and show communication history. 
              Functionality for reviewing and grading submissions will be available here.
            </p>
            <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => alert("Placeholder: View student tasks")}>View Tasks</Button>
                <Button variant="outline" onClick={() => alert("Placeholder: View student reports")}>View Reports</Button>
                <Button onClick={() => router.push('/communication')}>Contact Student</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
