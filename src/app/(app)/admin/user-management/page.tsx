
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { UsersCog, UserPlus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';

// Dummy users for illustration
const DUMMY_ALL_USERS = [
  { id: 'std1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'STUDENT' as UserRole, status: 'Active', faculty: 'Engineering', department: 'Software Engineering' },
  { id: 'lec1', name: 'Dr. Elara Vance', email: 'elara.vance@example.com', role: 'LECTURER' as UserRole, status: 'Active', faculty: 'Engineering', department: 'Software Engineering' },
  { id: 'sup1', name: 'John Smith', email: 'john.s@company.com', role: 'SUPERVISOR' as UserRole, status: 'Active', company: 'Acme Corp' },
  { id: 'hod1', name: 'Prof. Alan Turing', email: 'alan.turing@example.com', role: 'HOD' as UserRole, status: 'Active', faculty: 'Engineering', department: 'Software Engineering' },
  { id: 'admin1', name: 'Admin User', email: 'admin@internshiptrack.com', role: 'ADMIN' as UserRole, status: 'Active' },
  { id: 'std2', name: 'Bob The Intern', email: 'bob@example.com', role: 'STUDENT' as UserRole, status: 'Inactive', faculty: 'Business', department: 'Marketing' },
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  // const [roleFilter, setRoleFilter] = React.useState<UserRole | 'ALL'>('ALL');
  // Further filters for faculty, department, status can be added

  const filteredUsers = DUMMY_ALL_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
    // && (roleFilter === 'ALL' || user.role === roleFilter)
  );

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="User Management"
        description="Oversee all user accounts across the university internship program."
        icon={UsersCog}
        breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "User Management" }
        ]}
        actions={
            <div className="flex gap-2">
                 {/* Add Filter Dropdowns here later */}
                <Button className="rounded-lg"><UserPlus className="mr-2 h-4 w-4"/> Add New User</Button>
            </div>
        }
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">All System Users</CardTitle>
          <CardDescription>
            View, edit, and manage accounts for students, lecturers, supervisors, HODs, and administrators.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg bg-muted border-input w-full sm:w-1/2 lg:w-1/3"
            />
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant="secondary">{USER_ROLES[user.role]}</Badge></TableCell>
                                <TableCell>{user.role === 'SUPERVISOR' ? user.company : user.faculty}</TableCell>
                                <TableCell>{user.department || 'N/A'}</TableCell>
                                <TableCell><Badge variant={user.status === 'Active' ? 'default' : 'outline'}>{user.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="rounded-md">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="text-center py-12 text-muted-foreground p-6">
                    <UsersCog className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No users found.</p>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </CardContent>
        {filteredUsers.length > 0 && (
            <CardFooter className="justify-end p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {filteredUsers.length} of {DUMMY_ALL_USERS.length} users</p>
            </CardFooter>
        )}
      </Card>
      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Placeholder for Advanced User Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed forms for user creation, editing, role assignment, activation/deactivation, and password resets will be implemented here based on the user flows.
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
            <li>Create New User (with role-specific fields)</li>
            <li>Edit User Details (including Faculty/Department for relevant roles)</li>
            <li>Deactivate/Activate User Accounts</li>
            <li>Reset User Passwords</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
