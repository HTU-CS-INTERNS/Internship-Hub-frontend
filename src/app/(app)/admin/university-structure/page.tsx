
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Landmark, PlusCircle, Edit, Trash2, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FACULTIES, DEPARTMENTS } from '@/lib/constants';
import type { Faculty as AppFaculty, Department as AppDepartment } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface EditableFaculty extends AppFaculty { isEditing?: boolean; newName?: string; }
interface EditableDepartment extends AppDepartment { isEditing?: boolean; newName?: string; newFacultyId?: string; }

export default function UniversityStructurePage() {
  const { toast } = useToast();
  const [faculties, setFaculties] = React.useState<EditableFaculty[]>(() => FACULTIES.map(f => ({...f, isEditing: false, newName: f.name })));
  const [departments, setDepartments] = React.useState<EditableDepartment[]>(() => DEPARTMENTS.map(d => ({...d, isEditing: false, newName: d.name, newFacultyId: d.facultyId })));
  
  const [showAddFacultyDialog, setShowAddFacultyDialog] = React.useState(false);
  const [newFacultyName, setNewFacultyName] = React.useState('');
  const [newFacultyId, setNewFacultyId] = React.useState('');

  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = React.useState(false);
  const [newDepartmentName, setNewDepartmentName] = React.useState('');
  const [newDepartmentId, setNewDepartmentId] = React.useState('');
  const [selectedFacultyForNewDept, setSelectedFacultyForNewDept] = React.useState('');
  
  const [showEditDepartmentDialog, setShowEditDepartmentDialog] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<EditableDepartment | null>(null);


  const handleAddFaculty = () => {
    if (!newFacultyName.trim() || !newFacultyId.trim()) {
        toast({ title: "Error", description: "Faculty Name and ID are required.", variant: "destructive"});
        return;
    }
    if (faculties.find(f => f.id === newFacultyId)) {
        toast({ title: "Error", description: `Faculty ID "${newFacultyId}" already exists.`, variant: "destructive"});
        return;
    }
    setFaculties(prev => [...prev, { id: newFacultyId, name: newFacultyName, isEditing: false, newName: newFacultyName }]);
    toast({ title: "Faculty Added", description: `Faculty "${newFacultyName}" created successfully.`});
    setShowAddFacultyDialog(false);
    setNewFacultyName('');
    setNewFacultyId('');
  };

  const handleAddDepartment = () => {
     if (!newDepartmentName.trim() || !newDepartmentId.trim() || !selectedFacultyForNewDept) {
        toast({ title: "Error", description: "Department Name, ID, and selected Faculty are required.", variant: "destructive"});
        return;
    }
    if (departments.find(d => d.id === newDepartmentId)) {
        toast({ title: "Error", description: `Department ID "${newDepartmentId}" already exists.`, variant: "destructive"});
        return;
    }
    setDepartments(prev => [...prev, { id: newDepartmentId, name: newDepartmentName, facultyId: selectedFacultyForNewDept, isEditing: false, newName: newDepartmentName, newFacultyId: selectedFacultyForNewDept }]);
    toast({ title: "Department Added", description: `Department "${newDepartmentName}" added to ${faculties.find(f=>f.id === selectedFacultyForNewDept)?.name}.`});
    setShowAddDepartmentDialog(false);
    setNewDepartmentName('');
    setNewDepartmentId('');
    setSelectedFacultyForNewDept('');
  }

  const toggleEditFaculty = (id: string) => {
    setFaculties(prev => prev.map(f => f.id === id ? {...f, isEditing: !f.isEditing, newName: f.name } : f));
  };

  const handleFacultyNameChange = (id: string, value: string) => {
    setFaculties(prev => prev.map(f => f.id === id ? {...f, newName: value} : f));
  };

  const saveFacultyName = (id: string) => {
    const faculty = faculties.find(f => f.id === id);
    if (faculty && faculty.newName?.trim()) {
        setFaculties(prev => prev.map(f => f.id === id ? {...f, name: faculty.newName!, isEditing: false} : f));
        toast({ title: "Faculty Updated", description: `Faculty "${faculty.newName}" saved.`});
    } else {
        toast({ title: "Error", description: "Faculty name cannot be empty.", variant: "destructive"});
    }
  };

  const openEditDepartmentDialog = (department: EditableDepartment) => {
    setEditingDepartment({ ...department, newName: department.name, newFacultyId: department.facultyId });
    setShowEditDepartmentDialog(true);
  };

  const handleUpdateDepartment = () => {
    if (!editingDepartment || !editingDepartment.newName?.trim() || !editingDepartment.newFacultyId) {
        toast({ title: "Error", description: "Department Name and assigned Faculty are required.", variant: "destructive" });
        return;
    }
    setDepartments(prev => prev.map(d => 
        d.id === editingDepartment.id 
        ? { ...d, name: editingDepartment.newName!, facultyId: editingDepartment.newFacultyId!, isEditing: false } 
        : d
    ));
    toast({ title: "Department Updated", description: `Department "${editingDepartment.newName}" updated successfully.` });
    setShowEditDepartmentDialog(false);
    setEditingDepartment(null);
  };
  
  const simulateArchive = (type: 'Faculty' | 'Department', name: string) => {
    toast({
        title: `Archive ${type} (Simulated)`,
        description: `${type} "${name}" would be archived. This action requires careful consideration of associated students, lecturers, and internships. A full implementation would include confirmation steps and impact analysis.`,
        duration: 7000,
        variant: 'default'
    });
  };

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
                            <p className="text-xs text-muted-foreground">ID: {faculty.id}</p>
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
                {departments.filter(dept => dept.facultyId === faculty.id).map(dept => (
                  <Card key={dept.id} className="p-3 rounded-md bg-muted/50">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {dept.id}</p>
                        </div>
                         <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDepartmentDialog(dept)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => simulateArchive('Department', dept.name)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                  </Card>
                ))}
                {departments.filter(dept => dept.facultyId === faculty.id).length === 0 && <p className="text-xs text-muted-foreground py-2">No departments in this faculty.</p>}
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
                        <Label htmlFor="new-faculty-id">Faculty ID (Unique)</Label>
                        <Input id="new-faculty-id" value={newFacultyId} onChange={(e) => setNewFacultyId(e.target.value.toUpperCase())} placeholder="e.g., FENG" className="rounded-lg" />
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
                                <SelectItem value="" disabled>Select a Faculty</SelectItem>
                                {faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-dept-id">Department ID (Unique)</Label>
                        <Input id="new-dept-id" value={newDepartmentId} onChange={(e) => setNewDepartmentId(e.target.value.toUpperCase())} placeholder="e.g., DCOMSC" className="rounded-lg"/>
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
                            value={editingDepartment.newFacultyId || ''} 
                            onValueChange={(value) => setEditingDepartment(d => d ? {...d, newFacultyId: value} : null)}
                        >
                            <SelectTrigger id="edit-dept-faculty" className="w-full rounded-lg">
                                <SelectValue placeholder="Select a Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
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
                        <Label htmlFor="edit-dept-id">Department ID (Read-only)</Label>
                        <Input id="edit-dept-id" value={editingDepartment.id} className="rounded-lg bg-muted" readOnly />
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

    