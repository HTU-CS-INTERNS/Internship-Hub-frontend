
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HODApprovalQueueItem, InternshipDetails } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ApprovePlacementsPage() {
  const { toast } = useToast();
  const [approvalQueue, setApprovalQueue] = React.useState<HODApprovalQueueItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItemForRejection, setSelectedItemForRejection] = React.useState<HODApprovalQueueItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const fetchQueue = React.useCallback(() => {
    setIsLoading(true);
    const queueRaw = typeof window !== "undefined" ? localStorage.getItem('hodCompanyApprovalQueue') : null;
    if (queueRaw) {
      const queue: HODApprovalQueueItem[] = JSON.parse(queueRaw);
      setApprovalQueue(queue.filter(item => item.status === 'PENDING_APPROVAL'));
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const updateStudentInternshipDetails = (studentId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    const studentDetailsKey = `userInternshipDetails_${studentId}`;
    const studentDetailsRaw = localStorage.getItem(studentDetailsKey);
    if (studentDetailsRaw) {
      let details: InternshipDetails = JSON.parse(studentDetailsRaw);
      details.status = status;
      if (reason) details.rejectionReason = reason;
      localStorage.setItem(studentDetailsKey, JSON.stringify(details));
    }
  };

  const removeFromHODQueue = (studentId: string) => {
    const queueRaw = localStorage.getItem('hodCompanyApprovalQueue');
    if (queueRaw) {
      let queue: HODApprovalQueueItem[] = JSON.parse(queueRaw);
      queue = queue.filter(item => item.studentId !== studentId || item.status !== 'PENDING_APPROVAL');
      localStorage.setItem('hodCompanyApprovalQueue', JSON.stringify(queue));
    }
  };

  const handleApprove = (item: HODApprovalQueueItem) => {
    updateStudentInternshipDetails(item.studentId, 'APPROVED');
    removeFromHODQueue(item.studentId);
    fetchQueue(); // Refresh the list
    toast({
      title: "Placement Approved!",
      description: `Internship for ${item.studentName} at ${item.companyName} has been approved. Supervisor ${item.supervisorEmail} will receive an invitation (simulated).`,
    });
    // Simulate sending email to supervisor
    console.log(`Simulating email to supervisor: ${item.supervisorEmail}`);
  };

  const handleRejectSubmit = () => {
    if (!selectedItemForRejection || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Rejection reason cannot be empty.", variant: "destructive" });
      return;
    }
    updateStudentInternshipDetails(selectedItemForRejection.studentId, 'REJECTED', rejectionReason);
    removeFromHODQueue(selectedItemForRejection.studentId);
    fetchQueue(); // Refresh the list
    toast({
      title: "Placement Rejected",
      description: `Internship for ${selectedItemForRejection.studentName} at ${selectedItemForRejection.companyName} has been rejected. Student will be notified (simulated).`,
      variant: "destructive",
    });
    setSelectedItemForRejection(null);
    setRejectionReason('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading approval queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Approve Internship Placements"
        description="Review and manage pending internship placement submissions from students in your department."
        icon={Briefcase}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/department-ops", label: "Department Ops" },
          { label: "Approve Placements" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Pending Placements</CardTitle>
          <CardDescription>
            {approvalQueue.length > 0 
                ? `There are ${approvalQueue.length} placement(s) awaiting your review.`
                : "No internship placements are currently pending approval."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {approvalQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvalQueue.map((item) => (
                  <TableRow key={item.studentId}>
                    <TableCell>{item.studentName}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>
                        <div>{item.supervisorName}</div>
                        <div className="text-xs text-muted-foreground">{item.supervisorEmail}</div>
                    </TableCell>
                    <TableCell>{format(parseISO(item.submissionDate), "PPP p")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedItemForRejection(item)}>
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item)}>
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground p-6">
              <Check className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <p className="text-lg font-semibold">All Clear!</p>
              <p>No pending placements to review at this time.</p>
            </div>
          )}
        </CardContent>
        {approvalQueue.length > 0 && (
            <CardFooter className="justify-end p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {approvalQueue.length} pending placements.</p>
            </CardFooter>
        )}
      </Card>

      {selectedItemForRejection && (
        <Dialog open={!!selectedItemForRejection} onOpenChange={(open) => { if(!open) setSelectedItemForRejection(null); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reject Internship Placement</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting the placement for {selectedItemForRejection.studentName} at {selectedItemForRejection.companyName}.
                The student will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rejection-reason" className="text-right col-span-1">
                  Reason
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="col-span-3 rounded-lg"
                  placeholder="e.g., Company not accredited, concerns about supervision..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={handleRejectSubmit} className="rounded-lg" disabled={!rejectionReason.trim()}>
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
