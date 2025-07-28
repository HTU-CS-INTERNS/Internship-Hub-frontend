
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
import type { DailyTask, AttachmentData } from '@/types';
import { useRouter } from 'next/navigation';
import { createTask, updateTaskStatus } from '@/lib/services/task.service';
const dailyTaskSchema = z.object({
  date: z.date({ required_error: 'Task date is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000, {message: 'Description too long (max 1000).' }),
  outcomes: z.string().min(10, { message: 'Outcomes must be at least 10 characters.' }).max(1000, {message: 'Outcomes too long (max 1000).' }),
  learningObjectives: z.string().min(10, { message: 'Learning objectives must be at least 10 characters.' }).max(1000, {message: 'Learning objectives too long (max 1000).' }),
  newAttachments: z.array(z.instanceof(File)).max(5, {message: 'Maximum 5 combined attachments allowed.'}).optional(),
});

type DailyTaskFormValues = z.infer<typeof dailyTaskSchema>;

interface DailyTaskFormProps {
  defaultValues?: Partial<DailyTask>; // DailyTask has attachments as AttachmentData[]
  taskIdToEdit?: string;
  onSuccess?: (taskId: string) => void;
}

async function fileToAttachmentData(file: File): Promise<AttachmentData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUri: reader.result as string,
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function DailyTaskForm({ defaultValues, taskIdToEdit, onSuccess }: DailyTaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [existingAttachments, setExistingAttachments] = React.useState<AttachmentData[]>([]);
  const [newlySelectedFiles, setNewlySelectedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DailyTaskFormValues>({
    resolver: zodResolver(dailyTaskSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      description: defaultValues?.description || '',
      outcomes: defaultValues?.outcomes || '',
      learningObjectives: defaultValues?.learningObjectives || '',
      newAttachments: [],
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
        description: defaultValues.description || '',
        outcomes: defaultValues.outcomes || '',
        learningObjectives: defaultValues.learningObjectives || '',
        newAttachments: [],
      });
      setExistingAttachments(defaultValues.attachments || []);
      setNewlySelectedFiles([]); // Clear any previously selected new files when defaultValues change
    }
  }, [defaultValues, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const combinedCount = existingAttachments.length + newlySelectedFiles.length + filesArray.length;
      if (combinedCount > 5) {
        toast({ title: "Too many files", description: `You can upload a maximum of 5 attachments. You currently have ${existingAttachments.length + newlySelectedFiles.length} and tried to add ${filesArray.length}.`, variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      setNewlySelectedFiles(prev => [...prev, ...filesArray].slice(0, 5 - existingAttachments.length));
    }
  };

  const removeExistingAttachment = (dataUriToRemove: string) => {
    setExistingAttachments(prev => prev.filter(att => att.dataUri !== dataUriToRemove));
  };

  const removeNewFile = (fileNameToRemove: string) => {
    setNewlySelectedFiles(prev => prev.filter(file => file.name !== fileNameToRemove));
    if (fileInputRef.current && newlySelectedFiles.length === 1 && newlySelectedFiles[0].name === fileNameToRemove) {
        fileInputRef.current.value = ""; // Clear input if last new file removed
    }
  };

  async function onSubmit(values: DailyTaskFormValues) {
    setIsLoading(true);
    
    try {
      const newAttachmentsData: AttachmentData[] = await Promise.all(
        newlySelectedFiles.map(file => fileToAttachmentData(file))
      );
      
      const finalAttachments: AttachmentData[] = [...existingAttachments, ...newAttachmentsData];

      if (finalAttachments.length > 5) {
        toast({ title: "Attachment Limit Exceeded", description: "You cannot have more than 5 attachments in total.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const taskPayload = {
        date: format(values.date, 'yyyy-MM-dd'),
        description: values.description,
        outcomes: values.outcomes,
        learningObjectives: values.learningObjectives,
        attachments: finalAttachments, 
      };

      let savedTask: DailyTask | null;
      if (taskIdToEdit) {
        savedTask = await updateTask(taskIdToEdit, taskPayload);
      } else {
        savedTask = await createTask(taskPayload);
      }

      if (savedTask) {
        toast({
          title: taskIdToEdit ? 'Task Updated!' : 'Task Declared!',
          description: `Your daily task for ${format(values.date, "PPP")} has been ${taskIdToEdit ? 'updated' : 'submitted'}.`,
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

        <FormItem>
            <FormLabel>Attachments (Optional, max 5 total)</FormLabel>
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
            
            {(existingAttachments.length > 0 || newlySelectedFiles.length > 0) && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Current attachments ({existingAttachments.length + newlySelectedFiles.length} / 5):
                </p>
                <ul className="list-none space-y-1">
                  {existingAttachments.map((att, index) => (
                    <li key={`existing-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md border border-input">
                      <a href={att.dataUri} target="_blank" rel="noopener noreferrer" className="flex items-center break-all hover:underline">
                        <Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{att.name} ({(att.size / 1024).toFixed(1)} KB)
                      </a>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingAttachment(att.dataUri)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  {newlySelectedFiles.map((file, index) => (
                    <li key={`new-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-blue-500/10 p-2 rounded-md border border-blue-500/30">
                      <span className="flex items-center break-all"><Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeNewFile(file.name)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FormMessage>{form.formState.errors.newAttachments?.message}</FormMessage>
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
    