
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, Calendar, Edit3, MessageSquare, Paperclip, ThumbsUp, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide's Image icon
import { getReportById } from '@/lib/services/report.service';
import { useParams, useRouter } from 'next/navigation';
import { DUMMY_REPORTS } from '@/lib/constants'; // Corrected import


const statusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

type ExtendedDailyReport = DailyReport & { 
  title?: string; 
  challengesFaced?: string; 
  securePhotoUrl?: string;
  // supervisorComments is already in DailyReport from types.ts if you updated it
};

export default function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const router = useRouter();
  const [report, setReport] = React.useState<ExtendedDailyReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadReport() {
      const foundReport = await getReportById(params.reportId);
      if (foundReport) {
        setReport(foundReport as ExtendedDailyReport);
      }
      setIsLoading(false);
    }
    loadReport();
  }, [params.reportId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
        <div className="space-y-8 p-4 md:p-6">
         <PageHeader
            title="Report Not Found"
            icon={FileText}
            breadcrumbs={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/reports", label: "Work Reports" },
                { label: "Error" }
            ]}
            />
        <Card className="shadow-lg rounded-xl">
            <CardContent className="p-10 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-xl font-semibold text-destructive-foreground">Could not find the requested report.</p>
            <p className="text-muted-foreground mt-2">The report ID '{params.reportId}' might be invalid or the report has been removed.</p>
            <Button asChild className="mt-6">
                <Link href="/reports">Go Back to Reports List</Link>
            </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  const reportTitle = report.title || `Report - ${format(parseISO(report.date), "do MMM yyyy")}`;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={reportTitle}
        description={`Detailed view of your work report submitted on ${format(parseISO(report.date), "MMMM d, yyyy")}.`}
        icon={FileText}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reports", label: "Work Reports" },
          { label: report.title ? `Report: ${report.title.substring(0,30)}${report.title.length > 30 ? "..." : ""}` : `Report - ${report.id}` }
        ]}
        actions={
          report.status === 'PENDING' && ( // Or SUBMITTED, depending on your workflow
            <Link href={`/reports/edit/${report.id}`} passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Report
              </Button>
            </Link>
          )
        }
      />

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
              <CardTitle className="font-headline text-xl md:text-2xl">{report.title || 'Work Report Details'}</CardTitle>
              <CardDescription className="text-sm">Submitted on {format(parseISO(report.date), "MMMM d, yyyy")}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1 self-start sm:self-center", statusColors[report.status])}>
              {report.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3>
                <p className="text-muted-foreground">{format(parseISO(report.date), "PPP")}</p>
            </div>
             {/* Add other top-level info here if needed, like student name if this page was generic */}
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Summary of Work Done</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.description}</p>
          </div>

          {report.challengesFaced && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" />Challenges Faced</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.challengesFaced}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-primary" />Key Learnings / Outcomes</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.learningObjectives}</p> 
            {/* Ensure `learningObjectives` is the primary field as per types, or `outcomes` also if distinct */}
             {report.outcomes && report.outcomes !== report.learningObjectives && (
                 <div className="mt-2">
                    <h4 className="text-md font-medium text-foreground">Specific Outcomes:</h4>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.outcomes}</p>
                 </div>
             )}
          </div>
          
          {report.securePhotoUrl && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Secure Photo</h3>
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border shadow-sm" data-ai-hint="workplace photo">
                    <NextImage src={report.securePhotoUrl} alt="Securely captured photo" layout="fill" objectFit="cover" />
                </div>
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
              <ul className="list-none space-y-2">
                {report.attachments.map((file, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80 font-normal" asChild>
                      <a href={`/placeholder-download/${file}`} target="_blank" rel="noopener noreferrer" data-ai-hint="document file">
                        <Paperclip className="mr-1 h-4 w-4" /> {file}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {report.supervisorComments && (
            <>
            <Separator />
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Supervisor Comments</h3>
                <Card className="bg-muted/30 p-4 border-l-4 border-primary shadow-inner">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{report.supervisorComments}</p>
                </Card>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    