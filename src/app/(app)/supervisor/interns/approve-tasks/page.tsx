
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { CheckSquare, AlertTriangle, Loader2, Eye, Check, X, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmptyState from '@/components/shared/empty-state';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { SupervisorApiService } from '@/lib/services/supervisorApi';
import { toast } from 'sonner';

interface PendingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  internId: string;
  internName: string;
  outcomes?: string;
  submittedAt: string;
  attachments?: string[];
}

const taskStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  submitted: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  approved: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  rejected: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

export default function ApproveTasksPage() {
  const [pendingTasks, setPendingTasks] = React.useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [selectedTask, setSelectedTask] = React.useState<PendingTask | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [rating, setRating] = React.useState<number>(0);
  const [rejectReason, setRejectReason] = React.useState('');
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  const fetchPendingTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SupervisorApiService.getPendingTasks();
      
      if (data && Array.isArray(data)) {
        setPendingTasks(data.map((task: any) => ({
          id: task.id,
          title: task.title || 'Untitled Task',
          description: task.description || 'No description provided',
          dueDate: task.dueDate || new Date().toISOString(),
          priority: task.priority || 'medium',
          status: task.status || 'submitted',
          internId: task.internId || task.student?.id,
          internName: task.internName || task.student?.name || 'Unknown Intern',
          outcomes: task.outcomes || task.submission?.outcomes,
          submittedAt: task.submittedAt || task.submission?.submittedAt || new Date().toISOString(),
          attachments: task.attachments || task.submission?.attachments || []
        })));
      } else {
        setPendingTasks([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
      toast.error('Failed to load pending tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingTasks();
  }, [fetchPendingTasks]);

  const handleApproveTask = async () => {
    if (!selectedTask) return;
    
    try {
      setProcessingId(selectedTask.id);
      await SupervisorApiService.approveTask(selectedTask.id, feedback, rating);
      
      toast.success('Task approved successfully');
      setShowApproveDialog(false);
      setFeedback('');
      setRating(0);
      setSelectedTask(null);
      fetchPendingTasks();
    } catch (error) {
      console.error('Failed to approve task:', error);
      toast.error('Failed to approve task');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTask = async () => {
    if (!selectedTask || !rejectReason.trim()) return;
    
    try {
      setProcessingId(selectedTask.id);
      await SupervisorApiService.rejectTask(selectedTask.id, rejectReason);
      
      toast.success('Task rejected');
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedTask(null);
      fetchPendingTasks();
    } catch (error) {
      console.error('Failed to reject task:', error);
      toast.error('Failed to reject task');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTasks = pendingTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.internName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading tasks for approval...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Approve Intern Tasks"
        description="Review and approve/reject tasks submitted by your interns."
        icon={CheckSquare}
        breadcrumbs={[
            { href: "/supervisor/dashboard", label: "Dashboard" },
            { href: "/supervisor/interns", label: "My Interns" },
            { label: "Approve Tasks" }
        ]}
      />

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title, intern name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Pending Task Submissions</CardTitle>
          <CardDescription>
            {filteredTasks.length > 0 
                ? `You have ${filteredTasks.length} task(s) awaiting your review.` 
                : searchTerm || priorityFilter !== 'all'
                  ? "No tasks match your current filters."
                  : "No tasks are currently pending your approval."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <Card key={task.id} className="bg-muted/30 shadow-sm rounded-lg">
                  <CardHeader className="pb-3">
                     <div className="flex justify-between items-start">
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{task.title}</h4>
                                <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">By: {task.internName}</p>
                              <p className="text-xs text-muted-foreground">
                                Due: {format(new Date(task.dueDate), "PPP")} | 
                                Submitted: {format(new Date(task.submittedAt), "PPp")}
                              </p>
                          </div>
                          <Badge variant="outline" className={cn("text-xs shrink-0", taskStatusColors[task.status])}>
                            {task.status}
                          </Badge>
                      </div>
                  </CardHeader>
                   <CardContent className="text-sm">
                      <p className="mb-2"><strong>Description:</strong> {task.description}</p>
                      {task.outcomes && (
                        <p><strong>Outcomes:</strong> {task.outcomes}</p>
                      )}
                      {task.attachments && task.attachments.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {task.attachments.length} attachment(s)
                        </p>
                      )}
                   </CardContent>
                  <CardFooter className="justify-end gap-2 pt-2">
                    <Dialog open={showRejectDialog && selectedTask?.id === task.id} onOpenChange={setShowRejectDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => setSelectedTask(task)}
                          disabled={!!processingId}
                        >
                          {processingId === task.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="mr-1 h-4 w-4" />} 
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Task</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting this task. This will help the intern understand what needs improvement.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleRejectTask}
                            disabled={!rejectReason.trim() || !!processingId}
                          >
                            {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Reject Task
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showApproveDialog && selectedTask?.id === task.id} onOpenChange={setShowApproveDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => setSelectedTask(task)}
                          className="bg-green-600 hover:bg-green-700 text-white" 
                          disabled={!!processingId}
                        >
                          {processingId === task.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4" />} 
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Task</DialogTitle>
                          <DialogDescription>
                            Provide feedback and rating for this task submission.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Feedback (Optional)</label>
                            <Textarea
                              placeholder="Provide constructive feedback..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Rating (1-5)</label>
                            <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
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
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleApproveTask}
                            disabled={!!processingId}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Approve Task
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                     <Link href={`/supervisor/interns/details/${task.internId}?taskId=${task.id}`} passHref> 
                         <Button variant="ghost" size="sm" disabled={!!processingId}>
                           <Eye className="mr-1 h-4 w-4"/>View Details
                         </Button>
                     </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <EmptyState
               icon={CheckSquare}
               title={searchTerm || priorityFilter !== 'all' ? "No Tasks Found" : "All Caught Up!"}
               description={
                 searchTerm || priorityFilter !== 'all'
                   ? "No tasks match your current search criteria."
                   : "No tasks require your attention at this moment."
               }
               onAction={
                 (searchTerm || priorityFilter !== 'all') ? () => { setSearchTerm(''); setPriorityFilter('all'); } : undefined
               }
               actionLabel={
                 (searchTerm || priorityFilter !== 'all') ? "Clear Filters" : undefined
               }
             />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

