'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, Calendar, Edit3, MessageSquare, Paperclip, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport } from '@/types'; // Assuming DailyReport type
import { format } from 'date-fns';

// Dummy report data - replace with actual data fetching
const DUMMY_REPORT_DETAIL: DailyReport & { title?: string; challengesFaced?: string; learnings?: string; securePhotoUrl?: string } = {
  id: 'report1',
  date: '2024-07-28',
  title: 'User Authentication Module Finalization',
  description: 'This report covers the final stages of development for the user authentication module. Key activities included rigorous testing, bug fixing, documentation updates, and preparation for deployment. All core features (registration, login, password reset, JWT sessions) are now complete and stable.', // Summary
  outcomes: 'Authentication module is feature-complete and production-ready. Achieved 95% test coverage. Documentation finalized.', // Not directly in form, but can be part of general data
  learningObjectives: 'Deepened understanding of security best practices in authentication. Improved debugging skills for complex systems. Enhanced proficiency in writing technical documentation.', // Learnings
  studentId: 'stu1',
  status: 'APPROVED',
  challengesFaced: "Initial integration with the notification service proved challenging due to API version mismatch. Resolved by updating the service client library.",
  attachments: ['final_auth_report.pdf', 'test_results.xlsx'],
  securePhotoUrl: 'https://placehold.co/600x400.png', // Placeholder for secure photo
  supervisorComments: "Outstanding work on finalizing this critical module. The thorough testing and documentation are commendable. The solution to the notification service issue was well-handled.",
};

const statusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  SUBMITTED: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  APPROVED: 'bg-green-500/20 text-green-700 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-700 border-red-500/30',
};

export default function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const report = DUMMY_REPORT_DETAIL; // In a real app, fetch report by params.reportId

  if (!report) {
    return <div>Report not found.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={report.title || `Report: ${format(new Date(report.date), "PPP")}`}
        description="Detailed view of your submitted work report."
        icon={FileText}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reports", label: "Work Reports" },
          { label: report.title ? `Report: ${report.title.substring(0,20)}...` : `Report - ${report.id}` }
        ]}
        actions={
          report.status === 'PENDING' && ( // Allow editing only if pending
            <Link href={`/reports/edit/${report.id}`} passHref> {/* Assuming an edit route */}
              <Button>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Report
              </Button>
            </Link>
          )
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">{report.title || 'Work Report'}</CardTitle>
              <CardDescription>Submitted on {format(new Date(report.date), "MMMM d, yyyy")}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1", statusColors[report.status])}>
              {report.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3>
              <p className="text-foreground">{format(new Date(report.date), "PPP")}</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Summary of Work Done</h3>
            <p className="text-muted-foreground whitespace-pre-line">{report.description}</p>
          </div>

          {report.challengesFaced && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" />Challenges Faced</h3>
              <p className="text-muted-foreground whitespace-pre-line">{report.challengesFaced}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-primary" />Key Learnings</h3>
            <p className="text-muted-foreground whitespace-pre-line">{report.learningObjectives}</p>
          </div>
          
          {report.securePhotoUrl && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Secure Photo</h3>
                <div className="w-full max-w-md rounded-lg overflow-hidden border" data-ai-hint="person workplace">
                    <img src={report.securePhotoUrl} alt="Securely captured photo" className="object-contain" />
                </div>
            </div>
          )}

          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
              <ul className="list-disc pl-5 space-y-1">
                {report.attachments.map((file, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80" asChild>
                      <a href={`/path/to/attachments/${file}`} target="_blank" rel="noopener noreferrer" data-ai-hint="document file">
                        {file}
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
                <Card className="bg-muted/50 p-4 border-l-4 border-primary">
                    <p className="text-foreground whitespace-pre-line">{report.supervisorComments}</p>
                </Card>
            </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
