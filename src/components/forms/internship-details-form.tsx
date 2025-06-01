
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
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { InternshipDetails } from '@/types';

const internshipDetailsSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name is required (min 2 chars).' }).max(100, { message: 'Company name too long (max 100).' }),
  companyAddress: z.string().min(5, { message: 'Company address is required (min 5 chars).' }).max(200, { message: 'Address too long (max 200).' }),
  supervisorName: z.string().min(2, { message: 'Supervisor name is required (min 2 chars).' }).max(100, { message: 'Supervisor name too long (max 100).' }),
  supervisorEmail: z.string().email({ message: 'Valid supervisor email is required.' }),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  location: z.string().min(2, { message: 'Location/Work Arrangement is required (min 2 chars).' }).max(100, { message: 'Location too long (max 100).' }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

export type InternshipDetailsFormValues = z.infer<typeof internshipDetailsSchema>;

interface InternshipDetailsFormProps {
  defaultValues?: Partial<InternshipDetails & { companyAddress?: string }>;
  onSuccess?: (data: InternshipDetailsFormValues) => void;
}

export default function InternshipDetailsForm({ defaultValues, onSuccess }: InternshipDetailsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const parseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      return parseISO(dateString);
    } catch (e) {
      return undefined;
    }
  };

  const form = useForm<InternshipDetailsFormValues>({
    resolver: zodResolver(internshipDetailsSchema),
    defaultValues: {
      companyName: defaultValues?.companyName || '',
      companyAddress: defaultValues?.companyAddress || '',
      supervisorName: defaultValues?.supervisorName || '',
      supervisorEmail: defaultValues?.supervisorEmail || '',
      startDate: parseDate(defaultValues?.startDate),
      endDate: parseDate(defaultValues?.endDate),
      location: defaultValues?.location || '', 
    },
  });
  
  React.useEffect(() => {
    form.reset({
      companyName: defaultValues?.companyName || '',
      companyAddress: defaultValues?.companyAddress || '',
      supervisorName: defaultValues?.supervisorName || '',
      supervisorEmail: defaultValues?.supervisorEmail || '',
      startDate: parseDate(defaultValues?.startDate),
      endDate: parseDate(defaultValues?.endDate),
      location: defaultValues?.location || '',
    });
  }, [defaultValues, form, parseDate]);


  async function onSubmit(values: InternshipDetailsFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    setIsLoading(false);
    toast({
      title: 'Internship Details Updated!',
      description: 'Your internship information has been saved.',
      variant: "default",
    });
    toast({
      title: 'Supervisor Invitation Sent (Simulated)',
      description: `An invitation email has been sent to ${values.supervisorEmail} to join InternshipTrack.`,
      duration: 5000,
    });
    onSuccess?.(values);
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
                <FormDescription>An invitation will be sent to this email (simulated).</FormDescription>
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
            Save Internship Details
            </Button>
             <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={() => onSuccess?.(form.getValues())} disabled={isLoading}>
                Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
