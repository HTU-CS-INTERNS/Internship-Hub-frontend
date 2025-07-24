
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Building, User, Mail, Phone, MapPinIcon, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';

const getInitials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function CompanyPage() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch company data from API
  React.useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await StudentApiService.getCompanyInfo();
        setCompanyData(data);
      } catch (err) {
        console.error('Failed to fetch company data:', err);
        setError('Failed to load company information');
        setCompanyData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-8 w-8 text-destructive mx-auto mb-4" />
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

  if (!companyData) {
    return (
      <EmptyState
        icon={Building}
        title="No Company Information"
        description="Your internship company information will appear here once your internship is assigned."
        actionLabel="Contact Support"
        onAction={() => console.log('Contact support')}
      />
    );
  }

  const company = companyData.company || {};
  const supervisor = companyData.supervisor || {};

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Internship Company"
        description={`Details about ${company.name} and your supervisor.`}
        icon={Building}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "My Company" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="p-6 border-b bg-muted/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Image 
                        src={company.logoUrl} 
                        alt={`${company.name} logo`} 
                        width={80} 
                        height={80} 
                        className="rounded-lg border bg-card shadow-sm"
                        data-ai-hint="company logo" 
                    />
                    <div>
                        <CardTitle className="font-headline text-2xl text-primary">{company.name}</CardTitle>
                        <CardDescription className="text-sm">{company.industry}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">About {company.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{company.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">Address:</p>
                  <p className="text-muted-foreground">{company.address}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Company Size:</p>
                  <p className="text-muted-foreground">{company.size}</p>
                </div>
                 <div>
                  <p className="font-medium text-foreground">Website:</p>
                  <Link href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {company.website}
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-foreground mb-2">Company Guidelines & Resources</h4>
                 <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li><Link href="#" className="text-primary hover:underline">Internship Handbook (PDF)</Link></li>
                    <li><Link href="#" className="text-primary hover:underline">Code of Conduct</Link></li>
                    <li><Link href="#" className="text-primary hover:underline">Onboarding Materials</Link></li>
                  </ul>
              </div>
            </CardContent>
             <CardFooter className="p-6 border-t">
                <Button variant="outline" className="rounded-lg" asChild>
                    <Link href="/profile#internship">
                        <Building className="mr-2 h-4 w-4" /> View/Edit Internship Details
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-xl rounded-xl">
            <CardHeader className="p-6 border-b text-center bg-primary text-primary-foreground">
              <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary-foreground/50 shadow-lg">
                <AvatarImage src={supervisor.avatarUrl} alt={supervisor.name} data-ai-hint="person office"/>
                <AvatarFallback className="text-3xl bg-primary-foreground/20 text-primary-foreground">{getInitials(supervisor.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl">{supervisor.name}</CardTitle>
              <CardDescription className="text-primary-foreground/80">{supervisor.title}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground break-all">{supervisor.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{supervisor.phone}</span>
              </div>
               <div className="flex items-start gap-3">
                <MapPinIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{company.address.split(',')[1]?.trim() || 'Main Office'}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                <Link href="/communication" className="w-full">
                    <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                        <MessageSquare className="mr-2 h-4 w-4"/> Contact Supervisor
                    </Button>
                </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
