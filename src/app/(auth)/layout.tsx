
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InternshipTrack Authentication',
  description: 'Login or Register for InternshipTrack',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {children}
    </main>
  );
}
    