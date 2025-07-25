
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, User, CheckSquare, Eye, Users as UsersIcon, Mail, TrendingUp, Loader2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/shared/empty-state';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SupervisorApiService } from '@/lib/services/supervisorApi';
import { toast } from 'sonner';

interface InternUnderSupervision {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
  university: string;
  department: string;
  pendingTasks: number;
  lastActivity?: string;
  progress: number;
  status: string;
  totalCheckIns?: number;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

export default function InternsPage() {
  const [interns, setInterns] = React.useState<InternUnderSupervision[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setIsLoading(true);
      const data = await SupervisorApiService.getMyInterns();
      
      if (data && Array.isArray(data)) {
        setInterns(data.map((intern: any) => {
          const student = intern.students;
          const user = student?.users;
          const internName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
          
          return {
            id: intern.id.toString(),
            name: internName,
            avatar: null, // Profile pictures not implemented
            email: user?.email || 'No email',
            university: student?.faculties?.name || 'Unknown University',
            department: student?.departments?.name || 'Unknown Department',
            pendingTasks: intern.pendingTasks || 0,
            lastActivity: 'Recent activity', // Could be calculated from check-ins
            progress: intern.progress || 0,
            status: intern.status || 'active',
            totalCheckIns: intern.totalCheckIns || 0
          };
        }));
      } else {
        setInterns([]);
      }
    } catch (error) {
      console.error('Failed to fetch interns:', error);
      setError('Failed to load interns');
      toast.error('Failed to load interns');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || intern.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPendingTasks = filteredInterns.reduce((sum, i) => sum + i.pendingTasks, 0);

  const InternCardMobile: React.FC<{ intern: InternUnderSupervision }> = ({ intern }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/30 border-b">
             <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={intern.avatar || undefined} alt={intern.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(intern.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{intern.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{intern.email}</CardDescription>
                </div>
            </div>
        </CardHeader>
      <CardContent className="p-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> 
          <span className="text-muted-foreground">University:</span> 
          {intern.university}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Progress:</span> 
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{intern.progress}%</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" /> 
          <span className="text-muted-foreground">Pending Tasks:</span> 
          <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="ml-auto text-xs px-1.5 py-0.5">
            {intern.pendingTasks}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /> 
          <span className="text-muted-foreground">Last Activity:</span> 
          {intern.lastActivity}
        </div>
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
        description="Oversee and manage tasks for interns under your supervision."
        icon={UsersIcon}
        breadcrumbs={[{ href: "/supervisor/dashboard", label: "Dashboard" }, { label: "My Interns" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/supervisor/interns/approve-tasks">
              <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground">
                <CheckSquare className="mr-2 h-4 w-4" /> 
                Approve Tasks {totalPendingTasks > 0 && `(${totalPendingTasks})`}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interns by name, email, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "overflow-hidden")}>
        {!isMobile && (
        <CardHeader>
          <CardTitle className="font-headline text-lg">Interns List</CardTitle>
          <CardDescription>Overview of interns, their pending tasks, and recent activity.</CardDescription>
        </CardHeader>
        )}
        <CardContent className={cn(isMobile && filteredInterns.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading interns...</span>
            </div>
          ) : error ? (
            <EmptyState
              icon={UsersIcon}
              title="Error Loading Interns"
              description={error}
              actionLabel="Try Again"
              onAction={fetchInterns}
            />
          ) : filteredInterns.length === 0 ? (
            <EmptyState
              icon={User}
              title={searchTerm || statusFilter !== 'all' ? "No Interns Found" : "No Interns Assigned"}
              description={
                searchTerm || statusFilter !== 'all'
                  ? "No interns match your current search criteria."
                  : "You don't have any interns assigned to you currently."
              }
              actionLabel={searchTerm || statusFilter !== 'all' ? "Clear Filters" : undefined}
              onAction={
                (searchTerm || statusFilter !== 'all') ? () => { setSearchTerm(''); setStatusFilter('all'); } : undefined
              }
            />
          ) : (
            isMobile ? (
                filteredInterns.map(intern => <InternCardMobile key={intern.id} intern={intern} />)
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>University/Program</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-center">Pending Tasks</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterns.map((intern) => (
                <TableRow key={intern.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={intern.avatar || undefined} alt={intern.name} />
                        <AvatarFallback>{getInitials(intern.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{intern.name}</p>
                        <p className="text-xs text-muted-foreground">{intern.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{intern.university}</p>
                      <p className="text-xs text-muted-foreground">{intern.department}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {intern.progress}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="text-xs">
                      {intern.pendingTasks}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{intern.lastActivity}</TableCell>
                  <TableCell className="text-right">
                     <Link href={`/supervisor/interns/details/${intern.id}`} passHref>
                        <Button variant="ghost" size="sm" className="rounded-md">
                          <Eye className="mr-1 h-4 w-4" />View Profile
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          ))}
        </CardContent>
        {!isMobile && filteredInterns.length > 0 && !isLoading && (
        <CardFooter className="justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInterns.length} of {interns.length} interns
            </p>
            <Button onClick={fetchInterns} variant="outline" size="sm">
              Refresh
            </Button>
        </CardFooter>
        )}
      </Card>
    </div>
  );
}
