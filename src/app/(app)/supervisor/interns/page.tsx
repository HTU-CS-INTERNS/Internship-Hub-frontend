
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, User, CheckSquare, FileCheck, Eye, Users as UsersIcon, Mail, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface InternUnderSupervision {
  id: string;
  name: string;
  avatar: string;
  email: string;
  university: string;
  pendingTasks: number;
  pendingReports: number;
  lastActivity: string;
}

export const DUMMY_INTERNS: InternUnderSupervision[] = [
  { id: 'intern1', name: 'Samuel Green', avatar: 'https://placehold.co/100x100.png', email: 'samuel@example.com', university: 'State University - CompSci', pendingTasks: 2, pendingReports: 1, lastActivity: 'Submitted task 2h ago' },
  { id: 'intern2', name: 'Olivia Blue', avatar: 'https://placehold.co/100x100.png', email: 'olivia@example.com', university: 'Tech Institute - Design', pendingTasks: 0, pendingReports: 0, lastActivity: 'Report approved yesterday' },
  { id: 'intern3', name: 'Ethan Red', avatar: 'https://placehold.co/100x100.png', email: 'ethan@example.com', university: 'City College - Engineering', pendingTasks: 5, pendingReports: 2, lastActivity: 'Declared task 30m ago' },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

export default function InternsPage() {
  const [interns] = React.useState<InternUnderSupervision[]>(DUMMY_INTERNS);
  const isMobile = useIsMobile();

  const totalPendingTasks = interns.reduce((sum, i) => sum + i.pendingTasks, 0);
  const totalPendingReports = interns.reduce((sum, i) => sum + i.pendingReports, 0);

  const InternCardMobile: React.FC<{ intern: InternUnderSupervision }> = ({ intern }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/30 border-b">
             <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint="person portrait" />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(intern.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{intern.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{intern.email}</CardDescription>
                </div>
            </div>
        </CardHeader>
      <CardContent className="p-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">University:</span> {intern.university}</div>
        <div className="flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Pending Tasks:</span> <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="ml-auto text-xs px-1.5 py-0.5">{intern.pendingTasks}</Badge></div>
        <div className="flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Pending Reports:</span> <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"} className="ml-auto text-xs px-1.5 py-0.5">{intern.pendingReports}</Badge></div>
        <div className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Last Activity:</span> {intern.lastActivity}</div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/20">
         <Link href={`/supervisor/interns/details/${intern.id}`} passHref className="w-full">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
            </Button>
          </Link>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Interns"
        description="Oversee and manage interns under your supervision."
        icon={UsersIcon}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "My Interns" }]}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/supervisor/interns/approve-tasks" className="w-full sm:w-auto">
              <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground w-full rounded-lg">
                <CheckSquare className="mr-2 h-4 w-4" /> Approve Tasks {totalPendingTasks > 0 && `(${totalPendingTasks})`}
              </Button>
            </Link>
            <Link href="/supervisor/interns/approve-reports" className="w-full sm:w-auto">
              <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground w-full rounded-lg">
                <FileCheck className="mr-2 h-4 w-4" /> Approve Reports {totalPendingReports > 0 && `(${totalPendingReports})`}
              </Button>
            </Link>
          </div>
        }
      />
      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "overflow-hidden")}>
        {!isMobile && (
        <CardHeader>
          <CardTitle className="font-headline text-lg">Interns List</CardTitle>
          <CardDescription>Overview of interns, their pending items, and recent activity.</CardDescription>
        </CardHeader>
        )}
        <CardContent className={cn(isMobile && interns.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {interns.length > 0 ? (
            isMobile ? (
                interns.map(intern => <InternCardMobile key={intern.id} intern={intern} />)
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>University/Program</TableHead>
                <TableHead className="text-center">Pending Tasks</TableHead>
                <TableHead className="text-center">Pending Reports</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.map((intern) => (
                <TableRow key={intern.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{getInitials(intern.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{intern.name}</p>
                        <p className="text-xs text-muted-foreground">{intern.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{intern.university}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="text-xs">
                      {intern.pendingTasks}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"} className="text-xs">
                      {intern.pendingReports}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{intern.lastActivity}</TableCell>
                  <TableCell className="text-right">
                     <Link href={`/supervisor/interns/details/${intern.id}`} passHref>
                        <Button variant="ghost" size="sm" className="rounded-md"><Eye className="mr-1 h-4 w-4" />View Profile</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )) : (
            <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <User className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No interns assigned to you currently.</p>
            </div>
          )}
        </CardContent>
        {!isMobile && interns.length > 0 && (
        <CardFooter className="justify-end p-4 border-t">
            <p className="text-sm text-muted-foreground">Showing {interns.length} interns</p>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}

    