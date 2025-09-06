
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
import { AdminApiService } from '@/lib/services/adminApi';
import EmptyState from '@/components/shared/empty-state';

const statusColors: Record<AbuseReport['status'], string> = {
    OPEN: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300',
    RESOLVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300',
};

export default function ReportedAbusePage() {
  const { toast } = useToast();
  const [reports, setReports] = React.useState<AbuseReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReports = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allReports = await AdminApiService.getAbuseReports();
      const reportsArray = Array.isArray(allReports) ? allReports : [];
      setReports(reportsArray.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()));
    } catch (err) {
      console.error('Failed to fetch abuse reports:', err);
      setError('Failed to load reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, status: AbuseReport['status']) => {
    try {
      await AdminApiService.updateAbuseReportStatus(reportId, status);
      toast({
        title: "Status Updated",
        description: `Report #${reportId.substring(0,6)} has been marked as ${status}.`,
      });
      fetchReports(); // Refresh list
    } catch (error) {
      console.error('Failed to update report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openReports = reports.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS');
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED');

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Reported Abuse"
        description="Review and manage all student-reported abuse and grievances."
        icon={ShieldAlert}
        breadcrumbs={[
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "Reported Abuse" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Active Abuse Reports</CardTitle>
          <CardDescription>
            Abuse reports that are open or currently under investigation.
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
              <p>No active abuse reports to review at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
       <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Resolved Abuse Reports</CardTitle>
            <CardDescription>Archived abuse reports for reference.</CardDescription>
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
            <p className="text-muted-foreground text-sm">No resolved abuse reports found.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
