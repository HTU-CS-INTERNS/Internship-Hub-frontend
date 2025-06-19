
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
import { CalendarIcon, Paperclip, UploadCloud, Image as ImageIconLucide, XCircle, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { DailyReport, AttachmentData } from '@/types';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide's Image
import { createReport, updateReport } from '@/lib/services/report.service';

const dailyReportSchema = z.object({
  date: z.date({ required_error: 'Report date is required.' }),
  title: z.string().min(5, { message: 'Report title must be at least 5 characters.'}).max(100, { message: 'Title too long (max 100).' }),
  summary: z.string().min(20, { message: 'Summary must be at least 20 characters.' }).max(1000, {message: 'Summary too long (max 1000).'}),
  challengesFaced: z.string().max(1000, {message: 'Challenges description too long (max 1000).' }).optional().or(z.literal('')),
  learnings: z.string().min(10, { message: 'Learnings must be at least 10 characters.' }).max(1000, {message: 'Learnings description too long (max 1000).' }),
  // Form will manage File objects for new uploads
  newAttachments: z.array(z.instanceof(File)).max(5, {message: 'Maximum 5 combined attachments allowed.'}).optional(),
  newSecurePhoto: z.instanceof(File).optional(),
});

type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

interface DailyReportFormProps {
  defaultValues?: Partial<DailyReport>; // DailyReport has attachments as AttachmentData[] and securePhotoUrl as string
  reportIdToEdit?: string;
  onSuccess?: (reportId: string) => void;
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

async function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function DailyReportForm({ defaultValues, reportIdToEdit, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [existingAttachments, setExistingAttachments] = React.useState<AttachmentData[]>([]);
  const [newlySelectedAttachments, setNewlySelectedAttachments] = React.useState<File[]>([]);
  const attachmentsInputRef = React.useRef<HTMLInputElement>(null);

  const [existingSecurePhotoUrl, setExistingSecurePhotoUrl] = React.useState<string | null>(null);
  const [newSecurePhotoFile, setNewSecurePhotoFile] = React.useState<File | null>(null);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(null);
  const securePhotoInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      title: defaultValues?.title || '',
      summary: defaultValues?.description || '', // map description to summary for form
      challengesFaced: defaultValues?.challengesFaced || '',
      learnings: defaultValues?.learningObjectives || '', // map learningObjectives to learnings
      newAttachments: [],
      newSecurePhoto: undefined,
    },
  });
  
  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
        title: defaultValues.title || '',
        summary: defaultValues.description || '',
        challengesFaced: defaultValues.challengesFaced || '',
        learnings: defaultValues.learningObjectives || '',
        newAttachments: [],
        newSecurePhoto: undefined,
      });
      setExistingAttachments(defaultValues.attachments || []);
      setNewlySelectedAttachments([]);
      
      setExistingSecurePhotoUrl(defaultValues.securePhotoUrl || null);
      setSecurePhotoPreview(defaultValues.securePhotoUrl || null);
      setNewSecurePhotoFile(null);
    }
  }, [defaultValues, form]);

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const combinedCount = existingAttachments.length + newlySelectedAttachments.length + filesArray.length;
      if (combinedCount > 5) {
        toast({ title: "Attachment Limit", description: `Cannot exceed 5 total attachments.`, variant: "destructive" });
        if(attachmentsInputRef.current) attachmentsInputRef.current.value = "";
        return;
      }
      setNewlySelectedAttachments(prev => [...prev, ...filesArray].slice(0, 5 - existingAttachments.length));
    }
  };

  const removeExistingAttachment = (dataUriToRemove: string) => {
    setExistingAttachments(prev => prev.filter(att => att.dataUri !== dataUriToRemove));
  };

  const removeNewAttachment = (fileNameToRemove: string) => {
    setNewlySelectedAttachments(prev => prev.filter(file => file.name !== fileNameToRemove));
    if(attachmentsInputRef.current && newlySelectedAttachments.length === 1 && newlySelectedAttachments[0].name === fileNameToRemove) {
        attachmentsInputRef.current.value = "";
    }
  };
  
  const handleSecurePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewSecurePhotoFile(file);
      fileToDataUri(file).then(setSecurePhotoPreview);
    }
  };

  const clearSecurePhoto = () => {
    setNewSecurePhotoFile(null);
    setSecurePhotoPreview(null); 
    setExistingSecurePhotoUrl(null); // Also clear existing if user decides to clear
    if(securePhotoInputRef.current) securePhotoInputRef.current.value = "";
  };

  async function onSubmit(values: DailyReportFormValues) {
    setIsLoading(true);
    
    try {
      const newAttachmentsData: AttachmentData[] = await Promise.all(
        newlySelectedAttachments.map(file => fileToAttachmentData(file))
      );
      const finalAttachments: AttachmentData[] = [...existingAttachments, ...newAttachmentsData];

      if (finalAttachments.length > 5) {
        toast({ title: "Attachment Limit Exceeded", description: "You cannot have more than 5 total attachments.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      let finalSecurePhotoUrl: string | undefined = undefined;
      if (newSecurePhotoFile) {
        finalSecurePhotoUrl = await fileToDataUri(newSecurePhotoFile);
      } else if (securePhotoPreview) { // This means existing photo was kept or previewed but not cleared
        finalSecurePhotoUrl = securePhotoPreview;
      }

      const reportPayload = {
        date: format(values.date, 'yyyy-MM-dd'),
        title: values.title,
        description: values.summary,
        challengesFaced: values.challengesFaced,
        learningObjectives: values.learnings,
        outcomes: values.summary, // For simplicity, using summary as outcome for mock. Can be expanded.
        attachments: finalAttachments,
        securePhotoUrl: finalSecurePhotoUrl,
      };

      let savedReport: DailyReport | null;
      if (reportIdToEdit) {
        savedReport = await updateReport(reportIdToEdit, reportPayload);
      } else {
        savedReport = await createReport(reportPayload);
      }

      if (savedReport) {
        toast({
          title: reportIdToEdit ? 'Report Updated!' : 'Report Submitted!',
          description: `Your work report for ${format(values.date, "PPP")} has been ${reportIdToEdit ? 'updated' : 'submitted'}.`,
        });
        if (onSuccess) {
          onSuccess(savedReport.id);
        } else {
          router.push('/student/reports'); 
        }
      } else {
        throw new Error("Failed to save report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Could not save your report. Please try again.",
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
            <FormLabel>General Attachments (Optional, max 5 total)</FormLabel>
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
            {(existingAttachments.length > 0 || newlySelectedAttachments.length > 0) && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Current attachments ({existingAttachments.length + newlySelectedAttachments.length} / 5):
                </p>
                <ul className="list-none space-y-1">
                  {existingAttachments.map((att, index) => (
                    <li key={`existing-att-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md border border-input">
                      <a href={att.dataUri} target="_blank" rel="noopener noreferrer" className="flex items-center break-all hover:underline">
                        <Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{att.name} ({(att.size / 1024).toFixed(1)} KB)
                      </a>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingAttachment(att.dataUri)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                  {newlySelectedAttachments.map((file, index) => (
                    <li key={`new-att-${index}`} className="text-sm text-muted-foreground flex items-center justify-between bg-blue-500/10 p-2 rounded-md border border-blue-500/30">
                      <span className="flex items-center break-all"><Paperclip className="inline mr-2 h-4 w-4 text-primary flex-shrink-0" />{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeNewAttachment(file.name)} className="text-destructive hover:text-destructive h-6 w-6 ml-2 flex-shrink-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FormMessage>{form.formState.errors.newAttachments?.message}</FormMessage>
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
                            <ImageIconLucide className="w-10 h-10 mb-2 text-muted-foreground" />
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
            <FormMessage>{form.formState.errors.newSecurePhoto?.message}</FormMessage>
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
    