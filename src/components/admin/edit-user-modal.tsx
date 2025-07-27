
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { AdminApiService } from '@/lib/services/adminApi';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'student' | 'lecturer' | 'company_supervisor' | 'admin';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const USER_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'company_supervisor', label: 'Company Supervisor' },
  { value: 'admin', label: 'Admin' },
] as const;

export function EditUserModal({ user, isOpen, onOpenChange, onUserUpdated }: EditUserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: '' as UserRole,
    is_active: true,
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Never prefill password
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate required fields
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare update payload
      const updateData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        role: formData.role,
        is_active: formData.is_active,
        ...(formData.password && { password: formData.password }), // Only include password if changed
      };
      
      await AdminApiService.updateUser(user.id.toString(), updateData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('edit_', '')]: value }));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!loading) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Password field can be left blank to keep the current password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Leave blank to keep current"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Only enter a value if you want to change the password
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.is_active ? 'active' : 'inactive'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
