
'use client';
import PageHeader from '@/components/shared/page-header';
import DailyReportForm from '@/components/forms/daily-report-form';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewReportPage() {
  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Submit New Work Report"
        description="Detail your work, attach multimedia, and submit for supervisor approval."
        icon={FileText}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/student/reports", label: "Work Reports" },
          { label: "New Report" }
        ]}
      />
      <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="p-6">
            <CardTitle className="font-headline text-xl">Report Details</CardTitle>
            <CardDescription>Ensure all sections are completed accurately before submission.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <DailyReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
