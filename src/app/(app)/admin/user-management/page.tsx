'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { UserCog, UserPlus, Search, Filter, UserCheck, UserX, Edit, Mail, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminService } from '@/lib/services';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';

type UserStatus = 'active' | 'inactive' | 'pending';

interface ManagedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: UserStatus;
  is_active: boolean;
  name: string;
  faculty?: string;
  department?: string;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = React.useState<ManagedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  React.useEffect(() => {
    // Filter users based on search and filters
    const filtered = allUsers.filter(user => {
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      
      return searchMatch && roleMatch && statusMatch;
    });
    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AdminService.getAllUsers();
      if (response.success && response.data) {
        const users = Array.isArray(response.data) ? response.data.map((user: any) => ({
          ...user,
          status: user.is_active ? 'active' : 'inactive',
          name: `${user.first_name} ${user.last_name}`,
        })) : [];
        setAllUsers(users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      // TODO: Implement createUser in AdminService
      console.log('Adding user:', userData);
      toast({
        title: 'Info',
        description: 'User creation feature is not yet implemented',
      });
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = async (id: string, userData: any) => {
    try {
      // TODO: Implement updateUser in AdminService
      console.log('Updating user:', id, userData);
      toast({
        title: 'Info',
        description: 'User update feature is not yet implemented',
      });
      setEditingUser(null);
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      // TODO: Implement deleteUser in AdminService
      console.log('Deleting user:', deletingUserId);
      toast({
        title: 'Info',
        description: 'User deletion feature is not yet implemented',
      });
      setDeletingUserId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const statusVariants: Record<UserStatus, "default" | "outline" | "destructive" | "secondary"> = {
    active: "default",
    inactive: "secondary", 
    pending: "outline"
  };

  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="User Management"
          description="Manage all users in the system."
          icon={UserCog}
        />
        <EmptyState 
          title="Error loading users"
          description={error}
          icon={AlertCircle}
          action={
            <Button onClick={fetchUsers}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="User Management"
        description="Manage all users in the system."
        icon={UserCog}
        breadcrumbs={[
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { href: "/admin/user-management", label: "User Management" }
        ]}
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="LECTURER">Lecturer</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState 
              title="No users found"
              description="No users match your current filters."
              icon={UserX}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[user.status as UserStatus]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingUserId(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal - Placeholder */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Add User (Coming Soon)</h2>
            <p className="text-muted-foreground mb-4">User creation functionality will be implemented soon.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Placeholder */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Edit User (Coming Soon)</h2>
            <p className="text-muted-foreground mb-4">
              Editing user: {editingUser.name}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setEditingUser(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Placeholder */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Delete User (Coming Soon)</h2>
            <p className="text-muted-foreground mb-4">
              User deletion functionality will be implemented soon.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletingUserId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Confirm (Placeholder)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
