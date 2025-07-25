'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  MapPin, 
  User, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Edit,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { StudentApiService } from '@/lib/services/studentApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface InternshipSubmission {
  id?: string;
  company_name: string;
  company_address: string;
  supervisor_name: string;
  supervisor_email: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

const InternshipSubmissionForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [submission, setSubmission] = useState<InternshipSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    supervisor_name: '',
    supervisor_email: '',
    start_date: '',
    end_date: '',
    location: ''
  });

  // Fetch existing submission on component mount
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setIsLoading(true);
        const existingSubmission = await StudentApiService.getMyInternshipSubmission();
        
        if (existingSubmission) {
          setSubmission(existingSubmission);
          // If there's an existing submission, populate the form
          setFormData({
            company_name: existingSubmission.company_name || '',
            company_address: existingSubmission.company_address || '',
            supervisor_name: existingSubmission.supervisor_name || '',
            supervisor_email: existingSubmission.supervisor_email || '',
            start_date: existingSubmission.start_date ? existingSubmission.start_date.split('T')[0] : '',
            end_date: existingSubmission.end_date ? existingSubmission.end_date.split('T')[0] : '',
            location: existingSubmission.location || ''
          });
          
          // Only allow editing if rejected or no submission exists
          setIsEditing(existingSubmission.status === 'REJECTED' || !existingSubmission.status);
        } else {
          // No existing submission, enable editing
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Failed to fetch internship submission:', error);
        // If no submission exists, enable editing
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubmission();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit an internship application.',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['company_name', 'company_address', 'supervisor_name', 'supervisor_email', 'start_date', 'end_date', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData].trim());
    
    if (missingFields.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.supervisor_email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address for the supervisor.',
        variant: 'destructive'
      });
      return;
    }

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    
    if (startDate <= today) {
      toast({
        title: 'Validation Error',
        description: 'Start date must be in the future.',
        variant: 'destructive'
      });
      return;
    }
    
    if (endDate <= startDate) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await StudentApiService.submitInternshipForApproval(formData);
      
      if (result) {
        setSubmission({
          ...formData,
          status: 'PENDING_APPROVAL',
          submitted_at: new Date().toISOString()
        });
        setIsEditing(false);
        
        toast({
          title: 'Application Submitted Successfully!',
          description: 'Your internship application has been submitted for admin approval. You will be notified once it\'s reviewed.',
        });
      }
    } catch (error: any) {
      console.error('Failed to submit internship application:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit internship application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form data to original submission data
    if (submission) {
      setFormData({
        company_name: submission.company_name || '',
        company_address: submission.company_address || '',
        supervisor_name: submission.supervisor_name || '',
        supervisor_email: submission.supervisor_email || '',
        start_date: submission.start_date ? submission.start_date.split('T')[0] : '',
        end_date: submission.end_date ? submission.end_date.split('T')[0] : '',
        location: submission.location || ''
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading internship status...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Card */}
      {submission && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Internship Application Status
              </CardTitle>
              {getStatusBadge(submission.status)}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="font-medium">{submission.company_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                <p className="font-medium">{submission.supervisor_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {submission.start_date && submission.end_date && (
                    `${format(new Date(submission.start_date), 'MMM dd, yyyy')} - ${format(new Date(submission.end_date), 'MMM dd, yyyy')}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="font-medium">
                  {submission.submitted_at && format(new Date(submission.submitted_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            {submission.status === 'REJECTED' && submission.rejection_reason && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Rejection Reason:</strong> {submission.rejection_reason}
                </AlertDescription>
              </Alert>
            )}
            
            {submission.status === 'REJECTED' && (
              <div className="mt-4 flex gap-2">
                <Button onClick={handleEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Resubmit Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {submission?.status === 'REJECTED' ? 'Resubmit Internship Application' : 'Submit Internship Application'}
            </CardTitle>
            <CardDescription>
              Fill in the details of your internship placement. This will be sent to the admin for approval.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="e.g., Tech Solutions Ltd"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Accra, Ghana"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_address">Company Address *</Label>
                  <Textarea
                    id="company_address"
                    value={formData.company_address}
                    onChange={(e) => handleInputChange('company_address', e.target.value)}
                    placeholder="Full company address"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Supervisor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Supervisor Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supervisor_name">Supervisor Name *</Label>
                    <Input
                      id="supervisor_name"
                      value={formData.supervisor_name}
                      onChange={(e) => handleInputChange('supervisor_name', e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supervisor_email">Supervisor Email *</Label>
                    <Input
                      id="supervisor_email"
                      type="email"
                      value={formData.supervisor_email}
                      onChange={(e) => handleInputChange('supervisor_email', e.target.value)}
                      placeholder="supervisor@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Internship Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Internship Duration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {submission?.status === 'REJECTED' ? 'Resubmit Application' : 'Submit Application'}
                    </>
                  )}
                </Button>
                
                {submission && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!isEditing && submission?.status === 'PENDING_APPROVAL' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your internship application is currently under review. You will be notified via email once the admin makes a decision. 
            Please be patient as this process may take a few business days.
          </AlertDescription>
        </Alert>
      )}
      
      {!isEditing && submission?.status === 'APPROVED' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Congratulations! Your internship application has been approved. You can now proceed with your internship activities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InternshipSubmissionForm;
