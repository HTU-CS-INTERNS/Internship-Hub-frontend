'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Star,
  Users,
  BookOpen,
  Code
} from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/use-realtime-metrics';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';

interface SkillProgress {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  currentLevel: number;
  targetLevel: number;
  progress: number;
  lastAssessed: string;
  color: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
  progress: number;
  category: string;
}

interface ActivityData {
  date: string;
  tasksCompleted: number;
  hoursWorked: number;
  reportsSubmitted: number;
  skillsImproved: number;
}

export default function StudentProgressPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  // Get realtime metrics
  const { data: metricsData } = useRealtimeMetrics({
    userId: user?.id || 1, 
    role: 'student',
    refreshInterval: 30000
  });

  // Fetch progress data from API
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all progress-related data
        const [skillsData, milestonesData, activityDataResult] = await Promise.all([
          StudentApiService.getSkills(),
          StudentApiService.getMilestones(),
          StudentApiService.getActivityData(selectedPeriod)
        ]);

        setSkills(skillsData || []);
        setMilestones(milestonesData || []);
        setActivityData(activityDataResult || []);
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError('Failed to load progress data');
        setSkills([]);
        setMilestones([]);
        setActivityData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [user, selectedPeriod]);
  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-gray-500" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-500" />;
    }
  };

  const getMilestoneBadge = (status: Milestone['status']) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary', 
      upcoming: 'outline',
      overdue: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getSkillCategoryIcon = (category: SkillProgress['category']) => {
    switch (category) {
      case 'technical':
        return <Code className="h-4 w-4" />;
      case 'soft':
        return <Users className="h-4 w-4" />;
      case 'domain':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Calculate summary metrics
  const totalSkillProgress = skills.length > 0 ? Math.round(skills.reduce((acc, skill) => acc + skill.progress, 0) / skills.length) : 0;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
  
  const recentActivityTotal = activityData.slice(-7).reduce((acc, day) => ({
    tasks: acc.tasks + day.tasksCompleted,
    hours: acc.hours + day.hoursWorked,
    reports: acc.reports + day.reportsSubmitted
  }), { tasks: 0, hours: 0, reports: 0 });

  const skillsByCategory = {
    technical: skills.filter(s => s.category === 'technical'),
    soft: skills.filter(s => s.category === 'soft'),
    domain: skills.filter(s => s.category === 'domain')
  };

  const chartData = activityData.slice(-14).map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    tasks: day.tasksCompleted,
    hours: day.hoursWorked
  }));

  const skillChartData = skills.map(skill => ({
    name: skill.name,
    current: skill.currentLevel,
    target: skill.targetLevel,
    color: skill.color
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your internship progress and skill development</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSkillProgress}%</div>
            <p className="text-xs text-muted-foreground">Skill development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMilestones}/{milestones.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivityTotal.tasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Work Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivityTotal.hours}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skill Development Progress
              </CardTitle>
              <CardDescription>
                Track your progress across technical, soft, and domain-specific skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={skillChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#3B82F6" name="Current Level" />
                    <Bar dataKey="target" fill="#E5E7EB" name="Target Level" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Skills by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getSkillCategoryIcon(category as SkillProgress['category'])}
                    {category.charAt(0).toUpperCase() + category.slice(1)} Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {skill.currentLevel}%
                        </span>
                      </div>
                      <Progress value={skill.currentLevel} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Target: {skill.targetLevel}%</span>
                        <span>Last assessed: {format(new Date(skill.lastAssessed), 'MMM dd')}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Internship Milestones
              </CardTitle>
              <CardDescription>
                Key objectives and achievements throughout your internship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getMilestoneIcon(milestone.status)}
                        <div>
                          <h3 className="font-medium">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      {getMilestoneBadge(milestone.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Category: {milestone.category}</span>
                        <span>
                          {milestone.completedDate 
                            ? `Completed: ${format(new Date(milestone.completedDate), 'MMM dd, yyyy')}`
                            : `Due: ${format(new Date(milestone.targetDate), 'MMM dd, yyyy')}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Daily Activity
              </CardTitle>
              <CardDescription>
                Your daily work patterns and productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="tasks" stroke="#3B82F6" name="Tasks Completed" />
                    <Line type="monotone" dataKey="hours" stroke="#10B981" name="Hours Worked" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivityTotal.tasks}</div>
                <p className="text-xs text-muted-foreground">Completed this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivityTotal.hours}</div>
                <p className="text-xs text-muted-foreground">Worked this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivityTotal.reports}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your internship performance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed performance analytics and insights will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
