'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { UserCog, UserPlus, Search, Filter, UserCheck, UserX, CaseUpper, CalendarX2, Briefcase, Edit, Mail, Landmark, Building as BuildingIcon, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole, Faculty, Department } from '@/types';
import { USER_ROLES, FACULTIES, DEPARTMENTS } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AdminApiService } from '@/lib/services/adminApi';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import { AddUserModal } from '@/components/admin/add-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { ConfirmModal } from '@/components/shared/confirm-modal';

type UserStatus = 'active' | 'inactive' | 'pending';
type AssignmentStatus = 'assigned' | 'unassigned';

interface ManagedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  status: UserStatus;
  faculty?: string;
  faculty_id?: string;
  department?: string;
  department_id?: string;
  company?: string;
  assigned_lecturer_name?: string;
  assignment_status?: AssignmentStatus;
}

const ALL_FACULTIES_VALUE = "__ALL_FACULTIES__";
const ALL_DEPARTMENTS_VALUE = "__ALL_DEPARTMENTS__";
const ALL_ROLES_VALUE = "__ALL_ROLES__";
const ALL_STATUSES_VALUE = "__ALL_STATUSES__";
const ALL_ASSIGNMENT_STATUSES_VALUE = "__ALL_ASSIGNMENT_STATUSES__";

const statusBadgeVariant: Record<UserStatus, 'default' | 'outline' | 'destructive' | 'secondary'> = {
  active: 'default',
  inactive: 'outline',
  pending: 'destructive',
};

const statusIcon: Record<UserStatus, React.ElementType> = {
  active: UserCheck,
  inactive: UserX,
  pending: CalendarX2
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = React.useState<ManagedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | typeof ALL_ROLES_VALUE>(ALL_ROLES_VALUE);
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | typeof ALL_STATUSES_VALUE>(ALL_STATUSES_VALUE);
  const [assignmentFilter, setAssignmentFilter] = React.useState<AssignmentStatus | typeof ALL_ASSIGNMENT_STATUSES_VALUE>(ALL_ASSIGNMENT_STATUSES_VALUE);
  const [facultyFilter, setFacultyFilter] = React.useState<string>(ALL_FACULTIES_VALUE);
  const [departmentFilter, setDepartmentFilter] = React.useState<string>(ALL_DEPARTMENTS_VALUE);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  // Fetch users data
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await AdminApiService.getAllUsers({});
      const users = Array.isArray(usersData.users) ? usersData.users.map(user => ({
        ...user,
        status: user.is_active ? 'active' : 'inactive',
        name: `${user.first_name} ${user.last_name}`,
        faculty: user.faculty_id ? FACULTIES.find(f => f.id === user.faculty_id)?.name : undefined,
        department: user.department_id ? DEPARTMENTS.find(d => d.id === user.department_id)?.name : undefined
      })) : [];
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
      setAllUsers([]);
      setFilteredUsers([]);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const availableDepartments = React.useMemo(() => {
    if (facultyFilter === ALL_FACULTIES_VALUE) return DEPARTMENTS;
    return DEPARTMENTS.filter(dept => dept.facultyId === facultyFilter);
  }, [facultyFilter]);

  React.useEffect(() => {
    if (!availableDepartments.find(dept => dept.id === departmentFilter) && departmentFilter !== ALL_DEPARTMENTS_VALUE) {
      setDepartmentFilter(ALL_DEPARTMENTS_VALUE);
    }
  }, [availableDepartments, departmentFilter]);

  // Filter users based on criteria
  React.useEffect(() => {
    const filtered = allUsers.filter(user => {
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === ALL_ROLES_VALUE || user.role === roleFilter;
      const statusMatch = statusFilter === ALL_STATUSES_VALUE || user.status === statusFilter;
      const facultyMatch = facultyFilter === ALL_FACULTIES_VALUE || user.faculty_id === facultyFilter;
      const departmentMatch = departmentFilter === ALL_DEPARTMENTS_VALUE || user.department_id === departmentFilter;
      
      let assignmentMatch = true;
      if (roleFilter === 'STUDENT') {
        assignmentMatch = assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE || user.assignment_status === assignmentFilter;
      }
      
      if (user.role === 'SUPERVISOR' || user.role === 'ADMIN') {
          return searchMatch && roleMatch && statusMatch;
      }

      return searchMatch && roleMatch && statusMatch && facultyMatch && departmentMatch && assignmentMatch;
    });
    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, roleFilter, statusFilter, assignmentFilter, facultyFilter, departmentFilter]);

  const handleAddUser = async (userData: any) => {
    try {
      await AdminApiService.createUser(userData);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      fetchUsers();
      setIsAddModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = async (id: string, userData: any) => {
    try {
      await AdminApiService.updateUser(id, userData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await AdminApiService.deleteUser(deletingUserId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
      setDeletingUserId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const roleHasOrgStructure = roleFilter === 'STUDENT' || roleFilter === 'LECTURER' || roleFilter === 'HOD';
  
  const UserCardMobile: React.FC<{ user: ManagedUser }> = ({ user }) => {
    const StatusIcon = statusIcon[user.status];
    return (
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{user.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{user.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs whitespace-nowrap px-2 py-0.5 rounded-full">
              {USER_ROLES[user.role]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={statusBadgeVariant[user.status]} className="text-xs px-1.5 py-0.5">
              {user.status}
            </Badge>
          </div>
          {user.faculty && (
            <div className="flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Faculty:</span> {user.faculty}
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-1.5">
              <BuildingIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Dept:</span> {user.department}
            </div>
          )}
          {user.company && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Company:</span> {user.company}
            </div>
          )}
          {user.role === 'STUDENT' && (
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Lecturer:</span> 
              {user.assigned_lecturer_name || <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0.5">Unassigned</Badge>}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
           <Button 
      variant="ghost" 
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        setEditingUser(user);
      }}
    >
      Edit
    </Button>
    <Button 
      variant="ghost" 
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        setDeletingUserId(user.id);
      }}
    >
      Delete
    </Button>
        </CardFooter>
      </Card>
    );
  };

  // Handle loading state
  if (isLoading) {
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
        />
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
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
        />
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Users"
          description="We couldn't load the user data. Please try again."
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  // Handle empty state
  if (filteredUsers.length === 0 && !isLoading && !error) {
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
              <Button className="rounded-lg" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4"/> Add New User
              </Button>
            </div>
          }
        />
        <EmptyState
          icon={UserCog}
          title={allUsers.length === 0 ? "No Users Found" : "No Users Match Filters"}
          description={allUsers.length === 0 ? "There are no users in the system yet." : "Try adjusting your search criteria or filters."}
          actionLabel={allUsers.length === 0 ? "Add First User" : "Clear Filters"}
          onAction={allUsers.length === 0 ? () => setIsAddModalOpen(true) : () => {
            setSearchTerm('');
            setRoleFilter(ALL_ROLES_VALUE);
            setStatusFilter(ALL_STATUSES_VALUE);
            setAssignmentFilter(ALL_ASSIGNMENT_STATUSES_VALUE);
            setFacultyFilter(ALL_FACULTIES_VALUE);
            setDepartmentFilter(ALL_DEPARTMENTS_VALUE);
          }}
        />
      </div>
    );
  }

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
            <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />
          </div>
        }
      />

      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "")}>
        <CardHeader className={cn(isMobile ? "pb-3" : "")}>
          {!isMobile && (
            <>
              <CardTitle className="font-headline text-lg">All System Users</CardTitle>
              <CardDescription>View, edit, and manage accounts. Use filters to refine the list.</CardDescription>
            </>
          )}
          <div className={cn("pt-0 space-y-3", !isMobile && "pt-4")}>
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
                  <Button variant="outline" className="rounded-lg">
                    <Filter className="mr-2 h-4 w-4"/> 
                    Role: {roleFilter === ALL_ROLES_VALUE ? 'All' : USER_ROLES[roleFilter]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuCheckboxItem 
                    checked={roleFilter === ALL_ROLES_VALUE} 
                    onCheckedChange={() => setRoleFilter(ALL_ROLES_VALUE)}
                  >
                    All Roles
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {(Object.keys(USER_ROLES) as UserRole[]).map(role => (
                    <DropdownMenuCheckboxItem 
                      key={role} 
                      checked={roleFilter === role} 
                      onCheckedChange={() => setRoleFilter(roleFilter === role ? ALL_ROLES_VALUE : role)}
                    >
                      {USER_ROLES[role]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    <Filter className="mr-2 h-4 w-4"/> 
                    Status: {statusFilter === ALL_STATUSES_VALUE ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuCheckboxItem 
                    checked={statusFilter === ALL_STATUSES_VALUE} 
                    onCheckedChange={() => setStatusFilter(ALL_STATUSES_VALUE)}
                  >
                    All Statuses
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {(['active', 'inactive', 'pending'] as UserStatus[]).map(status => (
                    <DropdownMenuCheckboxItem 
                      key={status} 
                      checked={statusFilter === status} 
                      onCheckedChange={() => setStatusFilter(statusFilter === status ? ALL_STATUSES_VALUE : status)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
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
                      {FACULTIES.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={departmentFilter} 
                    onValueChange={setDepartmentFilter} 
                    disabled={facultyFilter === ALL_FACULTIES_VALUE && availableDepartments.length === DEPARTMENTS.length}
                  >
                    <SelectTrigger className="w-full sm:w-auto min-w-[180px] rounded-lg">
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_DEPARTMENTS_VALUE}>All Departments</SelectItem>
                      {availableDepartments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              {roleFilter === 'STUDENT' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg">
                      <Filter className="mr-2 h-4 w-4"/> 
                      Assignment: {assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE ? 'All' : assignmentFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuCheckboxItem 
                      checked={assignmentFilter === ALL_ASSIGNMENT_STATUSES_VALUE} 
                      onCheckedChange={() => setAssignmentFilter(ALL_ASSIGNMENT_STATUSES_VALUE)}
                    >
                      All Statuses
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {(['assigned', 'unassigned'] as AssignmentStatus[]).map(status => (
                      <DropdownMenuCheckboxItem 
                        key={status} 
                        checked={assignmentFilter === status} 
                        onCheckedChange={() => setAssignmentFilter(assignmentFilter === status ? ALL_ASSIGNMENT_STATUSES_VALUE : status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn(isMobile && filteredUsers.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {filteredUsers.length > 0 ? (
            isMobile ? (
              filteredUsers.map(user => <UserCardMobile key={user.id} user={user} />)
            ) : (
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
                  {filteredUsers.map(user => {
                    const StatusIcon = statusIcon[user.status];
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="secondary">{USER_ROLES[user.role]}</Badge></TableCell>
                        <TableCell>{user.role === 'SUPERVISOR' ? user.company : user.faculty || 'N/A'}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[user.status]}>
                            <StatusIcon className="mr-1 h-3 w-3"/>
                            {user.status}
                          </Badge>
                        </TableCell>
                        {roleFilter === 'STUDENT' && (
                          <TableCell>
                            {user.assigned_lecturer_name || <Badge variant="outline">Unassigned</Badge>}
                          </TableCell>
                        )}
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(user);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingUserId(user.id);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          ) : (
            <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <UserCog className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-semibold">No users found.</p>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
        {filteredUsers.length > 0 && !isMobile && (
          <CardFooter className="justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {allUsers.length} users
            </p>
          </CardFooter>
        )}
      </Card>


      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          isOpen={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onUserUpdated={fetchUsers}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingUserId}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}