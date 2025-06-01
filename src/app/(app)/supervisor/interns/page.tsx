
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, User, CheckSquare, FileCheck, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

  const totalPendingTasks = interns.reduce((sum, i) => sum + i.pendingTasks, 0);
  const totalPendingReports = interns.reduce((sum, i) => sum + i.pendingReports, 0);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Interns"
        description="Oversee and manage interns under your supervision."
        icon={Briefcase}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "My Interns" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/supervisor/interns/approve-tasks">
              <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground">
                <CheckSquare className="mr-2 h-4 w-4" /> Approve Tasks {totalPendingTasks > 0 && `(${totalPendingTasks})`}
              </Button>
            </Link>
            <Link href="/supervisor/interns/approve-reports">
              <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground">
                <FileCheck className="mr-2 h-4 w-4" /> Approve Reports {totalPendingReports > 0 && `(${totalPendingReports})`}
              </Button>
            </Link>
          </div>
        }
      />
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Interns List</CardTitle>
          <CardDescription>Overview of interns, their pending items, and recent activity.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {interns.length > 0 ? (
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
                        <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />View Profile</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground p-6">
              <User className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No interns assigned to you currently.</p>
            </div>
          )}
        </CardContent>
        {interns.length > 0 && (
        <CardFooter className="justify-end p-4 border-t">
            <p className="text-sm text-muted-foreground">Showing {interns.length} interns</p>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}

