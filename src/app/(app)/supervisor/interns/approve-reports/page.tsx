
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ApproveReportsPage() {

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
          <CardTitle className="font-headline text-lg">Feature Not Applicable</CardTitle>
          <CardDescription>
            This feature is managed by the university's academic staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-10 text-muted-foreground">
                <ShieldAlert className="mx-auto h-12 w-12 mb-3 text-amber-500" />
                <p className="font-semibold text-lg">Report approvals are handled by the intern's assigned lecturer.</p>
                <p className="mt-2">Your role is to approve daily tasks and provide overall performance evaluations. Please refer to the intern's detail page for these actions.</p>
                 <Button asChild className="mt-6 rounded-lg">
                    <Link href="/supervisor/interns">Back to My Interns</Link>
                </Button>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
