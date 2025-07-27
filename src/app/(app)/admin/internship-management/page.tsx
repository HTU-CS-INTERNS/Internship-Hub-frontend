'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, Search, Eye, Edit, Archive, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminApiService } from '@/lib/services/adminApi';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { getPlacementsFromStorage } from '@/lib/services/hod.service';

const LocationPicker = dynamic(() => import('./components/location-picker'), { ssr: false });

interface Internship {
  id: string;
  studentName: string;
  studentId: string;
  companyName: string;
  position: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Terminated' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  faculty: string;
  department: string;
}

export default function InternshipManagementPage() {
  const { toast } = useToast();
  const [internships, setInternships] = React.useState<Internship[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [selectedInternship, setSelectedInternship] = React.useState<Internship | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all placements and assume they are approved since there's no approval step
      const allPlacements = await getPlacementsFromStorage();
      const mappedPlacements = allPlacements.map((p: any) => ({
        id: p.studentId, // Use studentId as unique key for this view
        studentName: p.studentName,
        studentId: p.studentId,
        companyName: p.companyName,
        position: 'Intern', // Position not captured in form, using default
        status: 'APPROVED', // Status is now always approved
        startDate: p.startDate,
        endDate: p.endDate,
        faculty: 'N/A', // Faculty/Dept not available in localStorage model
        department: 'N/A',
      }));

      setInternships(mappedPlacements);
    } catch (err) {
      console.error('Failed to fetch internships:', err);
      setError('Failed to load internships');
      setInternships([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInternships();
  }, []);
  
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      internship.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || internship.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'APPROVED':
         return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending': 
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Terminated': 
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="Internship Management"
          description="Monitor and manage all student internships across the university."
          icon={Briefcase}
          breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "Internship Management" }
          ]}
        />
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading internships...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="Internship Management"
          description="Monitor and manage all student internships across the university."
          icon={Briefcase}
          breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "Internship Management" }
          ]}
        />
        <EmptyState
          icon={Briefcase}
          title="Failed to Load Internships"
          description="We couldn't load the internship data. Please try again."
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="Internship Management"
          description="Monitor and manage all student internships across the university. Submissions are now auto-approved."
          icon={Briefcase}
          breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "Internship Management" }
          ]}
        />

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>All Internships ({filteredInternships.length})</CardTitle>
            <CardDescription>
              View and manage student internship placements and their progress.
            </CardDescription>
            
            <div className="flex gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, company, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] rounded-lg">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredInternships.length === 0 ? (
                 <EmptyState
                    icon={Briefcase}
                    title={internships.length === 0 ? "No Internships Found" : "No Matching Internships"}
                    description={internships.length === 0 ? "There are no internships registered yet." : "Try adjusting your search criteria or filters."}
                    actionLabel={internships.length === 0 ? undefined : "Clear Filters"}
                    onAction={internships.length === 0 ? undefined : () => {
                        setSearchTerm('');
                        setStatusFilter('all');
                    }}
                    />
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Company & Position</TableHead>
                    <TableHead>Faculty/Department</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInternships.map((internship) => (
                    <TableRow key={internship.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{internship.studentName}</p>
                          <p className="text-sm text-muted-foreground">ID: {internship.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{internship.companyName}</p>
                          <p className="text-sm text-muted-foreground">{internship.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{internship.faculty}</p>
                          <p className="text-xs text-muted-foreground">{internship.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(internship.startDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">to {new Date(internship.endDate).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(internship.status)}>
                          {internship.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
