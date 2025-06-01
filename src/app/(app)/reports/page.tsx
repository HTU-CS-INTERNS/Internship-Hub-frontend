
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DailyReport } from '@/types';
import { cn } from '@/lib/utils';

const DUMMY_REPORTS: DailyReport[] = [
  { id: 'report1', date: '2024-07-26', description: 'Weekly summary of authentication module progress.', outcomes: 'Module 70% complete.', learningObjectives: 'Project management and reporting.', studentId: 'stu1', status: 'APPROVED' },
  { id: 'report2', date: '2024-07-27', description: 'Mid-internship review presentation preparation.', outcomes: 'Presentation draft ready.', learningObjectives: 'Presentation skills.', studentId: 'stu1', status: 'SUBMITTED' },
  { id: 'report3', date: '2024-07-25', description: 'Initial setup and planning for the new feature X.', outcomes: 'Project plan created.', learningObjectives: 'Agile planning.', studentId: 'stu1', status: 'PENDING' },
  { id: 'report4', date: '2024-07-24', description: 'Bug fixing for version 1.2 release.', outcomes: 'Critical bugs resolved.', learningObjectives: 'Debugging techniques.', studentId: 'stu1', status: 'REJECTED' },
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

  React.useEffect(() => {
    setFilteredReports(DUMMY_REPORTS.filter(report => statusFilter[report.status]));
  }, [statusFilter]);
  
  const handleStatusFilterChange = (status: DailyReport['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Work Reports"
        description="Submit your daily work reports and track their approval status."
        icon={FileText}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Work Reports" }]}
        actions={
           <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground">
                  <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
            <Link href="/reports/new" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Submit New Report
              </Button>
            </Link>
          </div>
        }
      />
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Report History</CardTitle>
          <CardDescription>A log of all your submitted work reports.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReports.length > 0 ? (
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
                       <Link href={`/reports/${report.id}`} passHref>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12 text-muted-foreground p-6">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No reports found.</p>
              <p>Submit a new report or adjust your filters.</p>
            </div>
          )}
        </CardContent>
        {filteredReports.length > 0 && (
          <CardFooter className="justify-end p-4 border-t">
             <p className="text-sm text-muted-foreground">Showing {filteredReports.length} of {DUMMY_REPORTS.length} reports</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
