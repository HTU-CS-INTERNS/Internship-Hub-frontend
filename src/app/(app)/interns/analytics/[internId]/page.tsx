
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { BarChart3, User, Loader2, AlertTriangle } from 'lucide-react';
import { DUMMY_INTERNS } from '@/app/(app)/interns/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InternAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const [internName, setInternName] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setInternName(foundIntern.name);
    }
    setIsLoading(false);
  }, [internId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (!internName) {
    return (
      <div className="p-6">
        <PageHeader
          title="Analytics Not Found"
          icon={AlertTriangle}
          breadcrumbs={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/interns", label: "My Interns" },
            { label: "Error" }
          ]}
        />
        <Card className="shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
                <p className="text-lg text-destructive-foreground">Intern details not found for ID: {internId}.</p>
                <Link href="/interns" passHref>
                    <Button variant="outline" className="mt-4">Back to Interns List</Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Performance Analytics: ${internName}`}
        description={`Detailed performance metrics and trends for ${internName}.`}
        icon={BarChart3}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/interns", label: "My Interns" },
          { href: `/interns/details/${internId}`, label: internName },
          { label: "Analytics" }
        ]}
      />
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
            <CardTitle className="font-headline text-xl">Detailed Analytics Dashboard (Placeholder)</CardTitle>
            <CardDescription>This section will display comprehensive performance data.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-20 w-20 text-muted-foreground/30 mb-6"/>
            <p className="text-lg font-semibold text-foreground">Analytics Coming Soon!</p>
            <p className="text-muted-foreground max-w-md">
                Detailed charts and statistics regarding {internName}'s report submission timeliness, task completion rates, check-in consistency, supervisor feedback trends, and overall progress will be displayed here.
            </p>
            <Link href={`/interns/details/${internId}`} className="mt-6">
                <Button variant="outline" className="rounded-lg">Back to {internName}'s Profile</Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
