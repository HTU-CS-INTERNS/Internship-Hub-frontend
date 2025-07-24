import { SupervisorVerificationFlow } from '@/components/auth/supervisor-verification-flow';

export default function SupervisorVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Supervisor Account Verification</h1>
          <p className="text-gray-600 mt-2">
            Activate your company supervisor account to start monitoring interns
          </p>
        </div>
        <SupervisorVerificationFlow />
      </div>
    </div>
  );
}
