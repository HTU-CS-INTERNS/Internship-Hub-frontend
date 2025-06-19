
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { InternshipDetails, InternshipStatus } from '@/types';
import { submitPlacementForApproval } from '@/lib/services/hod.service'; // Import the new service

const internshipDetailsSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name is required (min 2 chars).' }).max(100, { message: 'Company name too long (max 100).' }),
  companyAddress: z.string().min(5, { message: 'Company address is required (min 5 chars).' }).max(200, { message: 'Address too long (max 200).' }),
  supervisorName: z.string().min(2, { message: 'Supervisor name is required (min 2 chars).' }).max(100, { message: 'Supervisor name too long (max 100).' }),
  supervisorEmail: z.string().email({ message: 'Valid supervisor email is required.' }),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  location: z.string().min(2, { message: 'Location/Work Arrangement is required (min 2 chars).' }).max(100, { message: 'Location too long (max 100).' }),
  status: z.custom<InternshipStatus>().optional(),
  rejectionReason: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

export type InternshipDetailsFormValues = z.infer<typeof internshipDetailsSchema>;

interface InternshipDetailsFormProps {
  defaultValues?: Partial<InternshipDetails>;
  onSuccess?: (data: InternshipDetails) => void;
  isResubmitting?: boolean;
}

export default function InternshipDetailsForm({ defaultValues, onSuccess, isResubmitting }: InternshipDetailsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const parseDateSafe = (dateInput?: string | Date): Date | undefined => {
    if (!dateInput) return undefined;
    if (dateInput instanceof Date && isValid(dateInput)) return dateInput;
    if (typeof dateInput === 'string') {
      const parsed = parseISO(dateInput);
      if (isValid(parsed)) return parsed;
    }
    return undefined;
  };
  
  const form = useForm<InternshipDetailsFormValues>({
    resolver: zodResolver(internshipDetailsSchema),
    defaultValues: {
      companyName: defaultValues?.companyName || '',
      companyAddress: defaultValues?.companyAddress || '',
      supervisorName: defaultValues?.supervisorName || '',
      supervisorEmail: defaultValues?.supervisorEmail || '',
      startDate: parseDateSafe(defaultValues?.startDate),
      endDate: parseDateSafe(defaultValues?.endDate),
      location: defaultValues?.location || '',
      status: defaultValues?.status || 'NOT_SUBMITTED',
      rejectionReason: defaultValues?.rejectionReason || '',
    },
  });
  
  React.useEffect(() => {
    form.reset({
      companyName: defaultValues?.companyName || '',
      companyAddress: defaultValues?.companyAddress || '',
      supervisorName: defaultValues?.supervisorName || '',
      supervisorEmail: defaultValues?.supervisorEmail || '',
      startDate: parseDateSafe(defaultValues?.startDate),
      endDate: parseDateSafe(defaultValues?.endDate),
      location: defaultValues?.location || '',
      status: defaultValues?.status || 'NOT_SUBMITTED',
      rejectionReason: defaultValues?.rejectionReason || '',
    });
  }, [defaultValues, form]);


  async function onSubmit(values: InternshipDetailsFormValues) {
    setIsLoading(true);
    const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student_id' : 'unknown_student_id';
    const studentName = typeof window !== "undefined" ? localStorage.getItem('userName') || 'Unknown Student' : 'Unknown Student';

    const submissionDataForService: InternshipDetails = {
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      status: 'PENDING_APPROVAL', // Service will set this
      rejectionReason: values.status === 'REJECTED' ? values.rejectionReason : undefined,
    };
    
    try {
      await submitPlacementForApproval(submissionDataForService, studentId, studentName);
      
      if (typeof window !== "undefined") {
        localStorage.removeItem('onboardingComplete'); 
      }

      toast({
        title: isResubmitting ? 'Internship Details Resubmitted!' : 'Internship Details Submitted!',
        description: 'Your internship information has been sent for HOD approval.',
        variant: "default",
      });
      onSuccess?.(submissionDataForService); // Pass the data (now with PENDING_APPROVAL status) back to parent
    } catch (error) {
      console.error("Error submitting placement for approval:", error);
      toast({
        title: "Submission Error",
        description: "Could not submit your internship details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Anytown, USA" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Supervisor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} className="rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="supervisor@company.com" {...field} className="rounded-lg" />
                </FormControl>
                <FormDescription>This email may be used to invite your supervisor once approved by HOD.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal rounded-lg", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="bg-card text-card-foreground"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal rounded-lg", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        form.getValues("startDate") ? date < form.getValues("startDate") : false
                      }
                      initialFocus
                      className="bg-card text-card-foreground"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Location / Work Arrangement</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Remote, New York Office, Hybrid" {...field} className="rounded-lg" />
                </FormControl>
                <FormDescription>Specify if on-site, remote, or hybrid, and city if applicable.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isResubmitting ? 'Resubmit for HOD Approval' : 'Submit for HOD Approval'}
            </Button>
             <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={() => onSuccess?.(form.getValues() as InternshipDetails)} disabled={isLoading}>
                Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
