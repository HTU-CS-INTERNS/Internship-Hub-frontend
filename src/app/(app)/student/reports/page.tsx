
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, PlusCircle, Filter, Eye, Archive, Edit3 } from 'lucide-react'; 
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
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';

const statusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [allReports, setAllReports] = React.useState<DailyReport[]>([]);
  const [filteredReports, setFilteredReports] = React.useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<Record<DailyReport['status'], boolean>>({
    PENDING: true,
    SUBMITTED: true,
    APPROVED: true,
    REJECTED: true,
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Fetch reports data from API
  React.useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const reportsData = await StudentApiService.getReports();
        const reports = Array.isArray(reportsData) ? reportsData : [];
        setAllReports(reports);
        setFilteredReports(reports.filter(report => 
          report.status && statusFilter[report.status as DailyReport['status']]
        ));
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load reports');
        setAllReports([]);
        setFilteredReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  React.useEffect(() => {
    setFilteredReports(allReports.filter(report => statusFilter[report.status]));
  }, [statusFilter, allReports]);
  
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

  const ReportCardMobile: React.FC<{ report: DailyReport & { title?: string} }> = ({ report }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden border-l-4" style={{borderColor: `hsl(var(--${report.status === 'APPROVED' ? 'chart-3' : report.status === 'SUBMITTED' ? 'primary' : report.status === 'REJECTED' ? 'destructive' : 'accent'}))`}}>
      <CardHeader className="p-3 bg-muted/30">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-semibold text-foreground">{report.title || `Report: ${format(parseISO(report.date), "PPP")}`}</CardTitle>
          <Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusColors[report.status])}>
            {report.status}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">{format(parseISO(report.date), "EEEE, MMMM d, yyyy")}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        <p className="text-muted-foreground mb-1">Summary:</p>
        <p className="text-foreground line-clamp-3">{report.description}</p>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
          <Link href={`/student/reports/${report.id}`} passHref className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
            </Button>
          </Link>
          {report.status === 'PENDING' && (
             <Link href={`/student/reports/edit/${report.id}`} passHref className="flex-1">
                <Button variant="default" size="sm" className="w-full rounded-lg text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
            </Link>
          )}
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
        <CardContent className={cn(isMobile && filteredReports.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {filteredReports.length > 0 ? (
            isMobile ? (
                filteredReports.map((report) => <ReportCardMobile key={report.id} report={report} />)
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title/Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{format(parseISO(report.date), "PPP")}</TableCell>
                    <TableCell className="max-w-sm truncate">
                      <span className="font-medium">{(report as any).title || 'Daily Report'}</span>
                      <p className="text-xs text-muted-foreground truncate">{(report as any).description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[report.status])}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Link href={`/student/reports/${report.id}`} passHref>
                        <Button variant="ghost" size="sm" className="rounded-md"><Eye className="mr-1 h-4 w-4"/>View</Button>
                      </Link>
                      {report.status === 'PENDING' && (
                        <Link href={`/student/reports/edit/${report.id}`} passHref>
                            <Button variant="ghost" size="sm" className="rounded-md"><Edit3 className="mr-1 h-4 w-4"/>Edit</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
          ) : (
            <div className={cn("py-12", isMobile ? "p-4" : "p-6")}>
              <EmptyState
                icon={FileText}
                title="No Reports Found"
                description="You haven't submitted any reports yet or none match your current filters."
                actionLabel="Submit New Report"
                onAction={() => window.location.href = '/student/reports/new'}
              />
            </div>
          )}
        </CardContent>
        {!isMobile && filteredReports.length > 0 && (
          <CardFooter className="justify-end p-4 border-t">
             <p className="text-sm text-muted-foreground">Showing {filteredReports.length} of {allReports.length} reports</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

    