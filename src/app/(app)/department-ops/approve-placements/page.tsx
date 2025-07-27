
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ApprovePlacementsPage() {

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Internship Placements"
        description="Internship placement submissions are now automatically approved and do not require manual review."
        icon={Briefcase}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/department-ops", label: "Department Ops" },
          { label: "Placements" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">No Pending Placements</CardTitle>
          <CardDescription>
            The manual approval step has been removed. All student submissions are now automatically processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <p className="text-lg font-semibold">All Clear!</p>
              <p>No placements require your review.</p>
              <Button asChild className="mt-4">
                <Link href="/analytics">View Department Analytics</Link>
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
