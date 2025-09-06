
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Briefcase, Check, X, AlertTriangle, Loader2, User, Mail, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HODApprovalQueueItem } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getPendingPlacements, approvePlacement, rejectPlacement } from '@/lib/services/hod.service';

export default function ApprovePlacementsPage() {
  const { toast } = useToast();
  const [approvalQueue, setApprovalQueue] = React.useState<HODApprovalQueueItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessingAction, setIsProcessingAction] = React.useState(false);
  const [selectedItemForRejection, setSelectedItemForRejection] = React.useState<HODApprovalQueueItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const isMobile = useIsMobile();

  const fetchQueue = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const queue = await getPendingPlacements();
      setApprovalQueue(queue);
    } catch (error) {
      console.error("Failed to fetch approval queue:", error);
      toast({ title: "Error", description: "Could not load pending placements.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (item: HODApprovalQueueItem) => {
    setIsProcessingAction(true);
    try {
      await approvePlacement(item.studentId);
      toast({
        title: "Placement Approved!",
        description: `Internship for ${item.studentName} at ${item.companyName} has been approved. Supervisor ${item.supervisorEmail} will be notified (simulated).`,
      });
      fetchQueue(); // Refresh the list
    } catch (error) {
      console.error("Error approving placement:", error);
      toast({ title: "Approval Error", description: "Could not approve placement.", variant: "destructive" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedItemForRejection || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Rejection reason cannot be empty.", variant: "destructive" });
      return;
    }
    setIsProcessingAction(true);
    try {
      await rejectPlacement(selectedItemForRejection.studentId, rejectionReason);
      toast({
        title: "Placement Rejected",
        description: `Internship for ${selectedItemForRejection.studentName} at ${selectedItemForRejection.companyName} has been rejected. Student will be notified (simulated).`,
        variant: "destructive",
      });
      setSelectedItemForRejection(null);
      setRejectionReason('');
      fetchQueue(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting placement:", error);
      toast({ title: "Rejection Error", description: "Could not reject placement.", variant: "destructive" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const PlacementCardMobile: React.FC<{ item: HODApprovalQueueItem }> = ({ item }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden border-l-4 border-yellow-500">
      <CardHeader className="p-3 bg-yellow-500/10">
        <CardTitle className="text-base font-semibold text-yellow-700">{item.companyName}</CardTitle>
        <CardDescription className="text-xs text-yellow-600">Student: {item.studentName}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Supervisor:</span> {item.supervisorName}</div>
        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Email:</span> {item.supervisorEmail}</div>
        <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Submitted:</span> {format(parseISO(item.submissionDate), "PPp")}</div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs py-2 border-destructive text-destructive hover:bg-destructive/10" onClick={() => setSelectedItemForRejection(item)} disabled={isProcessingAction}>
          {isProcessingAction && selectedItemForRejection?.studentId === item.studentId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="mr-1.5 h-3.5 w-3.5" />} Reject
        </Button>
        <Button size="sm" className="flex-1 rounded-lg text-xs py-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item)} disabled={isProcessingAction}>
          {isProcessingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />} Approve
        </Button>
      </CardFooter>
    </Card>
  );

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
      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "")}>
        {!isMobile && (
        <CardHeader>
          <CardTitle className="font-headline text-lg">Pending Placements</CardTitle>
          <CardDescription>
            {approvalQueue.length > 0 
                ? `There are ${approvalQueue.length} placement(s) awaiting your review.`
                : "No internship placements are currently pending approval."
            }
          </CardDescription>
        </CardHeader>
        )}
        <CardContent className={cn(isMobile && approvalQueue.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {approvalQueue.length > 0 ? (
            isMobile ? (
                approvalQueue.map((item) => <PlacementCardMobile key={item.studentId} item={item} />)
            ) : (
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
                    <TableCell>{format(parseISO(item.submissionDate), "PPp")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md" onClick={() => setSelectedItemForRejection(item)} disabled={isProcessingAction}>
                        {isProcessingAction && selectedItemForRejection?.studentId === item.studentId ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />} Reject
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-md" onClick={() => handleApprove(item)} disabled={isProcessingAction}>
                        {isProcessingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />} Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
          ) : (
            <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <Check className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <p className="text-lg font-semibold">All Clear!</p>
              <p>No pending placements to review at this time.</p>
            </div>
          )}
        </CardContent>
        {!isMobile && approvalQueue.length > 0 && (
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
                <Button type="button" variant="outline" className="rounded-lg" onClick={() => setSelectedItemForRejection(null)} disabled={isProcessingAction}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={handleRejectSubmit} className="rounded-lg" disabled={!rejectionReason.trim() || isProcessingAction}>
                {isProcessingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
