
'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFaculties, useDepartments } from '@/hooks/useApiData';
import { AdminService } from '@/lib/services';
import { Loader2, Upload, FileText, X, Download } from 'lucide-react';
import Papa from 'papaparse';
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

interface CSVStudent {
  student_id_number: string;
  email: string;
  first_name: string;
  last_name: string;
  faculty_name: string;
  department_name: string;
  program_of_study?: string;
}

export function AddPendingStudentForm() {
  const { toast } = useToast();
  const { faculties, loading: facultiesLoading } = useFaculties();
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const { departments, loading: departmentsLoading } = useDepartments(selectedFacultyId || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CSVStudent[]>([]);

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
      const result = await AdminService.createStudent({
        student_id_number: formData.student_id_number,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        faculty_id: formData.faculty_id,
        department_id: formData.department_id,
        program_of_study: formData.program_of_study || undefined,
        status: 'PENDING',
      });

      if (!result.success) throw new Error(result.error);

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

  const findFacultyIdByName = (name: string): number | null => {
    const faculty = faculties.find(f => f.name.trim().toLowerCase() === name.trim().toLowerCase());
    return faculty ? faculty.id : null;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsBulkUploading(true);
    setCsvData([]);

    Papa.parse<CSVStudent>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: 'CSV Error',
            description: 'There was an error parsing the CSV file',
            variant: 'destructive',
          });
          setIsBulkUploading(false);
          return;
        }
        setCsvData(results.data);
        setIsBulkUploading(false);
      },
      error: (error) => {
        toast({
          title: 'CSV Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsBulkUploading(false);
      },
    });
  };

  const processCSVData = async () => {
    if (csvData.length === 0) return;
    
    setIsBulkUploading(true);

    const validatedStudents = [];
    const errors: string[] = [];
    
    // Create a temporary, full list of departments for validation, as the hook is filtered
    const allDepartmentsResponse = await AdminService.getDepartments();
    const allDepartments = allDepartmentsResponse.data || [];

    for (const [index, student] of csvData.entries()) {
      const facultyId = findFacultyIdByName(student.faculty_name);
      if (!facultyId) {
        errors.push(`Row ${index + 2}: Faculty "${student.faculty_name}" not found`);
        continue;
      }

      const department = allDepartments.find((d: Department) => 
        d.name.trim().toLowerCase() === student.department_name.trim().toLowerCase() && 
        d.faculty_id === facultyId
      );

      if (!department) {
        errors.push(`Row ${index + 2}: Department "${student.department_name}" not found in faculty "${student.faculty_name}"`);
        continue;
      }

      validatedStudents.push({
        student_id_number: student.student_id_number,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        faculty_id: facultyId,
        department_id: department.id,
        program_of_study: student.program_of_study || undefined,
        status: 'PENDING' as const,
      });
    }

    if (errors.length > 0) {
      toast({
        title: `Validation Errors (${errors.length})`,
        description: (
          <div className="max-h-40 overflow-y-auto">
            {errors.slice(0, 5).map((error, i) => (
              <p key={i} className="text-sm">{error}</p>
            ))}
            {errors.length > 5 && <p className="text-sm font-bold">...and {errors.length - 5} more errors.</p>}
          </div>
        ),
        variant: 'destructive',
        duration: 10000,
      });
      setIsBulkUploading(false);
      return;
    }

    try {
      const result = await AdminService.bulkCreateStudents(validatedStudents);
      if (!result.success) throw new Error(result.error);

      toast({
        title: 'Success',
        description: `${validatedStudents.length} students added successfully`,
      });

      removeFile(); // Reset file input and state
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload students',
        variant: 'destructive',
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName(null);
    setCsvData([]);
  };

  const downloadTemplate = () => {
    const csvContent = "student_id_number,email,first_name,last_name,faculty_name,department_name,program_of_study\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_upload_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add Student for Internship</CardTitle>
        <CardDescription>
          Add a single student using the form below or import multiple students via CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Upload Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              disabled={isBulkUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isBulkUploading ? 'Parsing...' : 'Upload CSV'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            {fileName && (
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  {fileName}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>CSV format must include these headers: `student_id_number,email,first_name,last_name,faculty_name,department_name,program_of_study`</p>
            <p className="mt-2 text-yellow-600">
              Note: `faculty_name` and `department_name` must match exactly with the system records.
            </p>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{csvData.length} students detected in file. Click "Confirm Import" to proceed.</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={removeFile}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processCSVData}
                  disabled={isBulkUploading}
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Import'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or add manually
            </span>
          </div>
        </div>

        {/* Manual Form Section */}
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
                  <SelectItem value="loading" disabled>
                    Loading faculties...
                  </SelectItem>
                ) : faculties.length > 0 ? (
                  faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-faculties" disabled>
                    No faculties available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <Select 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: parseInt(value) }))}
              value={formData.department_id?.toString() || ''}
              disabled={!selectedFacultyId || departmentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedFacultyId 
                    ? "Select a faculty first" 
                    : departmentsLoading 
                      ? "Loading..." 
                      : "Select Department"
                } />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading departments...
                  </SelectItem>
                ) : departments.length > 0 ? (
                  departments.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-departments" disabled>
                    No departments available for selected faculty
                  </SelectItem>
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
            disabled={isSubmitting || !formData.faculty_id || !formData.department_id}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Student...
              </>
            ) : (
              'Add Student'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
