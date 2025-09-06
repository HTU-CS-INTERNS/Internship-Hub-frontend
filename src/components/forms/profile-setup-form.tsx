
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FACULTIES, DEPARTMENTS } from '@/lib/constants';
import type { Department, Faculty, UserRole, UserProfileData } from '@/types';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters.' }).max(50),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).max(50),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  faculty_id: z.coerce.number().optional(),
  department_id: z.coerce.number().optional(),
  phone_number: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10,15}$/, { message: "Invalid contact number format."}).optional().or(z.literal('')),
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters.'}).max(100).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  defaultValues?: Partial<UserProfileData>;
  onSuccess?: (data: Partial<UserProfileData>) => void; 
  userRole: UserRole | null; 
}

export default function ProfileSetupForm({ defaultValues, onSuccess, userRole }: ProfileSetupFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableDepartments, setAvailableDepartments] = React.useState<Department[]>(DEPARTMENTS);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || '',
      last_name: defaultValues?.last_name || '',
      email: defaultValues?.email || '',
      faculty_id: defaultValues?.faculty_id,
      department_id: defaultValues?.department_id,
      phone_number: defaultValues?.phone_number || '',
      company_name: defaultValues?.company_name || '',
    },
  });
  
  const selectedFacultyId = form.watch('faculty_id');

  React.useEffect(() => {
    if (userRole === 'STUDENT' && selectedFacultyId) {
      const depts = DEPARTMENTS.filter(d => d.faculty_id === selectedFacultyId);
      setAvailableDepartments(depts);
      if (!depts.find(d => d.id === form.getValues('department_id'))) {
        form.setValue('department_id', undefined); 
      }
    } else {
        setAvailableDepartments(DEPARTMENTS);
    }
  }, [selectedFacultyId, form, userRole]);

  React.useEffect(() => {
    form.reset({
      first_name: defaultValues?.first_name || '',
      last_name: defaultValues?.last_name || '',
      email: defaultValues?.email || '',
      faculty_id: defaultValues?.faculty_id,
      department_id: defaultValues?.department_id,
      phone_number: defaultValues?.phone_number || '',
      company_name: defaultValues?.company_name || '',
    });
  }, [defaultValues, form]);

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);
    // Simulate API call
    console.log("Simulating profile update with:", values);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setIsLoading(false);

    toast({
      title: 'Profile Updated! (Simulated)',
      description: 'Your profile information has been successfully saved.',
      variant: "default",
    });
    
    if (onSuccess) {
      // In a real app, you'd probably refetch the user data from context.
      // Here we just pass back the updated form values.
      onSuccess(values); 
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} className="rounded-lg" disabled />
              </FormControl>
              <FormDescription>Email address cannot be changed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., +1234567890" {...field} className="rounded-lg" />
              </FormControl>
               <FormDescription>Optional. Used for important communication.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {userRole === 'STUDENT' && (
          <>
            <FormField
              control={form.control}
              name="faculty_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ''}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select your faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FACULTIES.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id.toString()}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ''} disabled={!selectedFacultyId}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedFacultyId && <FormDescription className="text-xs">Please select a faculty first.</FormDescription>}
                  {selectedFacultyId && availableDepartments.length === 0 && <FormDescription className="text-xs text-destructive">No departments found for selected faculty.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {userRole === 'SUPERVISOR' && (
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Innovatech Solutions Inc." {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Profile
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={() => onSuccess?.(form.getValues())} disabled={isLoading}>
                Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
