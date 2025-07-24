'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileCheck, Search, Filter, Eye, Check, X, Clock, RotateCcw, Download, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from '@/components/shared/empty-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { LecturerApiService } from '@/lib/services/lecturerApi';
import { useToast } from '@/hooks/use-toast';

interface StudentReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'final';
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  priority: 'low' | 'medium' | 'high';
  feedback?: string;
  rating?: number;
  attachments?: string[];
  dueDate: string;
}

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300',
  revision_requested: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

export default function LecturerReportsPage() {
  const [reports, setReports] = React.useState<StudentReport[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  
  // Dialog states
  const [selectedReport, setSelectedReport] = React.useState<StudentReport | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [rating, setRating] = React.useState<number>(0);
  const [rejectReason, setRejectReason] = React.useState('');
  const [revisionFeedback, setRevisionFeedback] = React.useState('');
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = React.useState(false);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await LecturerApiService.getAllReports();
      
      if (data && Array.isArray(data)) {
        setReports(data.map((report: any) => ({
          id: report.id,
          title: report.title || 'Untitled Report',
          type: report.type || 'daily',
          studentId: report.studentId || report.student?.id,
          studentName: report.studentName || report.student?.name || 'Unknown Student',
          studentEmail: report.studentEmail || report.student?.email || 'No email',
          studentAvatar: report.studentAvatar || report.student?.avatar,
          content: report.content || 'No content provided',
          submittedAt: report.submittedAt || report.createdAt || new Date().toISOString(),
          status: report.status || 'pending',
          priority: report.priority || 'medium',
          feedback: report.feedback,
          rating: report.rating,
          attachments: report.attachments || [],
          dueDate: report.dueDate || new Date().toISOString()
        })));
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReport = async () => {
    if (!selectedReport) return;
    
    try {
      setProcessingId(selectedReport.id);
      await LecturerApiService.approveReport(selectedReport.id, feedback, rating);
      
      toast({
        title: "Success",
        description: "Report approved successfully"
      });
      setShowApproveDialog(false);
      setFeedback('');
      setRating(0);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to approve report:', error);
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectReport = async () => {
    if (!selectedReport || !rejectReason.trim()) return;
    
    try {
      setProcessingId(selectedReport.id);
      await LecturerApiService.rejectReport(selectedReport.id, rejectReason);
      
      toast({
        title: "Success",
        description: "Report rejected"
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to reject report:', error);
      toast({
        title: "Error",
        description: "Failed to reject report",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedReport || !revisionFeedback.trim()) return;
    
    try {
      setProcessingId(selectedReport.id);
      await LecturerApiService.requestReportRevision(selectedReport.id, revisionFeedback);
      
      toast({
        title: "Success",
        description: "Revision requested"
      });
      setShowRevisionDialog(false);
      setRevisionFeedback('');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to request revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const ReportCardMobile: React.FC<{ report: StudentReport }> = ({ report }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="p-3 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={report.studentAvatar} alt={report.studentName} />
              <AvatarFallback className="text-xs">{getInitials(report.studentName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
              <CardDescription className="text-xs">{report.studentName}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", statusColors[report.status])}>
            {report.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="secondary" className="text-xs">{report.type}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Priority:</span>
          <Badge variant="outline" className={cn("text-xs", priorityColors[report.priority])}>
            {report.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Submitted:</span>
          <span>{format(new Date(report.submittedAt), 'MMM dd, yyyy')}</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            setSelectedReport(report);
            setShowDetailDialog(true);
          }}
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
        {report.status === 'pending' && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setSelectedReport(report);
              setShowApproveDialog(true);
            }}
          >
            <Check className="mr-1 h-3 w-3" />
            Review
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Student Reports"
        description="Review and provide feedback on student internship reports."
        icon={FileCheck}
        breadcrumbs={[
          { href: "/lecturer/dashboard", label: "Dashboard" },
          { label: "Reports" }
        ]}
        actions={
          <Button onClick={fetchReports} variant="outline">
            Refresh
          </Button>
        }
      />

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="revision_requested">Revision Requested</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Student Reports</CardTitle>
          <CardDescription>
            {filteredReports.length > 0 
              ? `${filteredReports.length} report(s) found`
              : searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                ? "No reports match your current filters."
                : "No reports available."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
          {filteredReports.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title={searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' ? "No Reports Found" : "No Reports Available"}
              description={
                searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                  ? "No reports match your current search criteria."
                  : "Students haven't submitted any reports yet."
              }
              actionLabel={
                (searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') ? "Clear Filters" : undefined
              }
              onAction={
                (searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all')
                  ? () => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setPriorityFilter('all');
                    }
                  : undefined
              }
            />
          ) : isMobile ? (
            <div className="p-4 space-y-4">
              {filteredReports.map(report => <ReportCardMobile key={report.id} report={report} />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {report.content.substring(0, 50)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.studentAvatar} alt={report.studentName} />
                          <AvatarFallback className="text-xs">{getInitials(report.studentName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{report.studentName}</p>
                          <p className="text-xs text-muted-foreground">{report.studentEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", priorityColors[report.priority])}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[report.status])}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(report.submittedAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowApproveDialog(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowRevisionDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowRejectDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              {selectedReport?.title} by {selectedReport?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Student:</strong> {selectedReport.studentName}
                </div>
                <div>
                  <strong>Type:</strong> {selectedReport.type}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge variant="outline" className={cn("ml-2 text-xs", statusColors[selectedReport.status])}>
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <strong>Submitted:</strong> {format(new Date(selectedReport.submittedAt), 'PPp')}
                </div>
              </div>
              <div>
                <strong>Content:</strong>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                  {selectedReport.content}
                </div>
              </div>
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <div className="mt-2 space-y-1">
                    {selectedReport.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedReport.feedback && (
                <div>
                  <strong>Previous Feedback:</strong>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    {selectedReport.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            {selectedReport?.status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowRevisionDialog(true);
                  }}
                  variant="outline"
                  className="text-blue-600"
                >
                  Request Revision
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowRejectDialog(true);
                  }}
                  variant="destructive"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowApproveDialog(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Report</DialogTitle>
            <DialogDescription>
              Provide feedback and rating for this report submission.
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
              onClick={handleApproveReport}
              disabled={!!processingId}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this report.
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
              onClick={handleRejectReport}
              disabled={!rejectReason.trim() || !!processingId}
            >
              {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Provide specific feedback for the student to revise their report.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Provide detailed feedback for revision..."
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestRevision}
              disabled={!revisionFeedback.trim() || !!processingId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}