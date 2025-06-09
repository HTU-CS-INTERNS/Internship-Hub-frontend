
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Paperclip, UploadCloud, XCircle, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { DailyTask } from '@/types';
import { useRouter } from 'next/navigation';
import { createTask, updateTask } from '@/lib/services/task.service'; // Import the service

const dailyTaskSchema = z.object({
  date: z.date({ required_error: 'Task date is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000, {message: 'Description too long (max 1000).' }),
  outcomes: z.string().min(10, { message: 'Outcomes must be at least 10 characters.' }).max(1000, {message: 'Outcomes too long (max 1000).' }),
  learningObjectives: z.string().min(10, { message: 'Learning objectives must be at least 10 characters.' }).max(1000, {message: 'Learning objectives too long (max 1000).' }),
  departmentOutcomeLink: z.string().max(100, {message: 'Link too long (max 100).' }).optional().or(z.literal('')),
  attachments: z.array(z.instanceof(File)).max(5, {message: 'Maximum 5 attachments allowed.'}).optional(),
});

type DailyTaskFormValues = z.infer<typeof dailyTaskSchema>;

interface DailyTaskFormProps {
  defaultValues?: Partial<DailyTask>;
  taskIdToEdit?: string;
  onSuccess?: (taskId: string) => void;
}

export default function DailyTaskForm({ defaultValues, taskIdToEdit, onSuccess }: DailyTaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DailyTaskFormValues>({
    resolver: zodResolver(dailyTaskSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      description: defaultValues?.description || '',
      outcomes: defaultValues?.outcomes || '',
      learningObjectives: defaultValues?.learningObjectives || '',
      departmentOutcomeLink: defaultValues?.departmentOutcomeLink || '',
      attachments: [], // Default to empty, files are handled separately if editing
    },
  });

  React.useEffect(() => {
    // If editing, defaultValues.attachments would be string array (file names)
    // We don't repopulate file input for editing, user must re-select if they want to change.
    // If there's a better way to handle file inputs with react-hook-form for edits, that could be done.
    // For now, attachments are always "new" if the input is used.
  }, [defaultValues]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newFiles = [...selectedFiles, ...filesArray].slice(0, 5); // Max 5 files
      setSelectedFiles(newFiles);
      form.setValue("attachments", newFiles, { shouldValidate: true });
    }
  };

  const removeFile = (fileName: string) => {
    const newFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(newFiles);
    form.setValue("attachments", newFiles, { shouldValidate: true });
    if(fileInputRef.current && newFiles.length === 0) {
        fileInputRef.current.value = ""; // Clear the input if all files removed
    }
  };

  async function onSubmit(values: DailyTaskFormValues) {
    setIsLoading(true);
    
    try {
      let savedTask: DailyTask | null;
      const taskPayload = {
        ...values,
        attachments: selectedFiles, // Pass File objects to the service
      };

      if (taskIdToEdit) {
        savedTask = await updateTask(taskIdToEdit, taskPayload);
      } else {
        savedTask = await createTask(taskPayload);
      }

      if (savedTask) {
        toast({
          title: taskIdToEdit ? 'Task Updated!' : 'Task Declared!',
          description: `Your daily task for ${format(values.date, "PPP")} has been ${taskIdToEdit ? 'updated' : 'submitted'}.`,
          variant: "default",
        });
        if (onSuccess) {
          onSuccess(savedTask.id);
        } else {
          router.push('/student/tasks'); 
        }
      } else {
        throw new Error("Failed to save task.");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Error",
        description: "Could not save your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Task Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal rounded-lg border-input hover:bg-muted", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date() || date < new Date("2000-01-01")} className="bg-card text-card-foreground" />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the main activities and tasks you performed or plan to perform." {...field} rows={4} className="rounded-lg border-input" />
              </FormControl>
              <FormDescription>Provide a clear and concise description of the task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outcomes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Outcomes/Results</FormLabel>
              <FormControl>
                <Textarea placeholder="What are the tangible outcomes or results expected from this task?" {...field} rows={3} className="rounded-lg border-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learningObjectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Objectives Involved</FormLabel>
              <FormControl>
                <Textarea placeholder="What new skills, knowledge, or insights do you expect to gain or apply?" {...field} rows={3} className="rounded-lg border-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentOutcomeLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Departmental Outcomes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Relates to DO1.2 - Problem Solving" {...field} className="rounded-lg border-input" />
              </FormControl>
              <FormDescription>
                If applicable, specify how this task relates to your department's learning outcomes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Attachments (Optional, max 5 files)</FormLabel>
            <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file-task" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">Images, PDFs, documents (max 5MB each)</p>
                    </div>
                    <input ref={fileInputRef} id="dropzone-file-task" type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx" />
                </label>
            </div> 
            </FormControl>
            {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Selected files:</p>
                <ul className="list-none space-y-1">
                {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md border border-input">
                      <span className="flex items-center break-all"><Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(file.name)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                          <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                ))}
                </ul>
            </div>
            )}
            <FormMessage>{form.formState.errors.attachments?.message}</FormMessage>
        </FormItem>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? (taskIdToEdit ? 'Updating Task...' : 'Submitting Task...') : (taskIdToEdit ? 'Update Task' : 'Submit Task')}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg border-input hover:bg-muted text-base py-3" onClick={() => router.back()} disabled={isLoading}>
            Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}

