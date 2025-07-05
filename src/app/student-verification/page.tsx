'use client';

import { StudentVerificationFlow } from '@/components/auth/student-verification-flow';

export default function StudentVerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Verification
          </h1>
          <p className="text-gray-600">
            Verify your account to access the Internship Hub
          </p>
        </div>
        <StudentVerificationFlow />
      </div>
    </div>
  );
}
