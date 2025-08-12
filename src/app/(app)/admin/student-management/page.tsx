
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddPendingStudentForm } from '@/components/admin/add-pending-student-form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AdminService } from '@/lib/services';
import EmptyState from '@/components/shared/empty-state';
import { Users, AlertCircle, Loader2 } from 'lucide-react';

// This interface now reflects that the user object can be optional for pending students
interface PendingStudent {
  id: number;
  student_id_number: string;
  email: string;
  first_name: string;
  last_name: string;
  faculty_id: number;
  department_id: number;
  program_of_study?: string;
  is_verified: boolean;
  created_at: string;
  status: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  faculties: {
    id: number;
    name: string;
  };
  departments: {
    id: number;
    name: string;
  };
}

function PendingStudentsList() {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminService.getPendingStudents();
      if (response.success && response.data) {
        setPendingStudents(Array.isArray(response.data) ? response.data as any : []);
      } else {
        throw new Error(response.error || 'Failed to fetch pending students');
      }
    } catch (error) {
      console.error('Failed to fetch pending students:', error);
      setError('Failed to load pending students');
      toast({
        title: 'Error',
        description: 'Failed to fetch pending students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="ml-2 text-sm text-muted-foreground">Loading pending students...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
        <EmptyState
            icon={AlertCircle}
            title="Failed to Load Students"
            description={error}
            actionLabel="Try Again"
            onAction={fetchPendingStudents}
        />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Students ({pendingStudents.length})</CardTitle>
        <CardDescription>Students who have been added but have not yet verified their accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Pending Students"
            description="There are no students awaiting verification."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.student_id_number}
                    </TableCell>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'PENDING' ? 'secondary' : 'default'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4">
          <Button onClick={fetchPendingStudents} variant="outline" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">
          Add students eligible for internship and monitor their verification status
        </p>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Add Student</TabsTrigger>
          <TabsTrigger value="pending">Pending Students</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <AddPendingStudentForm />
        </TabsContent>

        <TabsContent value="pending">
          <PendingStudentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
