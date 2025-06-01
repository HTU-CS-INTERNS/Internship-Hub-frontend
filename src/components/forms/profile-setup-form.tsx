
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
import type { Department, Faculty } from '@/types';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100, { message: 'Name too long (max 100).' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  facultyId: z.string().min(1, { message: 'Please select a faculty.' }),
  departmentId: z.string().min(1, { message: 'Please select a department.' }),
  contactNumber: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10,15}$/, { message: "Invalid contact number format."}).optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  defaultValues?: Partial<ProfileFormValues>;
  onSuccess?: (data: ProfileFormValues) => void; // Pass data back on success
}

export default function ProfileSetupForm({ defaultValues, onSuccess }: ProfileSetupFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableDepartments, setAvailableDepartments] = React.useState<Department[]>(DEPARTMENTS);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      facultyId: defaultValues?.facultyId || '',
      departmentId: defaultValues?.departmentId || '',
      contactNumber: defaultValues?.contactNumber || '',
    },
  });
  
  const selectedFacultyId = form.watch('facultyId');

  React.useEffect(() => {
    if (selectedFacultyId) {
      const depts = DEPARTMENTS.filter(d => d.facultyId === selectedFacultyId);
      setAvailableDepartments(depts);
      // Reset department if current selection is not in the new list
      if (!depts.find(d => d.id === form.getValues('departmentId'))) {
        form.setValue('departmentId', ''); 
      }
    } else {
      setAvailableDepartments(DEPARTMENTS); 
    }
  }, [selectedFacultyId, form]);

  React.useEffect(() => {
    if (defaultValues?.facultyId) {
      setAvailableDepartments(DEPARTMENTS.filter(d => d.facultyId === defaultValues.facultyId));
       // Ensure default department is valid for the default faculty
      if (defaultValues.departmentId && !DEPARTMENTS.find(d => d.id === defaultValues.departmentId && d.facultyId === defaultValues.facultyId)) {
        form.setValue('departmentId', '');
      } else {
        form.setValue('departmentId', defaultValues.departmentId || '');
      }
    }
     // Reset form with potentially new defaultValues when component re-renders with them
    form.reset({
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      facultyId: defaultValues?.facultyId || '',
      departmentId: (defaultValues?.facultyId && DEPARTMENTS.find(d => d.id === defaultValues.departmentId && d.facultyId === defaultValues.facultyId)) ? defaultValues.departmentId : '',
      contactNumber: defaultValues?.contactNumber || '',
    });
  }, [defaultValues, form]);


  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoading(false);

    toast({
      title: 'Profile Updated!',
      description: 'Your profile information has been successfully saved.',
      variant: "default",
    });
    onSuccess?.(values); 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} className="rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
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
        <FormField
          control={form.control}
          name="facultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FACULTIES.map((faculty: Faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
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
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFacultyId && availableDepartments.length === DEPARTMENTS.length}>
                <FormControl>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDepartments.map((dept: Department) => (
                    <SelectItem key={dept.id} value={dept.id}>
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
