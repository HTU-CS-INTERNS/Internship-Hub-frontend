
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
import { CalendarIcon, Paperclip, UploadCloud, Image as ImageIcon, XCircle, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { DailyReport } from '@/types';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

const dailyReportSchema = z.object({
  date: z.date({ required_error: 'Report date is required.' }),
  title: z.string().min(5, { message: 'Report title must be at least 5 characters.'}).max(100, { message: 'Title too long (max 100).' }),
  summary: z.string().min(20, { message: 'Summary must be at least 20 characters.' }).max(1000, {message: 'Summary too long (max 1000).'}),
  challengesFaced: z.string().max(1000, {message: 'Challenges description too long (max 1000).' }).optional().or(z.literal('')),
  learnings: z.string().min(10, { message: 'Learnings must be at least 10 characters.' }).max(1000, {message: 'Learnings description too long (max 1000).' }),
  attachments: z.array(z.instanceof(File)).max(5, {message: 'Maximum 5 attachments allowed.'}).optional(),
  securePhoto: z.instanceof(File).optional(),
});

type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

interface DailyReportFormProps {
  defaultValues?: Partial<DailyReport & { summary?: string; learnings?: string }>; // Adjust for potential renaming
  reportIdToEdit?: string;
  onSuccess?: (reportId: string) => void;
}

export default function DailyReportForm({ defaultValues, reportIdToEdit, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAttachments, setSelectedAttachments] = React.useState<File[]>([]);
  const [existingAttachmentNames, setExistingAttachmentNames] = React.useState<string[]>([]);
  const [securePhotoFile, setSecurePhotoFile] = React.useState<File | null>(null);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(defaultValues?.securePhotoUrl || null);
  
  const attachmentsInputRef = React.useRef<HTMLInputElement>(null);
  const securePhotoInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      title: (defaultValues as any)?.title || '',
      summary: defaultValues?.description || (defaultValues as any)?.summary || '',
      challengesFaced: (defaultValues as any)?.challengesFaced || '',
      learnings: defaultValues?.learningObjectives || (defaultValues as any)?.learnings || '',
      attachments: [],
      securePhoto: undefined,
    },
  });
  
  React.useEffect(() => {
    if (reportIdToEdit && defaultValues?.attachments) {
      setExistingAttachmentNames(defaultValues.attachments);
    }
    if (defaultValues?.securePhotoUrl) {
        setSecurePhotoPreview(defaultValues.securePhotoUrl);
    }
  }, [reportIdToEdit, defaultValues]);


  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newFiles = [...selectedAttachments, ...filesArray].slice(0, 5);
      setSelectedAttachments(newFiles);
      form.setValue("attachments", newFiles, { shouldValidate: true });
    }
  };

  const removeAttachment = (fileName: string) => {
    const newFiles = selectedAttachments.filter(file => file.name !== fileName);
    setSelectedAttachments(newFiles);
    form.setValue("attachments", newFiles, { shouldValidate: true });
  };

  const removeExistingAttachment = (fileName: string) => {
    setExistingAttachmentNames(prev => prev.filter(name => name !== fileName));
    toast({ title: "Attachment Marked for Removal (Simulated)", description: `${fileName} will be removed upon saving.` });
  };
  
  const handleSecurePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSecurePhotoFile(file); // Store the File object
      form.setValue("securePhoto", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecurePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSecurePhoto = () => {
    setSecurePhotoFile(null);
    setSecurePhotoPreview(null); 
    form.setValue("securePhoto", undefined, { shouldValidate: true }); 
    if(securePhotoInputRef.current) securePhotoInputRef.current.value = "";
  }

  async function onSubmit(values: DailyReportFormValues) {
    setIsLoading(true);
    // In a real app, attachments and securePhoto (File objects) would be uploaded to storage first.
    // Then, their URLs would be included in the payload to the backend.
    // For this mock, the service will just handle file names.
    
    const reportPayload = {
        ...values,
        // Convert File objects to names for mock service
        attachments: selectedAttachments.map(f => f.name), 
        // If editing, and existing attachments were kept, merge them here
        // For simplicity, this example replaces all attachments if new ones are selected.
        // If `selectedAttachments` is empty, it means no new files were chosen.
        // We should then probably send `existingAttachmentNames` if they exist for an update.
        // This needs careful handling in a real scenario.
        
        // securePhoto: securePhotoFile ? securePhotoFile.name : (reportIdToEdit && defaultValues?.securePhotoUrl ? defaultValues.securePhotoUrl : undefined),
        securePhotoUrl: securePhotoFile ? `uploads/${securePhotoFile.name}` : (reportIdToEdit && securePhotoPreview && !securePhotoFile ? securePhotoPreview : undefined),
    };
    
    if (taskIdToEdit && existingAttachmentNames.length > 0 && selectedAttachments.length === 0) {
        (reportPayload as any).attachments = existingAttachmentNames; // Keep old if no new ones selected
    }


    console.log("Submitting report payload (mock):", reportPayload);
    // Simulate API call (service interaction is mocked inside the report page for now)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newReportId = reportIdToEdit || `report_${Date.now()}`;
    
    // Simulate saving to DUMMY_REPORTS or calling a service
    // This part should be replaced by actual service call in a real app
    // For now, we'll rely on the calling page to handle the actual data update for the mock.

    setIsLoading(false);
    toast({
      title: reportIdToEdit ? 'Report Updated!' : 'Report Submitted!',
      description: `Your work report for ${format(values.date, "PPP")} has been ${reportIdToEdit ? 'updated' : 'submitted'}. Supervisor will be notified.`,
      variant: "default",
    });
    
    if (onSuccess) {
      onSuccess(newReportId);
    } else {
      router.push('/student/reports'); 
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
              <FormLabel>Report Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal rounded-lg border-input hover:bg-muted",!field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date() || date < new Date("2000-01-01")} className="bg-card text-card-foreground"/>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Title / Main Objective for the Day</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Finalized User Authentication Module" {...field} className="rounded-lg border-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary of Work Done</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide a detailed summary of activities, tasks completed, and progress made." {...field} rows={6} className="rounded-lg border-input" />
              </FormControl>
              <FormDescription>This is the main content of your report.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="challengesFaced"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenges Faced (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe any challenges encountered and how you addressed them, or if they are still pending." {...field} rows={3} className="rounded-lg border-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="learnings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Learnings / Skills Applied</FormLabel>
              <FormControl>
                <Textarea placeholder="What new skills, knowledge, or insights did you gain or apply today?" {...field} rows={4} className="rounded-lg border-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>General Attachments (Optional, max 5 files)</FormLabel>
            <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file-report" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">Images, PDFs, documents (max 5MB each)</p>
                    </div>
                    <input ref={attachmentsInputRef} id="dropzone-file-report" type="file" className="hidden" multiple onChange={handleAttachmentChange} accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"/>
                </label>
            </div> 
            </FormControl>
            {/* Display existing attachments if editing */}
            {reportIdToEdit && existingAttachmentNames.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Current attachments:</p>
                    <ul className="list-none space-y-1">
                    {existingAttachmentNames.map((name, index) => (
                        <li key={`existing-att-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md border border-input">
                            <span className="flex items-center break-all"><Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{name}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingAttachment(name)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
            {/* Display newly selected attachments */}
            {selectedAttachments.length > 0 && (
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">{reportIdToEdit && existingAttachmentNames.length > 0 ? 'New files to upload (will be added/replace):' : 'Selected files:'}</p>
                <ul className="list-none space-y-1">
                {selectedAttachments.map((file, index) => (
                    <li key={`new-att-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md border border-input">
                    <span className="flex items-center break-all"><Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(file.name)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                        <XCircle className="h-4 w-4" />
                    </Button>
                    </li>
                ))}
                </ul>
            </div>
            )}
            <FormMessage>{form.formState.errors.attachments?.message}</FormMessage>
        </FormItem>

        <FormItem>
            <FormLabel>Secure Photo Capture (Optional)</FormLabel>
             <FormDescription>As per trust model guidelines, upload a secure photo if relevant to your report (e.g., photo of completed work setup).</FormDescription>
            <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="secure-photo-file-report" className="flex flex-col items-center justify-center w-full h-48 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 relative overflow-hidden">
                    {securePhotoPreview ? (
                        <NextImage src={securePhotoPreview} alt="Secure photo preview" layout="fill" objectFit="contain" data-ai-hint="workplace item person"/>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Upload Secure Photo</span></p>
                            <p className="text-xs text-muted-foreground">E.g., photo of completed work, setup</p>
                        </div>
                    )}
                    <input ref={securePhotoInputRef} id="secure-photo-file-report" type="file" className="hidden" onChange={handleSecurePhotoChange} accept="image/*" capture="environment" />
                </label>
            </div> 
            </FormControl>
             {securePhotoPreview && (
                <Button type="button" variant="outline" size="sm" className="mt-2 rounded-lg border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={clearSecurePhoto}>
                    <XCircle className="mr-2 h-4 w-4"/> Clear Photo
                </Button>
             )}
            <FormMessage>{form.formState.errors.securePhoto?.message}</FormMessage>
        </FormItem>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? (reportIdToEdit ? 'Updating Report...' : 'Submitting Report...') : (reportIdToEdit ? 'Update Report' : 'Submit Report')}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg border-input hover:bg-muted text-base py-3" onClick={() => router.back()} disabled={isLoading}>
            Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}

