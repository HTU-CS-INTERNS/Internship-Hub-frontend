'use client';
import PageHeader from '@/components/shared/page-header';
import DailyReportForm from '@/components/forms/daily-report-form'; // Assuming a specific report form or reusing task form
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewReportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Submit New Work Report"
        description="Detail your work, attach multimedia, and submit for supervisor approval."
        icon={FileText}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reports", label: "Work Reports" },
          { label: "New Report" }
        ]}
      />
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl">Report Details</CardTitle>
            <CardDescription>Ensure all sections are completed accurately before submission.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Reusing DailyTaskForm for reports for simplicity. Create DailyReportForm if different. */}
          <DailyReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
