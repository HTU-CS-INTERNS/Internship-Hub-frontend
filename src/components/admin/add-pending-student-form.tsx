
'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFaculties, useDepartments } from '@/hooks/useApiData';
import { Loader2, Upload, FileText, X, Download } from 'lucide-react';
import Papa from 'papaparse';
import type { Faculty, Department } from '@/types';

interface AddStudentFormData {
  student_id_number: string;
  email: string;
  first_name: string;
  last_name: string;
  faculty_id: number | string | null;
  department_id: number | string | null;
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

// This component will eventually use a real API, but for now, it's a placeholder.
// The `apiClient` logic would need to be built out on the backend.
async function addPendingStudent(studentData: any) {
    console.log("Simulating add pending student:", studentData);
    // In a real app: await apiClient.post('/admin/pending-students', studentData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}

async function bulkAddPendingStudents(students: any[]) {
    console.log("Simulating bulk add:", students);
    // In a real app: await apiClient.post('/admin/pending-students/bulk', { students });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, added: students.length };
}


export function AddPendingStudentForm() {
  const { toast } = useToast();
  const { faculties, loading: facultiesLoading } = useFaculties();
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
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
  const [csvPreview, setCsvPreview] = useState<CSVStudent[] | null>(null);

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
      await addPendingStudent({
          ...formData,
          faculty_id: Number(formData.faculty_id),
          department_id: Number(formData.department_id),
          program_of_study: formData.program_of_study || null,
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
    setSelectedFacultyId(facultyId);
    setFormData(prev => ({
      ...prev,
      faculty_id: facultyId,
      department_id: null, // Reset department when faculty changes
    }));
  };

  const findFacultyIdByName = (name: string): string | null => {
    const faculty = faculties.find(f => f.name.toLowerCase() === name.toLowerCase());
    return faculty ? String(faculty.id) : null;
  };
  
  const findDepartmentIdByName = (name: string, facultyId: string | null): string | null => {
    if (!facultyId) return null;
    const depts = departments.filter(d => d.facultyId === facultyId);
    const department = depts.find(d => d.name.toLowerCase() === name.toLowerCase());
    return department ? String(department.id) : null;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsBulkUploading(true);
    setCsvPreview(null);

    Papa.parse<CSVStudent>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: 'CSV Error',
            description: `Error parsing CSV: ${results.errors[0].message}`,
            variant: 'destructive',
          });
          setIsBulkUploading(false);
          return;
        }
        setCsvPreview(results.data.slice(0, 5));
        setIsBulkUploading(false);
      },
      error: (error) => {
        toast({ title: 'CSV Error', description: error.message, variant: 'destructive' });
        setIsBulkUploading(false);
      },
    });
  };

  const processCSVData = async () => {
    if (!csvPreview) return;
    
    setIsBulkUploading(true);

    const validatedStudents = csvPreview.map((student, index) => {
      const facultyId = findFacultyIdByName(student.faculty_name);
      const departmentId = findDepartmentIdByName(student.department_name, facultyId);

      if (!facultyId || !departmentId) {
        toast({
          title: `Validation Error in Row ${index + 2}`,
          description: `Faculty "${student.faculty_name}" or Department "${student.department_name}" not found or mismatched.`,
          variant: 'destructive'
        });
        return null;
      }

      return {
        student_id_number: student.student_id_number,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        faculty_id: Number(facultyId),
        department_id: Number(departmentId),
        program_of_study: student.program_of_study || null,
      };
    }).filter(Boolean);

    if (validatedStudents.length !== csvPreview.length) {
      setIsBulkUploading(false);
      return;
    }

    try {
      await bulkAddPendingStudents(validatedStudents);
      toast({ title: 'Success', description: `${validatedStudents.length} students added successfully` });
      removeFile();
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to upload students', variant: 'destructive' });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const triggerFileInput = () => { fileInputRef.current?.click(); };
  const removeFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileName(null);
    setCsvPreview(null);
  };
  
  const handleDownloadTemplate = () => {
    const headers = "student_id_number,email,first_name,last_name,faculty_name,department_name,program_of_study";
    const csvContent = "data:text/csv;charset=utf-8," + headers;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add Student for Internship</CardTitle>
        <CardDescription>
          Add a single student using the form below or import multiple students via CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden"/>
            <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isBulkUploading}>
              <Upload className="mr-2 h-4 w-4" /> {isBulkUploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleDownloadTemplate} className="text-sm text-primary hover:text-primary/80">
                <Download className="mr-2 h-4 w-4"/> Download Template
            </Button>
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" /> {fileName}
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-6 w-6"><X className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
          {csvPreview && (
            <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">CSV Preview (First 5 Rows)</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b">
                                <th className="p-1 text-left">ID</th>
                                <th className="p-1 text-left">Email</th>
                                <th className="p-1 text-left">First Name</th>
                                <th className="p-1 text-left">Last Name</th>
                                <th className="p-1 text-left">Faculty</th>
                                <th className="p-1 text-left">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {csvPreview.map((row, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-1">{row.student_id_number}</td>
                                    <td className="p-1">{row.email}</td>
                                    <td className="p-1">{row.first_name}</td>
                                    <td className="p-1">{row.last_name}</td>
                                    <td className="p-1">{row.faculty_name}</td>
                                    <td className="p-1">{row.department_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Button className="mt-4" onClick={processCSVData} disabled={isBulkUploading}>
                    {isBulkUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Confirm & Upload {csvPreview.length} Students
                </Button>
            </div>
          )}
        </div>
        
        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or add manually</span></div></div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="student_id_number">Student ID Number</Label><Input id="student_id_number" value={formData.student_id_number} onChange={(e) => setFormData(prev => ({ ...prev, student_id_number: e.target.value }))} placeholder="e.g., STU2024001" required/></div>
            <div><Label htmlFor="email">School Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="student@university.edu" required/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="first_name">First Name</Label><Input id="first_name" value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} required/></div>
            <div><Label htmlFor="last_name">Last Name</Label><Input id="last_name" value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} required/></div>
          </div>
          <div>
            <Label>Faculty</Label>
            <Select onValueChange={handleFacultyChange} value={String(selectedFacultyId || '')}>
              <SelectTrigger><SelectValue placeholder="Select Faculty" /></SelectTrigger>
              <SelectContent>{facultiesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : faculties.map((faculty) => (<SelectItem key={faculty.id} value={String(faculty.id)}>{faculty.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))} value={String(formData.department_id || '')} disabled={!selectedFacultyId || departmentsLoading}>
              <SelectTrigger><SelectValue placeholder={!selectedFacultyId ? "Select faculty first" : "Select Department"} /></SelectTrigger>
              <SelectContent>{departmentsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : departments.map((department) => (<SelectItem key={department.id} value={String(department.id)}>{department.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="program_of_study">Program of Study (Optional)</Label><Input id="program_of_study" value={formData.program_of_study} onChange={(e) => setFormData(prev => ({ ...prev, program_of_study: e.target.value }))} placeholder="e.g., Computer Science"/></div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !formData.faculty_id || !formData.department_id}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Student'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
