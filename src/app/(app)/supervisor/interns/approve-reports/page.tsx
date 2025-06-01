
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DailyReport } from '@/types';
import { DUMMY_REPORTS as ALL_DUMMY_REPORTS } from '@/app/(app)/reports/page';
import { DUMMY_INTERNS } from '@/app/(app)/supervisor/interns/page';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Filter reports to only show those that might be 'SUBMITTED' or 'PENDING' by interns
const getPendingReportsForSupervisor = () => {
  // This is a simplified simulation. In a real app, reports would be linked to interns.
  // We'll assume some reports belong to intern1 (Samuel Green) for demo.
  return ALL_DUMMY_REPORTS.filter(report => 
    (report.status === 'SUBMITTED' || report.status === 'PENDING') && report.studentId === 'stu1' // stu1 maps to intern1
  );
};

const reportStatusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};

export default function ApproveReportsPage() {
  const { toast } = useToast();
  const [pendingReports, setPendingReports] = React.useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setPendingReports(getPendingReportsForSupervisor());
    setIsLoading(false);
  }, []);

  const handleApproveReport = (reportId: string) => {
    setPendingReports(prevReports => prevReports.map(report => 
      report.id === reportId ? { ...report, status: 'APPROVED' } : report
    ));
    toast({ title: 'Report Approved', description: `Report ID ${reportId} has been marked as approved.` });
    // In a real app, an API call would be made here.
  };

  const handleRejectReport = (reportId: string) => {
     setPendingReports(prevReports => prevReports.map(report => 
      report.id === reportId ? { ...report, status: 'REJECTED' } : report
    ));
    toast({ title: 'Report Rejected', description: `Report ID ${reportId} has been marked as rejected. Feedback should be provided via the report detail page.`, variant: 'destructive' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading reports for approval...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Approve Intern Reports"
        description="Review and approve/reject work reports submitted by your interns."
        icon={FileCheck}
        breadcrumbs={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/supervisor/interns", label: "My Interns" },
            { label: "Approve Reports" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Pending Report Submissions</CardTitle>
          <CardDescription>
             {pendingReports.length > 0 
                ? `You have ${pendingReports.length} report(s) awaiting your review.` 
                : "No reports are currently pending your approval."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
            {pendingReports.length > 0 ? (
            <div className="space-y-4">
              {pendingReports.map(report => {
                const intern = DUMMY_INTERNS.find(i => i.id === 'intern1'); // Simplified: assumes tasks belong to intern1 for demo
                return (
                  <Card key={report.id} className="bg-muted/30 shadow-sm rounded-lg">
                    <CardHeader className="pb-3">
                       <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-foreground">Report: {format(parseISO(report.date), "PPP")} {(intern ? `- ${intern.name}`: '')}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0", reportStatusColors[report.status])}>{report.status}</Badge>
                        </div>
                    </CardHeader>
                     <CardContent className="text-xs">
                        <p><strong className="text-foreground">Outcomes:</strong> {report.outcomes}</p>
                     </CardContent>
                    <CardFooter className="justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleRejectReport(report.id)} className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">Reject</Button>
                      <Button variant="default" size="sm" onClick={() => handleApproveReport(report.id)} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                       <Link href={`/supervisor/interns/reports/${report.id}?internId=${intern?.id || 'intern1'}`} passHref>
                           <Button variant="ghost" size="sm">View & Comment</Button>
                       </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <FileCheck className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>All caught up! No reports require your attention at this moment.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
