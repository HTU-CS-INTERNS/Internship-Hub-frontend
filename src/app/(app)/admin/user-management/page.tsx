
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { UserCog, UserPlus, Search, Filter, UserCheck, UserX, CaseUpper, CalendarX2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole, Faculty, Department } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';

type UserStatus = 'Active' | 'Inactive' | 'Pending';
type AssignmentStatus = 'Assigned' | 'Unassigned';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  faculty?: string; // Faculty Name
  facultyId?: string;
  department?: string; // Department Name
  departmentId?: string;
  company?: string; // For supervisors
  assignedLecturerName?: string; // For students
  assignmentStatus?: AssignmentStatus; // For students
}

const DUMMY_ALL_USERS: ManagedUser[] = [
  { id: 'std1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'STUDENT', status: 'Active', faculty: 'Faculty of Engineering', facultyId: 'F001', department: 'Software Engineering', departmentId: 'D005', assignedLecturerName: 'Dr. Elara Vance', assignmentStatus: 'Assigned' },
  { id: 'lec1', name: 'Dr. Elara Vance', email: 'elara.vance@example.com', role: 'LECTURER', status: 'Active', faculty: 'Faculty of Engineering', facultyId: 'F001', department: 'Software Engineering', departmentId: 'D005' },
  { id: 'sup1', name: 'John Smith', email: 'john.s@company.com', role: 'SUPERVISOR', status: 'Active', company: 'Acme Corp' },
  { id: 'hod1', name: 'Prof. Alan Turing', email: 'alan.turing@example.com', role: 'HOD', status: 'Active', faculty: 'Faculty of Engineering', facultyId: 'F001', department: 'Software Engineering', departmentId: 'D005' },
  { id: 'admin1', name: 'Admin User', email: 'admin@internshiptrack.com', role: 'ADMIN', status: 'Active' },
  { id: 'std2', name: 'Bob The Intern', email: 'bob@example.com', role: 'STUDENT', status: 'Inactive', faculty: 'Faculty of Business and Management', facultyId: 'F002', department: 'Marketing', departmentId: 'D003', assignmentStatus: 'Unassigned' },
  { id: 'std3', name: 'Charlie Davis', email: 'charlie@example.com', role: 'STUDENT', status: 'Pending', faculty: 'Faculty of Information Technology', facultyId: 'F003', department: 'Cybersecurity', departmentId: 'D006', assignmentStatus: 'Unassigned' },
  { id: 'lec2', name: 'Dr. Ian Malcolm', email: 'ian.malcolm@example.com', role: 'LECTURER', status: 'Active', faculty: 'Faculty of Information Technology', facultyId: 'F003', department: 'Software Engineering', departmentId: 'D005' },
];

const ALL_FACULTIES_VALUE = "__ALL_FACULTIES__";
const ALL_DEPARTMENTS_VALUE = "__ALL_DEPARTMENTS__";
const ALL_ROLES_VALUE = "__ALL_ROLES__";
const ALL_STATUSES_VALUE = "__ALL_STATUSES__";
const ALL_ASSIGNMENT_STATUSES_VALUE = "__ALL_ASSIGNMENT_STATUSES__";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | typeof ALL_ROLES_VALUE>(ALL_ROLES_VALUE);
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | typeof ALL_STATUSES_VALUE>(ALL_STATUSES_VALUE);
  const [assignmentFilter, setAssignmentFilter] = React.useState<AssignmentStatus | typeof ALL_ASSIGNMENT_STATUSES_VALUE>(ALL_ASSIGNMENT_STATUSES_VALUE);
  const [facultyFilter, setFacultyFilter] = React.useState<string>(ALL_FACULTIES_VALUE);
  const [departmentFilter, setDepartmentFilter] = React.useState<string>(ALL_DEPARTMENTS_VALUE);

  const availableDepartments = React.useMemo(() => {
    if (facultyFilter === ALL_FACULTIES_VALUE) return DEPARTMENTS;
    return DEPARTMENTS.filter(dept => dept.facultyId === facultyFilter);
  }, [facultyFilter]);

  React.useEffect(() => {
    // Reset department filter if selected faculty doesn't contain it
    if (!availableDepartments.find(dept => dept.id === departmentFilter) && departmentFilter !== ALL_DEPARTMENTS_VALUE) {
      setDepartmentFilter(ALL_DEPARTMENTS_VALUE);
    }
  }, [availableDepartments, departmentFilter]);
  
  const filteredUsers = DUMMY_ALL_USERS.filter(user => {
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === ALL_ROLES_VALUE || user.role === roleFilter;
    const statusMatch = statusFilter === ALL_STATUSES_VALUE || user.status === statusFilter;
    const facultyMatch = facultyFilter === ALL_FACULTIES_VALUE || user.facultyId === facultyFilter;
    const departmentMatch = departmentFilter === ALL_DEPARTMENTS_VALUE || user.departmentId === departmentFilter;
    
    let assignmentMatch = true;
    if (roleFilter === 'STUDENT') {
      assignmentMatch = assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE || user.assignmentStatus === assignmentFilter;
    }
    
    // Faculty and Department filters primarily apply to Student, Lecturer, HOD
    if (user.role === 'SUPERVISOR' || user.role === 'ADMIN') {
        return searchMatch && roleMatch && statusMatch;
    }

    return searchMatch && roleMatch && statusMatch && facultyMatch && departmentMatch && assignmentMatch;
  });

  const roleHasOrgStructure = roleFilter === 'STUDENT' || roleFilter === 'LECTURER' || roleFilter === 'HOD';

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="User Management"
        description="Oversee all user accounts across the university internship program."
        icon={UserCog}
        breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "User Management" }
        ]}
        actions={
            <div className="flex gap-2">
                <Button className="rounded-lg"><UserPlus className="mr-2 h-4 w-4"/> Add New User</Button>
            </div>
        }
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">All System Users</CardTitle>
          <CardDescription>
            View, edit, and manage accounts. Use filters to refine the list.
          </CardDescription>
           <div className="pt-4 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-lg bg-muted border-input w-full sm:w-[300px]"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg"><Filter className="mr-2 h-4 w-4"/> Role: {roleFilter === ALL_ROLES_VALUE ? 'All' : USER_ROLES[roleFilter]}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuCheckboxItem checked={roleFilter === ALL_ROLES_VALUE} onCheckedChange={() => setRoleFilter(ALL_ROLES_VALUE)}>All Roles</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {(Object.keys(USER_ROLES) as UserRole[]).map(role => (
                        <DropdownMenuCheckboxItem key={role} checked={roleFilter === role} onCheckedChange={() => setRoleFilter(roleFilter === role ? ALL_ROLES_VALUE : role)}>{USER_ROLES[role]}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg"><Filter className="mr-2 h-4 w-4"/> Status: {statusFilter === ALL_STATUSES_VALUE ? 'All' : statusFilter}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                     <DropdownMenuCheckboxItem checked={statusFilter === ALL_STATUSES_VALUE} onCheckedChange={() => setStatusFilter(ALL_STATUSES_VALUE)}>All Statuses</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {(['Active', 'Inactive', 'Pending'] as UserStatus[]).map(status => (
                        <DropdownMenuCheckboxItem key={status} checked={statusFilter === status} onCheckedChange={() => setStatusFilter(statusFilter === status ? ALL_STATUSES_VALUE : status)}>{status}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {roleHasOrgStructure && (
                    <>
                        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[180px] rounded-lg">
                                <SelectValue placeholder="Filter by Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_FACULTIES_VALUE}>All Faculties</SelectItem>
                                {FACULTIES.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter} disabled={facultyFilter === ALL_FACULTIES_VALUE && availableDepartments.length === DEPARTMENTS.length}>
                             <SelectTrigger className="w-full sm:w-auto min-w-[180px] rounded-lg">
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_DEPARTMENTS_VALUE}>All Departments</SelectItem>
                                {availableDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}
                 {roleFilter === 'STUDENT' && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-lg"><Filter className="mr-2 h-4 w-4"/> Assignment: {assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE ? 'All' : assignmentFilter}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuCheckboxItem checked={assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE} onCheckedChange={() => setAssignmentFilter(ALL_ASSIGNMENT_STATUSES_VALUE)}>All Statuses</DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            {(['Assigned', 'Unassigned'] as AssignmentStatus[]).map(status => (
                                <DropdownMenuCheckboxItem key={status} checked={assignmentFilter === status} onCheckedChange={() => setAssignmentFilter(assignmentFilter === status ? ALL_ASSIGNMENT_STATUSES_VALUE : status)}>{status}</DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            {filteredUsers.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Faculty/Company</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            {roleFilter === 'STUDENT' && <TableHead>Lecturer</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant="secondary">{USER_ROLES[user.role]}</Badge></TableCell>
                                <TableCell>{user.role === 'SUPERVISOR' ? user.company : user.faculty || 'N/A'}</TableCell>
                                <TableCell>{user.department || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Inactive' ? 'outline' : 'destructive'}>
                                      {user.status === 'Active' ? <UserCheck className="mr-1 h-3 w-3"/> : user.status === 'Inactive' ? <UserX className="mr-1 h-3 w-3"/> : <CalendarX2 className="mr-1 h-3 w-3"/>}
                                      {user.status}
                                    </Badge>
                                </TableCell>
                                {roleFilter === 'STUDENT' && (
                                    <TableCell>
                                        {user.assignedLecturerName || <Badge variant="outline">Unassigned</Badge>}
                                    </TableCell>
                                )}
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="rounded-md">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="text-center py-12 text-muted-foreground p-6">
                    <UserCog className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No users found.</p>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </CardContent>
        {filteredUsers.length > 0 && (
            <CardFooter className="justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {filteredUsers.length} of {DUMMY_ALL_USERS.length} users</p>
                {/* Pagination can be added here */}
            </CardFooter>
        )}
      </Card>
      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Advanced User Actions (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed forms for user creation, editing, role assignment, activation/deactivation, and password resets will be implemented here based on the user flows.
            The "Assign Lecturer" flow will also be part of this enhancement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    