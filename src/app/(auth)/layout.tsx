
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
    // The main background is white, specific colored panels are in page.tsx
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      {children}
    </main>
  );
}
    