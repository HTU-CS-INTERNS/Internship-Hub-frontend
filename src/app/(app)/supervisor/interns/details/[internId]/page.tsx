
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, Eye, MessageSquare, ThumbsUp, ThumbsDown, Edit, CheckCircle, AlertCircle, Loader2, TrendingUp, Star, Save, BarChart3, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/shared/empty-state';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SupervisorApiService } from '@/lib/services/supervisorApi';
import { useToast } from '@/hooks/use-toast';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';

interface InternDetails {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university: string;
  department: string;
  progress: number;
  status: string;
  pendingTasks: number;
  pendingReports: number;
  tasksCompleted: number;
  reportsSubmitted: number;
  lastActivity?: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  phoneNumber?: string;
  address?: string;
}

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface Analytics {
  taskCompletionRate: number;
  averageRating: number;
  attendanceRate: number;
  productivityScore: number;
  weeklyProgress: number[];
}

interface AnalyticsResponse {
  taskCompletionRate?: number;
  averageRating?: number;
  attendanceRate?: number;
  productivityScore?: number;
  weeklyProgress?: number[];
}

const SCORING_METRICS = [
  { id: 'technical_skills', label: 'Technical Skills', description: 'Proficiency in technical requirements' },
  { id: 'communication', label: 'Communication', description: 'Written and verbal communication' },
  { id: 'teamwork', label: 'Teamwork', description: 'Collaboration and interpersonal skills' },
  { id: 'initiative', label: 'Initiative', description: 'Proactive approach and problem-solving' },
  { id: 'punctuality', label: 'Punctuality', description: 'Timeliness and reliability' },
  { id: 'learning_ability', label: 'Learning Ability', description: 'Adaptability and willingness to learn' },
];

export default function InternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const internId = params.internId as string;

  const [intern, setIntern] = React.useState<InternDetails | null>(null);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [activityLog, setActivityLog] = React.useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(true);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = React.useState(false);
  
  // Evaluation form state
  const [evaluationScores, setEvaluationScores] = React.useState<Record<string, number>>({});
  const [overallComments, setOverallComments] = React.useState('');
  const [overallRating, setOverallRating] = React.useState<number>(0);

  React.useEffect(() => {
    fetchInternDetails();
    fetchInternAnalytics();
    fetchActivityLog();
  }, [internId]);

  const fetchInternDetails = async () => {
    try {
      setIsLoading(true);
      const data = await SupervisorApiService.getInternDetails(internId);
      
      if (data && typeof data === 'object') {
        setIntern({
          id: (data as any).id,
          name: (data as any).name || (data as any).user?.name || 'Unknown',
          email: (data as any).email || (data as any).user?.email || 'No email',
          avatar: (data as any).avatar || (data as any).user?.avatar,
          university: (data as any).university || (data as any).user?.university || 'Unknown University',
          department: (data as any).department || 'Unknown Department',
          progress: (data as any).progress || 0,
          status: (data as any).status || 'active',
          pendingTasks: (data as any).pendingTasks || 0,
          pendingReports: (data as any).pendingReports || 0,
          tasksCompleted: (data as any).tasksCompleted || 0,
          reportsSubmitted: (data as any).reportsSubmitted || 0,
          lastActivity: (data as any).lastActivity || 'No recent activity',
          startDate: (data as any).startDate || new Date().toISOString(),
          endDate: (data as any).endDate || new Date().toISOString(),
          supervisor: (data as any).supervisor || 'Unknown',
          phoneNumber: (data as any).phoneNumber || (data as any).user?.phoneNumber,
          address: (data as any).address || (data as any).user?.address
        });
      } else {
        toast({
          title: "Error",
          description: "Intern not found",
          variant: "destructive"
        });
        router.push('/supervisor/interns');
      }
    } catch (error) {
      console.error('Failed to fetch intern details:', error);
      toast({
        title: "Error",
        description: "Failed to load intern details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const data = await SupervisorApiService.getInternAnalytics(internId) as AnalyticsResponse;
      
      if (data) {
        setAnalytics({
          taskCompletionRate: data.taskCompletionRate || 0,
          averageRating: data.averageRating || 0,
          attendanceRate: data.attendanceRate || 0,
          productivityScore: data.productivityScore || 0,
          weeklyProgress: data.weeklyProgress || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const data = await SupervisorApiService.getInternActivityLog(internId, { limit: 10 });
      
      if (data && Array.isArray(data)) {
        setActivityLog(data.map((activity: any) => ({
          id: activity.id,
          type: activity.type || 'activity',
          message: activity.message || activity.description || 'No description',
          timestamp: activity.timestamp || activity.createdAt || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
    }
  };

  const handleEvaluationSubmit = async () => {
    try {
      setIsSubmittingEvaluation(true);
      
      const evaluationData = {
        period: 'current', // or get from form
        overallRating,
        technicalSkills: evaluationScores.technical_skills || 0,
        communication: evaluationScores.communication || 0,
        teamwork: evaluationScores.teamwork || 0,
        initiative: evaluationScores.initiative || 0,
        punctuality: evaluationScores.punctuality || 0,
        comments: overallComments,
        recommendations: 'Based on performance evaluation' // could be separate field
      };

      await SupervisorApiService.submitEvaluation(internId, evaluationData);
      
      toast({
        title: "Success",
        description: "Evaluation submitted successfully"
      });
      
      // Reset form
      setEvaluationScores({});
      setOverallComments('');
      setOverallRating(0);
      
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingEvaluation(false);
    }
  };

  const updateScore = (metricId: string, score: number) => {
    setEvaluationScores(prev => ({ ...prev, [metricId]: score }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intern details...</p>
      </div>
    );
  }

  if (!intern) {
    return (
      <EmptyState
        icon={User}
        title="Intern Not Found"
        description="The intern you're looking for could not be found."
        actionLabel="Back to Interns"
        onAction={() => router.push('/supervisor/interns')}
      />
    );
  }
  
  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={intern.name}
        description={`Details, submissions, and evaluation for ${intern.university}.`}
        icon={User}
        breadcrumbs={[
          { href: "/supervisor/dashboard", label: "Dashboard" },
          { href: "/supervisor/interns", label: "My Interns" },
          { label: intern.name }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(`mailto:${intern.email}`)}>
              <MessageSquare className="mr-2 h-4 w-4"/>Contact Intern
            </Button>
            <Button variant="outline" onClick={fetchInternDetails}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Intern Profile & Analytics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="p-6 border-b text-center bg-primary/10">
              <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary/30 shadow-lg">
                <AvatarImage src={intern.avatar} alt={intern.name} />
                <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(intern.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl text-primary">{intern.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{intern.email}</CardDescription>
              <Badge variant={intern.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                {intern.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 text-sm space-y-3">
              <div className="space-y-2">
                <p><strong className="text-foreground">University:</strong> {intern.university}</p>
                <p><strong className="text-foreground">Department:</strong> {intern.department}</p>
                <p><strong className="text-foreground">Progress:</strong> 
                  <div className="mt-1">
                    <Progress value={intern.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground">{intern.progress}% complete</span>
                  </div>
                </p>
                <p><strong className="text-foreground">Start Date:</strong> {format(new Date(intern.startDate), 'PPP')}</p>
                <p><strong className="text-foreground">End Date:</strong> {format(new Date(intern.endDate), 'PPP')}</p>
                {intern.phoneNumber && (
                  <p><strong className="text-foreground">Phone:</strong> {intern.phoneNumber}</p>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{intern.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{intern.reportsSubmitted}</p>
                  <p className="text-xs text-muted-foreground">Reports Submitted</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>
                    {intern.pendingTasks} Pending Tasks
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"}>
                    {intern.pendingReports} Pending Reports
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                <strong>Last Activity:</strong> {intern.lastActivity}
              </p>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary"/> Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm">Loading analytics...</span>
                </div>
              ) : analytics ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Task Completion Rate</span>
                      <span>{analytics.taskCompletionRate}%</span>
                    </div>
                    <Progress value={analytics.taskCompletionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Rating</span>
                      <span>{analytics.averageRating}/5</span>
                    </div>
                    <Progress value={(analytics.averageRating / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Attendance Rate</span>
                      <span>{analytics.attendanceRate}%</span>
                    </div>
                    <Progress value={analytics.attendanceRate} className="h-2" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No analytics data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary"/> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLog.length > 0 ? (
                <div className="space-y-3">
                  {activityLog.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Evaluation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center">
                <Star className="mr-2 h-5 w-5 text-primary"/>Performance Evaluation
              </CardTitle>
              <CardDescription>Provide scores and overall feedback for {intern.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Rating */}
              <div>
                <Label className="text-sm font-medium">Overall Rating</Label>
                <Select value={overallRating.toString()} onValueChange={(value) => setOverallRating(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select overall rating (1-5)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Satisfactory</SelectItem>
                    <SelectItem value="2">2 - Needs Improvement</SelectItem>
                    <SelectItem value="1">1 - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Individual Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium">Individual Metrics</h4>
                {SCORING_METRICS.map(metric => (
                  <div key={metric.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <Label className="text-sm font-medium">{metric.label}</Label>
                      {metric.description && (
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Select 
                        value={evaluationScores[metric.id]?.toString() || ""} 
                        onValueChange={(value) => updateScore(metric.id, parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select score (1-5)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="3">3 - Satisfactory</SelectItem>
                          <SelectItem value="2">2 - Needs Improvement</SelectItem>
                          <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <Label className="text-sm font-medium">Overall Comments</Label>
                <Textarea 
                  placeholder={`Provide detailed feedback for ${intern.name}...`}
                  value={overallComments}
                  onChange={(e) => setOverallComments(e.target.value)}
                  rows={5} 
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters required
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleEvaluationSubmit}
                disabled={isSubmittingEvaluation || !overallRating || overallComments.length < 10}
                className="w-full"
              >
                {isSubmittingEvaluation && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                <Save className="mr-2 h-4 w-4"/> Submit Evaluation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
