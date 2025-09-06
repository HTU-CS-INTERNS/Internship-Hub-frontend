'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFaculties, useDepartments } from '@/hooks/useApiData';
import { apiClient } from '@/lib/api-client';
import type { Faculty, Department } from '@/types';

interface AddStudentFormData {
  student_id_number: string;
  email: string;
  first_name: string;
  last_name: string;
  faculty_id: number | null;
  department_id: number | null;
  program_of_study: string;
}

export function AddPendingStudentForm() {
  const { toast } = useToast();
  const { faculties, loading: facultiesLoading } = useFaculties();
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const { departments, loading: departmentsLoading } = useDepartments(selectedFacultyId || undefined);
  
  const [formData, setFormData] = useState<AddStudentFormData>({
    student_id_number: '',
    email: '',
    first_name: '',
    last_name: '',
    faculty_id: null,
    department_id: null,
    program_of_study: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.faculty_id || !formData.department_id) {
      toast({
        title: 'Error',
        description: 'Please select both faculty and department',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.request('api/students/pending', {
        method: 'POST',
        body: {
          student_id_number: formData.student_id_number,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          faculty_id: formData.faculty_id,
          department_id: formData.department_id,
          program_of_study: formData.program_of_study || null,
        },
      });

      toast({
        title: 'Success',
        description: 'Student added to pending list successfully',
      });

      // Reset form
      setFormData({
        student_id_number: '',
        email: '',
        first_name: '',
        last_name: '',
        faculty_id: null,
        department_id: null,
        program_of_study: '',
      });
      setSelectedFacultyId(null);

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add student',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacultyChange = (facultyId: string) => {
    const id = parseInt(facultyId);
    setSelectedFacultyId(id);
    setFormData(prev => ({
      ...prev,
      faculty_id: id,
      department_id: null, // Reset department when faculty changes
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Student for Internship</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_id_number">Student ID Number</Label>
              <Input
                id="student_id_number"
                value={formData.student_id_number}
                onChange={(e) => setFormData(prev => ({ ...prev, student_id_number: e.target.value }))}
                placeholder="e.g., STU2024001"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">School Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="student@university.edu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Faculty</Label>
            <Select onValueChange={handleFacultyChange} value={selectedFacultyId?.toString() || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {facultiesLoading ? (
                  <SelectItem value="" disabled>Loading faculties...</SelectItem>
                ) : (
                  faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <Select 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: parseInt(value) }))}
              value={formData.department_id?.toString() || ''}
              disabled={!selectedFacultyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <SelectItem value="" disabled>Loading departments...</SelectItem>
                ) : (
                  departments.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="program_of_study">Program of Study (Optional)</Label>
            <Input
              id="program_of_study"
              value={formData.program_of_study}
              onChange={(e) => setFormData(prev => ({ ...prev, program_of_study: e.target.value }))}
              placeholder="e.g., Computer Science"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Student...' : 'Add Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
