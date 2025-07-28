
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { AdminApiService } from '@/lib/services/adminApi';
import EmptyState from '@/components/shared/empty-state';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import type { UserProfileData } from '@/types';

interface PendingStudent extends UserProfileData {
  faculties?: {
    id: number;
    name: string;
  };
  departments?: {
    id: number;
    name: string;
  };
  admin?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  student_id_number?: string;
  created_at?: string;
}

function PendingStudentsList({ onStudentAdded }: { onStudentAdded: () => void }) {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AdminApiService.getPendingStudents();
      setPendingStudents(Array.isArray(data) ? data : []);

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
  }, [toast]);

  useEffect(() => {
    fetchPendingStudents();
  }, [fetchPendingStudents]);
  
  // Re-fetch when a student is added
  useEffect(() => {
      fetchPendingStudents();
  }, [onStudentAdded, fetchPendingStudents]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading pending students...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Students ({pendingStudents.length})</CardTitle>
        <CardDescription>
          Students who have been added but have not yet completed the verification process to create their accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.student_id_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.faculty_name || 'N/A'}</TableCell>
                    <TableCell>{student.department_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {student.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4">
          <Button onClick={fetchPendingStudents} variant="outline">
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleStudentAdded = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

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
          <AddPendingStudentForm onStudentAdded={handleStudentAdded} />
        </TabsContent>

        <TabsContent value="pending">
          <PendingStudentsList onStudentAdded={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

