
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { AbuseReport } from '@/types';
import { getAbuseReports, updateReportStatus } from '@/lib/services/issue.service';

const statusColors: Record<AbuseReport['status'], string> = {
    OPEN: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300',
    RESOLVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300',
};

export default function ReportedAbusePage() {
  const { toast } = useToast();
  const [reports, setReports] = React.useState<AbuseReport[]>([]);

  const fetchReports = React.useCallback(async () => {
    const allReports = await getAbuseReports();
    setReports(allReports.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()));
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, status: AbuseReport['status']) => {
    await updateReportStatus(reportId, status);
    toast({
        title: "Status Updated",
        description: `Report #${reportId.substring(0,6)} has been marked as ${status}.`,
    });
    fetchReports(); // Refresh list
  };

  const openReports = reports.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS');
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED');

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Reported Issues"
        description="Review and manage all student-reported issues and grievances."
        icon={ShieldAlert}
        breadcrumbs={[
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "Reported Issues" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Active Issues</CardTitle>
          <CardDescription>
            Issues that are open or currently under investigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {openReports.length > 0 ? (
            openReports.map(report => (
                <Card key={report.id} className="rounded-lg shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-md">{report.title}</CardTitle>
                             <Badge variant="outline" className={`text-xs ${statusColors[report.status]}`}>{report.status}</Badge>
                        </div>
                        <CardDescription className="text-xs">Reported by: {report.reportedByName} ({report.reportedByStudentId}) on {format(new Date(report.dateReported), "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="line-clamp-3">{report.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {report.status === 'OPEN' && (
                            <Button variant="outline" size="sm" className="rounded-md" onClick={() => handleUpdateStatus(report.id, 'IN_PROGRESS')}>
                                <Clock className="mr-1 h-4 w-4" /> Mark as In Progress
                            </Button>
                        )}
                         {report.status === 'IN_PROGRESS' && (
                            <Button variant="outline" size="sm" className="rounded-md" onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}>
                               <CheckCircle className="mr-1 h-4 w-4" /> Mark as Resolved
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />
              <p>No active issues to review at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
       <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Resolved Issues</CardTitle>
            <CardDescription>Archived issues for reference.</CardDescription>
        </CardHeader>
        <CardContent>
           {resolvedReports.length > 0 ? (
             resolvedReports.map(report => (
                <Card key={report.id} className="rounded-lg shadow-sm bg-muted/50 mb-3">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                             <Badge variant="outline" className={`text-xs ${statusColors[report.status]}`}>{report.status}</Badge>
                        </div>
                        <CardDescription className="text-xs">Reported by: {report.reportedByName} on {format(new Date(report.dateReported), "PPP")}</CardDescription>
                    </CardHeader>
                     <CardContent className="text-xs pt-0">
                        <p className="line-clamp-1">{report.description}</p>
                    </CardContent>
                </Card>
             ))
           ) : (
            <p className="text-muted-foreground text-sm">No resolved issues found.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
