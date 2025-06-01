
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, Calendar, Edit3, MessageSquare, Paperclip, ThumbsUp, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const DUMMY_REPORT_DETAIL: DailyReport & { title?: string; challengesFaced?: string; learnings?: string; securePhotoUrl?: string } = {
  id: 'report1',
  date: '2024-07-28',
  title: 'User Authentication Module Finalization',
  description: 'This report covers the final stages of development for the user authentication module. Key activities included rigorous testing, bug fixing, documentation updates, and preparation for deployment. All core features (registration, login, password reset, JWT sessions) are now complete and stable.',
  outcomes: 'Authentication module is feature-complete and production-ready. Achieved 95% test coverage. Documentation finalized.',
  learningObjectives: 'Deepened understanding of security best practices in authentication. Improved debugging skills for complex systems. Enhanced proficiency in writing technical documentation.',
  studentId: 'stu1',
  status: 'APPROVED',
  challengesFaced: "Initial integration with the notification service proved challenging due to API version mismatch. Resolved by updating the service client library.",
  attachments: ['final_auth_report.pdf', 'test_results.xlsx'],
  securePhotoUrl: 'https://placehold.co/600x400.png',
  supervisorComments: "Outstanding work on finalizing this critical module. The thorough testing and documentation are commendable. The solution to the notification service issue was well-handled.",
};

const statusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const report = DUMMY_REPORT_DETAIL; 

  if (!report) {
    return <div className="p-6 text-center text-lg">Report not found.</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={report.title || `Report: ${format(new Date(report.date), "PPP")}`}
        description="Detailed view of your submitted work report."
        icon={FileText}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reports", label: "Work Reports" },
          { label: report.title ? `Report: ${report.title.substring(0,30)}${report.title.length > 30 ? "..." : ""}` : `Report - ${report.id}` }
        ]}
        actions={
          report.status === 'PENDING' && (
            <Link href={`/reports/edit/${report.id}`} passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
              <CardDescription className="text-sm">Submitted on {format(new Date(report.date), "MMMM d, yyyy")}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1 self-start sm:self-center", statusColors[report.status])}>
              {report.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3>
              <p className="text-foreground text-base">{format(new Date(report.date), "PPP")}</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Summary of Work Done</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.description}</p>
          </div>

          {report.challengesFaced && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" />Challenges Faced</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.challengesFaced}</p>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-primary" />Key Learnings</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.learningObjectives}</p>
          </div>
          
          {report.securePhotoUrl && (
            <div>
                <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Secure Photo</h3>
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border shadow-sm" data-ai-hint="workplace photo">
                    <Image src={report.securePhotoUrl} alt="Securely captured photo" layout="fill" objectFit="cover" />
                </div>
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
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
                <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Supervisor Comments</h3>
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
