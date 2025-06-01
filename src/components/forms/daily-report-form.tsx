
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
import { CalendarIcon, Paperclip, UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { DailyReport } from '@/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const dailyReportSchema = z.object({
  date: z.date({ required_error: 'Report date is required.' }),
  title: z.string().min(5, { message: 'Report title must be at least 5 characters.'}).max(100, { message: 'Title too long (max 100).' }),
  summary: z.string().min(20, { message: 'Summary must be at least 20 characters.' }).max(1000, {message: 'Summary too long (max 1000).'}),
  challengesFaced: z.string().max(1000, {message: 'Challenges description too long (max 1000).' }).optional(),
  learnings: z.string().min(10, { message: 'Learnings must be at least 10 characters.' }).max(1000, {message: 'Learnings description too long (max 1000).' }),
  attachments: z.array(z.instanceof(File)).max(5, {message: 'Maximum 5 attachments allowed.'}).optional(),
  securePhoto: z.instanceof(File).optional(),
});

type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

interface DailyReportFormProps {
  defaultValues?: Partial<DailyReport>; 
  onSuccess?: (reportId: string) => void;
}

export default function DailyReportForm({ defaultValues, onSuccess }: DailyReportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [securePhotoPreview, setSecurePhotoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const securePhotoInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      title: (defaultValues as any)?.title || '',
      summary: defaultValues?.description || '',
      challengesFaced: (defaultValues as any)?.challengesFaced || '',
      learnings: defaultValues?.learningObjectives || '',
      attachments: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newFiles = [...selectedFiles, ...filesArray].slice(0, 5);
      setSelectedFiles(newFiles);
      form.setValue("attachments", newFiles, { shouldValidate: true });
    }
  };

  const removeFile = (fileName: string) => {
    const newFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(newFiles);
    form.setValue("attachments", newFiles, { shouldValidate: true });
  };
  
  const handleSecurePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      form.setValue("securePhoto", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecurePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSecurePhoto = () => {
    setSecurePhotoPreview(null); 
    form.setValue("securePhoto", undefined, { shouldValidate: true }); 
    if(securePhotoInputRef.current) securePhotoInputRef.current.value = "";
  }

  async function onSubmit(values: DailyReportFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newReportId = `report_${Date.now()}`;
    
    setIsLoading(false);
    toast({
      title: defaultValues ? 'Report Updated!' : 'Report Submitted!',
      description: `Your work report for ${format(values.date, "PPP")} has been ${defaultValues ? 'updated' : 'submitted'}.`,
      variant: "default",
    });
    
    if (onSuccess) {
      onSuccess(newReportId);
    } else {
      router.push('/reports');
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
                      className={cn("w-full justify-start text-left font-normal rounded-lg",!field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="bg-card text-card-foreground"/>
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
              <FormLabel>Report Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekly Progress on Project X" {...field} className="rounded-lg" />
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
                <Textarea placeholder="Provide a detailed summary of the work accomplished." {...field} rows={5} className="rounded-lg" />
              </FormControl>
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
                <Textarea placeholder="Describe any challenges encountered and how they were addressed." {...field} rows={3} className="rounded-lg" />
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
              <FormLabel>Key Learnings</FormLabel>
              <FormControl>
                <Textarea placeholder="What new skills, knowledge, or insights did you gain?" {...field} rows={3} className="rounded-lg" />
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
                        <p className="text-xs text-muted-foreground">Images, PDFs, documents</p>
                    </div>
                    <input ref={fileInputRef} id="dropzone-file-report" type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"/>
                </label>
            </div> 
            </FormControl>
            {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Selected files:</p>
                <ul className="list-none space-y-1">
                {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <span className="flex items-center"><Paperclip className="inline mr-2 h-4 w-4 text-primary" />{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(file.name)} className="text-destructive hover:text-destructive h-6 w-6">
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
             <FormDescription>As per trust model guidelines, upload a secure photo if required (e.g., photo at workplace).</FormDescription>
            <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="secure-photo-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 relative overflow-hidden">
                    {securePhotoPreview ? (
                        <Image src={securePhotoPreview} alt="Secure photo preview" layout="fill" objectFit="contain" data-ai-hint="workplace person"/>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Upload Secure Photo</span></p>
                            <p className="text-xs text-muted-foreground">E.g., photo at workplace</p>
                        </div>
                    )}
                    <input ref={securePhotoInputRef} id="secure-photo-file" type="file" className="hidden" onChange={handleSecurePhotoChange} accept="image/*" capture="environment" />
                </label>
            </div> 
            </FormControl>
            {form.getValues("securePhoto") && !securePhotoPreview && (
                 <p className="text-sm text-muted-foreground mt-2">Photo selected: {form.getValues("securePhoto")?.name}</p>
            )}
             {securePhotoPreview && (
                <Button type="button" variant="outline" size="sm" className="mt-2 rounded-lg" onClick={clearSecurePhoto}>Clear Photo</Button>
             )}
            <FormMessage>{form.formState.errors.securePhoto?.message}</FormMessage>
        </FormItem>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? (defaultValues ? 'Updating...' : 'Submitting...') : (defaultValues ? 'Update Report' : 'Submit Report')}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={() => router.back()} disabled={isLoading}>
            Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
