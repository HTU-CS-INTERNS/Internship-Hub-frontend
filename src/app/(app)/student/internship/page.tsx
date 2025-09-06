'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, MapPin, User, Calendar, Clock, Target, Award, FileText, Phone, Mail, AlertCircle } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/use-realtime-metrics';
import { useAuth } from '@/contexts/auth-context';
import { format, differenceInDays, parseISO } from 'date-fns';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';

interface InternshipDetails {
  id: string;
  status: 'active' | 'pending' | 'completed' | 'on_hold';
  company: {
    name: string;
    address: string;
    industry: string;
    website?: string;
  };
  supervisor: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  description: string;
  objectives: string[];
  requirements: string[];
  progress: {
    completed: number;
    total: number;
    currentWeek: number;
    totalWeeks: number;
  };
  evaluation: {
    overallScore: number;
    categories: {
      name: string;
      score: number;
      maxScore: number;
    }[];
  };
}

export default function StudentInternshipPage() {
  const { user } = useAuth();
  const [internshipData, setInternshipData] = useState<InternshipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get realtime metrics
  const { metrics: metricsData } = useRealtimeMetrics({
    userId: user?.id ? String(user.id) : undefined,
    role: 'student',
    refreshInterval: 30000
  });

  // Fetch internship data from API
  useEffect(() => {
    const fetchInternshipData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await StudentApiService.getInternshipDetails();
        setInternshipData(data);
      } catch (err) {
        console.error('Failed to fetch internship data:', err);
        setError('Failed to load internship details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternshipData();
  }, [user]);

  const getStatusBadge = (status: InternshipDetails['status']) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Active' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      completed: { variant: 'outline' as const, label: 'Completed' },
      on_hold: { variant: 'destructive' as const, label: 'On Hold' }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateDaysRemaining = (endDate: string) => {
    return differenceInDays(parseISO(endDate), new Date());
  };

  const calculateProgress = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading internship details...</div>;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to Load Internship Details"
        description={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!internshipData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Internship</h1>
            <p className="text-muted-foreground">Track your internship progress and details</p>
          </div>
        </div>
        
        <EmptyState
          icon={Building}
          title="No Active Internship"
          description="You don't have an active internship at the moment. Apply for an internship to get started."
          actionLabel="Apply for Internship"
          onAction={() => window.location.href = '/student/internship/apply'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Internship</h1>
          <p className="text-muted-foreground">Track your internship progress and details</p>
        </div>
        {getStatusBadge(internshipData.status)}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Days Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateDaysRemaining(internshipData.endDate)}</div>
            <p className="text-xs text-muted-foreground">Until completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateProgress(internshipData.progress.currentWeek, internshipData.progress.totalWeeks)}%
            </div>
            <p className="text-xs text-muted-foreground">Week {internshipData.progress.currentWeek} of {internshipData.progress.totalWeeks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internshipData.evaluation.overallScore}%</div>
            <p className="text-xs text-muted-foreground">Current evaluation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Tasks Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internshipData.progress.completed}/{internshipData.progress.total}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{internshipData.company.name}</h3>
                  <p className="text-sm text-muted-foreground">{internshipData.company.industry}</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm">{internshipData.company.address}</p>
                  </div>
                </div>
                
                {internshipData.company.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={internshipData.company.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Supervisor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{internshipData.supervisor.name}</h3>
                  <p className="text-sm text-muted-foreground">{internshipData.supervisor.title}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${internshipData.supervisor.email}`} className="text-sm hover:underline">
                      {internshipData.supervisor.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${internshipData.supervisor.phone}`} className="text-sm hover:underline">
                      {internshipData.supervisor.phone}
                    </a>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Internship Details */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Details</CardTitle>
              <CardDescription>
                Duration: {format(parseISO(internshipData.startDate), 'MMM dd, yyyy')} - {format(parseISO(internshipData.endDate), 'MMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{internshipData.description}</p>
            </CardContent>
          </Card>

          {/* Objectives and Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {internshipData.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {internshipData.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>Monitor your internship milestones and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {calculateProgress(internshipData.progress.currentWeek, internshipData.progress.totalWeeks)}%
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(internshipData.progress.currentWeek, internshipData.progress.totalWeeks)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {internshipData.progress.completed}/{internshipData.progress.total}
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(internshipData.progress.completed, internshipData.progress.total)} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{internshipData.progress.currentWeek}</div>
                  <div className="text-sm text-muted-foreground">Current Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{internshipData.progress.completed}</div>
                  <div className="text-sm text-muted-foreground">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{calculateDaysRemaining(internshipData.endDate)}</div>
                  <div className="text-sm text-muted-foreground">Days Left</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Evaluation</CardTitle>
              <CardDescription>Current evaluation scores from your supervisor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {internshipData.evaluation.overallScore}%
                </div>
                <p className="text-muted-foreground">Overall Performance Score</p>
              </div>

              <div className="space-y-4">
                {internshipData.evaluation.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.score}/{category.maxScore}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(category.score, category.maxScore)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Internship Documents</CardTitle>
              <CardDescription>Important documents and forms related to your internship</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Documents Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  This section will contain internship agreements, evaluations, and certificates.
                </p>
                <Button variant="outline">Upload Document</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
