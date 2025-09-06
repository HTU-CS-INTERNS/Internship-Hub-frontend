import { LecturerVerificationFlow } from '@/components/auth/lecturer-verification-flow';

export default function LecturerVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Lecturer Account Verification</h1>
          <p className="text-gray-600 mt-2">
            Activate your lecturer account to start supervising students
          </p>
        </div>
        <LecturerVerificationFlow />
      </div>
    </div>
  );
}
