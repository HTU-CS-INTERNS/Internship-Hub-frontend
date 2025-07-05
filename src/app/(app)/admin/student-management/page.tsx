'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddPendingStudentForm } from '@/components/admin/add-pending-student-form';
import { apiClient } from '@/lib/api-client';
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
  faculties: {
    id: number;
    name: string;
  };
  departments: {
    id: number;
    name: string;
  };
  admin: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

function PendingStudentsList() {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.request<PendingStudent[]>('api/students/pending');
      setPendingStudents(data);
    } catch (error) {
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
        <CardContent className="p-6">
          <div className="text-center">Loading pending students...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Students ({pendingStudents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending students found
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
                  <TableHead>Added By</TableHead>
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
                    <TableCell>{student.faculties.name}</TableCell>
                    <TableCell>{student.departments.name}</TableCell>
                    <TableCell>
                      <Badge variant={student.is_verified ? 'default' : 'secondary'}>
                        {student.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.admin.first_name} {student.admin.last_name}
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
          <Button onClick={fetchPendingStudents} variant="outline">
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
