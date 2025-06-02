
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, PlusCircle, Filter, Eye, Archive } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DailyReport } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile'; 
import { useToast } from '@/hooks/use-toast';

export const DUMMY_REPORTS: (DailyReport & { title?: string; challengesFaced?: string; securePhotoUrl?: string; attachments?: string[]; supervisorComments?: string })[] = [
  { 
    id: 'report1', 
    date: '2024-07-26', 
    title: 'Weekly Auth Module Summary',
    description: 'Weekly summary of authentication module progress. Focused on JWT implementation and secure endpoint testing. Reviewed security protocols and updated documentation.', 
    outcomes: 'Module 70% complete. Security review passed.', 
    learningObjectives: 'Advanced JWT, security best practices, technical documentation.', 
    studentId: 'stu1', 
    status: 'APPROVED',
    challengesFaced: "Minor issues with token refresh logic, resolved by adjusting expiration strategy.",
    attachments: ['auth_architecture.pdf', 'security_review_notes.txt'],
    securePhotoUrl: 'https://placehold.co/600x400.png',
    supervisorComments: "Good progress this week, Alice. The JWT implementation looks solid. Keep up the great work!"
  },
  { 
    id: 'report2', 
    date: '2024-07-27', 
    title: 'Mid-Internship Presentation Prep',
    description: 'Mid-internship review presentation preparation and content finalization for all key sections. Practiced delivery and timing.', 
    outcomes: 'Presentation draft ready. Confident in delivery.', 
    learningObjectives: 'Presentation skills, summarizing technical work for diverse audiences.', 
    studentId: 'stu1', 
    status: 'SUBMITTED',
    challengesFaced: "Condensing all work into a short presentation was challenging.",
    attachments: ['mid_term_presentation.pptx'],
    supervisorComments: "Looking forward to seeing the presentation."
  },
  { 
    id: 'report3', 
    date: '2024-07-25', 
    title: 'New Feature X Planning',
    description: 'Initial setup and planning for the new feature X, including requirement gathering, user story creation, and timeline estimation.', 
    outcomes: 'Project plan created. User stories documented.', 
    learningObjectives: 'Agile planning, requirement elicitation techniques.', 
    studentId: 'stu1', 
    status: 'PENDING',
    challengesFaced: "Ambiguity in initial requirements, clarified with product manager.",
    securePhotoUrl: 'https://placehold.co/600x400.png'
  },
  { 
    id: 'report4', 
    date: '2024-07-24', 
    title: 'Bug Fixing Sprint v1.2',
    description: 'Bug fixing for version 1.2 release, addressing critical issues reported by QA. Focused on payment module bugs.', 
    outcomes: 'Critical bugs in payment module resolved. Test coverage improved.', 
    learningObjectives: 'Advanced debugging techniques, payment gateway integration nuances.', 
    studentId: 'stu1', 
    status: 'REJECTED',
    challengesFaced: "One particularly elusive bug took significant time to trace and fix.",
    supervisorComments: "Some non-critical bugs remain. Please address them and resubmit the affected module for testing."
  },
];

const statusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function ReportsPage() {
  const [filteredReports, setFilteredReports] = React.useState<DailyReport[]>(DUMMY_REPORTS);
  const [statusFilter, setStatusFilter] = React.useState<Record<DailyReport['status'], boolean>>({
    PENDING: true,
    SUBMITTED: true,
    APPROVED: true,
    REJECTED: true,
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  React.useEffect(() => {
    setFilteredReports(DUMMY_REPORTS.filter(report => statusFilter[report.status]));
  }, [statusFilter]);
  
  const handleStatusFilterChange = (status: DailyReport['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleCompileReports = () => {
    toast({
      title: "Compiling Reports...",
      description: "Your reports are being compiled. The consolidated file will be available for download shortly (simulated).",
      duration: 5000, 
    });
  };

  const ReportCardMobile: React.FC<{ report: DailyReport }> = ({ report }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden border-l-4" style={{borderColor: `hsl(var(--${report.status === 'APPROVED' ? 'chart-3' : report.status === 'SUBMITTED' ? 'primary' : report.status === 'REJECTED' ? 'destructive' : 'accent'}))`}}>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground">Report Date</p>
            <p className="font-semibold text-foreground">{new Date(report.date).toLocaleDateString()}</p>
          </div>
          <Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusColors[report.status])}>
            {report.status}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Summary</p>
          <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
        </div>
        <div className="pt-2">
          <Link href={`/student/reports/${report.id}`} passHref>
            <Button variant="outline" size="sm" className="w-full rounded-md">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Work Reports"
        description="Submit your daily work reports and track their approval status."
        icon={FileText}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Work Reports" }]}
        actions={
           <div className="flex flex-col sm:flex-row gap-2 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground w-full sm:w-auto rounded-lg">
                  <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-full sm:w-auto">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(statusFilter) as Array<DailyReport['status']>).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter[status]}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
                variant="outline" 
                className="bg-card hover:bg-accent hover:text-accent-foreground w-full sm:w-auto rounded-lg" 
                onClick={handleCompileReports}
            >
                <Archive className="mr-2 h-4 w-4" /> Compile All Reports
            </Button>
            <Link href="/student/reports/new" passHref className="w-full sm:w-auto">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full rounded-lg">
                <PlusCircle className="mr-2 h-4 w-4" /> Submit New Report
              </Button>
            </Link>
          </div>
        }
      />
      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "overflow-hidden")}>
        {!isMobile && (
            <CardHeader>
            <CardTitle className="font-headline text-lg">Report History</CardTitle>
            <CardDescription>A log of all your submitted work reports.</CardDescription>
            </CardHeader>
        )}
        <CardContent className={cn(isMobile ? "p-0" : "p-0")}>
          {filteredReports.length > 0 ? (
            isMobile ? (
              <div className="space-y-4">
                {filteredReports.map((report) => <ReportCardMobile key={report.id} report={report} />)}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[report.status])}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/student/reports/${report.id}`} passHref>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
          ) : (
             <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No reports found.</p>
              <p>Submit a new report or adjust your filters.</p>
            </div>
          )}
        </CardContent>
        {!isMobile && filteredReports.length > 0 && (
          <CardFooter className="justify-end p-4 border-t">
             <p className="text-sm text-muted-foreground">Showing {filteredReports.length} of {DUMMY_REPORTS.length} reports</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
