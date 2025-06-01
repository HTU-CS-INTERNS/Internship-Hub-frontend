
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { InternshipDetails } from '@/types';

const internshipDetailsSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name is required (min 2 chars).' }).max(100, { message: 'Company name too long (max 100).' }),
  supervisorName: z.string().min(2, { message: 'Supervisor name is required (min 2 chars).' }).max(100, { message: 'Supervisor name too long (max 100).' }),
  supervisorEmail: z.string().email({ message: 'Valid supervisor email is required.' }),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  location: z.string().min(2, { message: 'Location is required (min 2 chars).' }).max(100, { message: 'Location too long (max 100).' }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type InternshipDetailsFormValues = z.infer<typeof internshipDetailsSchema>;

interface InternshipDetailsFormProps {
  defaultValues?: Partial<InternshipDetails>;
  onSuccess?: () => void;
}

export default function InternshipDetailsForm({ defaultValues, onSuccess }: InternshipDetailsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<InternshipDetailsFormValues>({
    resolver: zodResolver(internshipDetailsSchema),
    defaultValues: {
      companyName: defaultValues?.companyName || '',
      supervisorName: defaultValues?.supervisorName || '',
      supervisorEmail: defaultValues?.supervisorEmail || '',
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : undefined,
      location: defaultValues?.location || '',
    },
  });

  async function onSubmit(values: InternshipDetailsFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: 'Internship Details Updated!',
      description: 'Your internship information has been saved.',
      variant: "default",
    });
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (e.g., City, Remote)</FormLabel>
                <FormControl>
                  <Input placeholder="New York / Remote" {...field} className="rounded-lg" />
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
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Internship Details'}
            </Button>
             <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={onSuccess} disabled={isLoading}>
                Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
