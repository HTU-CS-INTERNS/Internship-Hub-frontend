'use client';

import PageHeader from '@/components/shared/page-header';
import InternshipSubmissionForm from '@/components/student/InternshipSubmissionForm';
import { Building } from 'lucide-react';

export default function StudentInternshipSubmitPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Internship Application"
        description="Submit your internship details for admin approval"
        icon={Building}
      />
      
      <InternshipSubmissionForm />
    </div>
  );
}
