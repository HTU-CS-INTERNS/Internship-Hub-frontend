
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { AlertTriangle, Filter, MessageSquare, ShieldAlert, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format, subDays } from 'date-fns';

interface Issue {
    id: string;
    title: string;
    reportedBy: string; // Could be student name, lecturer, supervisor
    reportedByType: 'Student' | 'Lecturer' | 'Supervisor';
    dateReported: Date;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    description: string;
}

const DUMMY_ISSUES: Issue[] = [
    { id: 'iss1', title: 'Unresponsive Supervisor', reportedBy: 'Alice W. (Student)', reportedByType: 'Student', dateReported: subDays(new Date(), 2), status: 'Open', priority: 'High', description: 'My company supervisor has not responded to my last three emails regarding project feedback.'},
    { id: 'iss2', title: 'Discrepancy in Work Hours', reportedBy: 'Dr. Vance (Lecturer)', reportedByType: 'Lecturer', dateReported: subDays(new Date(), 5), status: 'In Progress', priority: 'Medium', description: 'Student Bob reported working 40 hours, but company log shows 32. Investigating.'},
    { id: 'iss3', title: 'Internship Scope Misalignment', reportedBy: 'John Smith (Supervisor)', reportedByType: 'Supervisor', dateReported: subDays(new Date(), 10), status: 'Resolved', priority: 'Medium', description: 'Initial tasks assigned were not aligned with student\'s learning objectives. Resolved with student and lecturer.'},
];

const statusColors: Record<Issue['status'], string> = {
    Open: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300',
    'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300',
    Resolved: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300',
    Closed: 'bg-muted text-muted-foreground border-border',
};
const priorityColors: Record<Issue['priority'], string> = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-yellow-500 text-yellow-900',
    Low: 'bg-blue-500 text-white',
};


export default function IssueResolutionPage() {
  const [issues, setIssues] = React.useState<Issue[]>(DUMMY_ISSUES);
  // Add state for filters if needed

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Issue Resolution Center"
        description="Track, manage, and resolve escalated issues or grievances related to the internship program within your department."
        icon={AlertTriangle}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/department-ops", label: "Department Ops" },
          { label: "Issue Resolution" }
        ]}
         actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg">
                  <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['Open', 'In Progress', 'Resolved', 'Closed'] as Issue['status'][]).map((status) => (
                  <DropdownMenuCheckboxItem key={status} onCheckedChange={() => { /* Implement filter logic */ }}>
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <ShieldAlert className="mr-2 h-4 w-4" /> Report New Departmental Issue
            </Button>
          </div>
        }
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Open & In-Progress Issues</CardTitle>
          <CardDescription>
            Active issues requiring attention or currently being addressed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.filter(issue => issue.status === 'Open' || issue.status === 'In Progress').length > 0 ? (
            issues.filter(issue => issue.status === 'Open' || issue.status === 'In Progress').map(issue => (
                <Card key={issue.id} className="rounded-lg shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-md">{issue.title}</CardTitle>
                            <div className="flex gap-2">
                                <Badge className={`text-xs ${priorityColors[issue.priority]}`}>{issue.priority}</Badge>
                                <Badge variant="outline" className={`text-xs ${statusColors[issue.status]}`}>{issue.status}</Badge>
                            </div>
                        </div>
                        <CardDescription className="text-xs">Reported by: {issue.reportedBy} ({issue.reportedByType}) on {format(issue.dateReported, "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="line-clamp-2">{issue.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="rounded-md"><MessageSquare className="mr-1 h-4 w-4" />Comment</Button>
                        <Button variant="outline" size="sm" className="rounded-md">Update Status</Button>
                    </CardFooter>
                </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />
              <p>No open or in-progress issues at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
       <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center"><Archive className="mr-2 h-5 w-5 text-primary"/>Resolved & Closed Issues</CardTitle>
            <CardDescription>Archived issues for reference.</CardDescription>
        </CardHeader>
        <CardContent>
           {issues.filter(issue => issue.status === 'Resolved' || issue.status === 'Closed').length > 0 ? (
             issues.filter(issue => issue.status === 'Resolved' || issue.status === 'Closed').map(issue => (
                <Card key={issue.id} className="rounded-lg shadow-sm bg-muted/50 mb-3">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">{issue.title}</CardTitle>
                             <Badge variant="outline" className={`text-xs ${statusColors[issue.status]}`}>{issue.status}</Badge>
                        </div>
                        <CardDescription className="text-xs">Reported by: {issue.reportedBy} on {format(issue.dateReported, "PPP")}</CardDescription>
                    </CardHeader>
                     <CardContent className="text-xs pt-0">
                        <p className="line-clamp-1">{issue.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-1 pb-2">
                        <Button variant="ghost" size="sm" className="text-xs rounded-md">View Details</Button>
                    </CardFooter>
                </Card>
             ))
           ) : (
            <p className="text-muted-foreground text-sm">No resolved or closed issues found.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
