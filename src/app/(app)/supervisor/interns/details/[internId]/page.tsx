
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, Eye, MessageSquare, ThumbsUp, ThumbsDown, Edit, CheckCircle, AlertCircle, Loader2, TrendingUp, Star, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport, InternEvaluation } from '@/types';
import { DUMMY_INTERNS } from '@/app/(app)/supervisor/interns/page'; 
import { DUMMY_REPORTS as ALL_DUMMY_REPORTS } from '@/app/(app)/student/reports/page'; // Updated import
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SCORING_METRICS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import * as z from 'zod';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';

const evaluationSchemaDefinition: z.ZodRawShape = {};
SCORING_METRICS.forEach(metric => {
  evaluationSchemaDefinition[metric.id] = z.coerce.number().min(1, "Score required").max(5, "Score between 1-5").optional();
});
evaluationSchemaDefinition.overallComments = z.string().min(10, "Comments must be at least 10 characters.").max(1000, "Comments too long.");

const evaluationSchema = z.object(evaluationSchemaDefinition);
type EvaluationFormValues = z.infer<typeof evaluationSchema>;


export default function InternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const internId = params.internId as string;

  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = React.useState(false);
  
  const evaluationMethods = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
        scores: {},
        overallComments: ''
    }
  });

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setIntern(foundIntern);

      const storedEvaluation = localStorage.getItem(`internEvaluation_${internId}`);
      if (storedEvaluation) {
          const parsedEval: InternEvaluation = JSON.parse(storedEvaluation);
          const scoresForForm: Record<string, number | undefined> = {};
          SCORING_METRICS.forEach(m => scoresForForm[m.id] = parsedEval.scores[m.id]);
          evaluationMethods.reset({ scores: scoresForForm, overallComments: parsedEval.overallComments });
      }

    } else {
      // router.push('/supervisor/interns'); 
    }
  }, [internId, router, evaluationMethods]);
  
  const onEvaluationSubmit = async (data: EvaluationFormValues) => {
    setIsSubmittingEvaluation(true);
    const evaluationData: InternEvaluation = {
        scores: data.scores as Record<string, number>, // Cast because zod makes it optional if not required.
        overallComments: data.overallComments,
        evaluationDate: new Date().toISOString(),
    };
    localStorage.setItem(`internEvaluation_${internId}`, JSON.stringify(evaluationData));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmittingEvaluation(false);
    toast({
        title: "Evaluation Saved",
        description: `Performance evaluation for ${intern?.name} has been recorded.`,
    });
  };


  if (!intern) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intern details...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={intern.name}
        description={`Details, submissions, and evaluation for ${intern.university}.`}
        icon={User}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/supervisor/interns", label: "My Interns" },
          { label: intern.name }
        ]}
        actions={
            <Link href={`/communication?chatWith=${intern.id}`} passHref>
                 <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4"/>Contact Intern</Button>
            </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="p-6 border-b text-center bg-primary/10">
              <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary/30 shadow-lg">
                <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint="person student"/>
                <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(intern.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl text-primary">{intern.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{intern.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm space-y-2">
              <p><strong className="text-foreground">University:</strong> {intern.university}</p>
              <p><strong className="text-foreground">Pending Tasks:</strong> <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>{intern.pendingTasks}</Badge></p>
              <p><strong className="text-foreground">Last Activity:</strong> {intern.lastActivity}</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary"/> Performance Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Detailed analytics will provide insights into task completion, report submission trends, and more.
                </p>
            </CardContent>
            <CardFooter>
                <Link href={`/supervisor/interns/analytics/${internId}`} passHref className="w-full">
                    <Button variant="outline" className="w-full rounded-lg">View Detailed Analytics</Button>
                </Link>
            </CardFooter>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <FormProvider {...evaluationMethods}>
            <form onSubmit={evaluationMethods.handleSubmit(onEvaluationSubmit)}>
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-primary"/>Intern Performance Evaluation</CardTitle>
                        <CardDescription>Provide scores and overall feedback for {intern.name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {SCORING_METRICS.map(metric => (
                            <div key={metric.id} className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`score-${metric.id}`} className="col-span-1 text-sm font-medium">{metric.label}</Label>
                                <Controller
                                    name={`scores.${metric.id}` as any} 
                                    control={evaluationMethods.control}
                                    render={({ field, fieldState }) => (
                                        <div className="col-span-2">
                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                                                <SelectTrigger id={`score-${metric.id}`} className="rounded-lg">
                                                    <SelectValue placeholder="Select score (1-5)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
                                            {metric.description && <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>}
                                        </div>
                                    )}
                                />
                            </div>
                        ))}
                        <Separator/>
                        <div>
                            <Label htmlFor="overallComments" className="text-sm font-medium">Overall Comments</Label>
                             <Controller
                                name="overallComments"
                                control={evaluationMethods.control}
                                render={({ field, fieldState }) => (
                                    <>
                                    <Textarea 
                                        id="overallComments" 
                                        placeholder={`Provide overall feedback for ${intern.name}...`} 
                                        {...field} 
                                        rows={5} 
                                        className="mt-1 rounded-lg"
                                    />
                                    {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="rounded-lg" disabled={isSubmittingEvaluation}>
                            {isSubmittingEvaluation && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            <Save className="mr-2 h-4 w-4"/> Save Evaluation
                        </Button>
                    </CardFooter>
                </Card>
            </form>
          </FormProvider>

        </div>
      </div>
    </div>
  );
}
