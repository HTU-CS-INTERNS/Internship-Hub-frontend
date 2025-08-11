
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Landmark, PlusCircle, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AdminService } from '@/lib/services';
import EmptyState from '@/components/shared/empty-state';

interface AppFaculty { id: number; name: string; faculty_code: string; }
interface AppDepartment { id: number; name: string; department_code: string; faculty_id: number; }

interface EditableFaculty extends AppFaculty { isEditing?: boolean; newName?: string; }
interface EditableDepartment extends AppDepartment { isEditing?: boolean; newName?: string; newFacultyId?: number; }

export default function UniversityStructurePage() {
  const { toast } = useToast();
  const [faculties, setFaculties] = React.useState<EditableFaculty[]>([]);
  const [departments, setDepartments] = React.useState<EditableDepartment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [showAddFacultyDialog, setShowAddFacultyDialog] = React.useState(false);
  const [newFacultyName, setNewFacultyName] = React.useState('');
  const [newFacultyCode, setNewFacultyCode] = React.useState('');

  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = React.useState(false);
  const [newDepartmentName, setNewDepartmentName] = React.useState('');
  const [newDepartmentCode, setNewDepartmentCode] = React.useState('');
  const [selectedFacultyForNewDept, setSelectedFacultyForNewDept] = React.useState<string | undefined>();
  
  const [showEditDepartmentDialog, setShowEditDepartmentDialog] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<EditableDepartment | null>(null);

  const fetchUniversityStructure = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [facultiesRes, departmentsRes] = await Promise.all([
        AdminService.getFaculties(),
        AdminService.getDepartments()
      ]);
      
      if (!facultiesRes.success || !departmentsRes.success) {
        throw new Error(facultiesRes.error || departmentsRes.error || "Failed to fetch university structure");
      }
      
      setFaculties(facultiesRes.data.map((f: AppFaculty) => ({...f, isEditing: false, newName: f.name})));
      setDepartments(departmentsRes.data.map((d: AppDepartment) => ({...d, isEditing: false, newName: d.name, newFacultyId: d.faculty_id})));
    } catch (err: any) {
      console.error('Failed to fetch university structure:', err);
      setError(err.message || 'Failed to load university structure');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUniversityStructure();
  }, [fetchUniversityStructure]);

  const handleAddFaculty = async () => {
    if (!newFacultyName.trim() || !newFacultyCode.trim()) {
        toast({ title: "Error", description: "Faculty Name and Code are required.", variant: "destructive"});
        return;
    }
    
    try {
      const response = await AdminService.createFaculty({ name: newFacultyName, faculty_code: newFacultyCode });
      if(response.success) {
        toast({ title: "Faculty Added", description: `Faculty "${newFacultyName}" created successfully.`});
        setShowAddFacultyDialog(false);
        setNewFacultyName('');
        setNewFacultyCode('');
        fetchUniversityStructure(); // Refresh data
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to create faculty:', error);
      toast({ title: "Error", description: `Failed to create faculty: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
    }
  };

  const handleAddDepartment = async () => {
     if (!newDepartmentName.trim() || !newDepartmentCode.trim() || !selectedFacultyForNewDept) {
        toast({ title: "Error", description: "Department Name, Code, and selected Faculty are required.", variant: "destructive"});
        return;
    }
    
    try {
      const response = await AdminService.createDepartment({ 
          name: newDepartmentName, 
          department_code: newDepartmentCode, 
          faculty_id: parseInt(selectedFacultyForNewDept, 10) 
      });
      
      if(response.success) {
        toast({ title: "Department Added", description: `Department "${newDepartmentName}" added.`});
        setShowAddDepartmentDialog(false);
        setNewDepartmentName('');
        setNewDepartmentCode('');
        setSelectedFacultyForNewDept(undefined);
        fetchUniversityStructure(); // Refresh data
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to create department:', error);
      toast({ title: "Error", description: `Failed to create department: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
    }
  };

  const toggleEditFaculty = (id: number) => {
    setFaculties(prev => prev.map(f => f.id === id ? {...f, isEditing: !f.isEditing, newName: f.name } : f));
  };

  const handleFacultyNameChange = (id: number, value: string) => {
    setFaculties(prev => prev.map(f => f.id === id ? {...f, newName: value} : f));
  };

  const saveFacultyName = async (id: number) => {
    const faculty = faculties.find(f => f.id === id);
    if (faculty && faculty.newName?.trim()) {
        try {
            await AdminService.updateFaculty(id, { name: faculty.newName });
            toast({ title: "Faculty Updated", description: `Faculty "${faculty.newName}" saved.`});
            fetchUniversityStructure();
        } catch(error) {
            toast({ title: "Error", description: `Failed to update faculty: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
        }
    } else {
        toast({ title: "Error", description: "Faculty name cannot be empty.", variant: "destructive"});
    }
  };

  const openEditDepartmentDialog = (department: EditableDepartment) => {
    setEditingDepartment({ ...department, newName: department.name, newFacultyId: department.faculty_id });
    setShowEditDepartmentDialog(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !editingDepartment.newName?.trim() || !editingDepartment.newFacultyId) {
        toast({ title: "Error", description: "Department Name and assigned Faculty are required.", variant: "destructive" });
        return;
    }
    
    try {
        await AdminService.updateDepartment(editingDepartment.id, { 
            name: editingDepartment.newName, 
            faculty_id: editingDepartment.newFacultyId 
        });
        toast({ title: "Department Updated", description: `Department "${editingDepartment.newName}" updated successfully.` });
        setShowEditDepartmentDialog(false);
        setEditingDepartment(null);
        fetchUniversityStructure();
    } catch(error) {
        toast({ title: "Error", description: `Failed to update department: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    }
  };
  
  const simulateArchive = (type: 'Faculty' | 'Department', name: string) => {
    toast({
        title: `Archive ${type} (Simulated)`,
        description: `${type} "${name}" would be archived. This action requires careful consideration of associated students, lecturers, and internships. A full implementation would include confirmation steps and impact analysis.`,
        duration: 7000,
        variant: 'default'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="University Structure Management"
          description="Define and manage faculties and departments within the university."
          icon={Landmark}
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="ml-2">Loading structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
      return (
          <div className="p-4 md:p-6">
              <EmptyState 
                title="Error"
                description={error}
                icon={Landmark}
                actionLabel="Try Again"
                onAction={fetchUniversityStructure}
              />
          </div>
      );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="University Structure Management"
        description="Define and manage faculties and departments within the university."
        icon={Landmark}
        breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "University Structure" }
        ]}
        actions={
            <div className="flex gap-2">
                <Button onClick={() => setShowAddFacultyDialog(true)} className="rounded-lg"><PlusCircle className="mr-2 h-4 w-4"/> Add Faculty</Button>
                <Button onClick={() => setShowAddDepartmentDialog(true)} variant="outline" className="rounded-lg"><PlusCircle className="mr-2 h-4 w-4"/> Add Department</Button>
            </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Faculties</CardTitle>
            <CardDescription>List of all faculties in the university.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {faculties.map((faculty) => (
              <Card key={faculty.id} className="p-3 rounded-md bg-muted/50">
                {faculty.isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input value={faculty.newName} onChange={(e) => handleFacultyNameChange(faculty.id, e.target.value)} className="h-8 rounded-md"/>
                        <Button size="sm" onClick={() => saveFacultyName(faculty.id)} className="h-8 rounded-md"><Save className="mr-1 h-3 w-3"/>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleEditFaculty(faculty.id)} className="h-8 rounded-md">Cancel</Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{faculty.name}</p>
                            <p className="text-xs text-muted-foreground">Code: {faculty.faculty_code}</p>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleEditFaculty(faculty.id)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => simulateArchive('Faculty', faculty.name)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
              </Card>
            ))}
            {faculties.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No faculties defined yet.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Departments</CardTitle>
            <CardDescription>List of all departments, grouped by faculty.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faculties.map(faculty => (
              <div key={`faculty-group-${faculty.id}`}>
                <h4 className="font-semibold text-primary mb-2">{faculty.name}</h4>
                <div className="space-y-2 pl-4 border-l-2 border-border">
                {departments.filter(dept => dept.faculty_id === faculty.id).map(dept => (
                  <Card key={dept.id} className="p-3 rounded-md bg-muted/50">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">Code: {dept.department_code}</p>
                        </div>
                         <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDepartmentDialog(dept)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => simulateArchive('Department', dept.name)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                  </Card>
                ))}
                {departments.filter(dept => dept.faculty_id === faculty.id).length === 0 && <p className="text-xs text-muted-foreground py-2">No departments in this faculty.</p>}
                </div>
              </div>
            ))}
            {departments.length === 0 && faculties.length > 0 && <p className="text-muted-foreground text-sm text-center py-4">No departments defined yet.</p>}
          </CardContent>
        </Card>
      </div>

        {/* Add Faculty Dialog */}
        <Dialog open={showAddFacultyDialog} onOpenChange={setShowAddFacultyDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Faculty</DialogTitle>
                    <DialogDescription>Enter the details for the new faculty.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-faculty-code">Faculty Code (Unique)</Label>
                        <Input id="new-faculty-code" value={newFacultyCode} onChange={(e) => setNewFacultyCode(e.target.value.toUpperCase())} placeholder="e.g., FENG" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-faculty-name">Faculty Name</Label>
                        <Input id="new-faculty-name" value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} placeholder="e.g., Faculty of Advanced Engineering" className="rounded-lg"/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
                    <Button onClick={handleAddFaculty} className="rounded-lg">Add Faculty</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Add Department Dialog */}
        <Dialog open={showAddDepartmentDialog} onOpenChange={setShowAddDepartmentDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                    <DialogDescription>Enter the details for the new department and assign it to a faculty.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="select-faculty-for-dept">Assign to Faculty</Label>
                        <Select value={selectedFacultyForNewDept} onValueChange={setSelectedFacultyForNewDept}>
                            <SelectTrigger id="select-faculty-for-dept" className="w-full rounded-lg">
                                <SelectValue placeholder="Select a Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-dept-code">Department Code (Unique)</Label>
                        <Input id="new-dept-code" value={newDepartmentCode} onChange={(e) => setNewDepartmentCode(e.target.value.toUpperCase())} placeholder="e.g., DCOMSC" className="rounded-lg"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-dept-name">Department Name</Label>
                        <Input id="new-dept-name" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} placeholder="e.g., Department of Computer Science" className="rounded-lg"/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
                    <Button onClick={handleAddDepartment} className="rounded-lg">Add Department</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Department Dialog */}
        <Dialog open={showEditDepartmentDialog} onOpenChange={(isOpen) => { setShowEditDepartmentDialog(isOpen); if (!isOpen) setEditingDepartment(null); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Department: {editingDepartment?.name}</DialogTitle>
                    <DialogDescription>Update the details for this department.</DialogDescription>
                </DialogHeader>
                {editingDepartment && (
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-dept-faculty">Assign to Faculty</Label>
                        <Select 
                            value={editingDepartment.newFacultyId?.toString() || ''} 
                            onValueChange={(value) => setEditingDepartment(d => d ? {...d, newFacultyId: parseInt(value, 10)} : null)}
                        >
                            <SelectTrigger id="edit-dept-faculty" className="w-full rounded-lg">
                                <SelectValue placeholder="Select a Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-dept-name">Department Name</Label>
                        <Input 
                            id="edit-dept-name" 
                            value={editingDepartment.newName || ''} 
                            onChange={(e) => setEditingDepartment(d => d ? {...d, newName: e.target.value} : null)} 
                            placeholder="e.g., Department of Computer Science" 
                            className="rounded-lg"
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="edit-dept-code">Department Code (Read-only)</Label>
                        <Input id="edit-dept-code" value={editingDepartment.department_code} className="rounded-lg bg-muted" readOnly />
                    </div>
                </div>
                )}
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateDepartment} className="rounded-lg">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
