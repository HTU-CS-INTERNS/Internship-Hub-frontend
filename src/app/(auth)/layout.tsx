
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InternHub Authentication',
  description: 'Login or Register for InternHub',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      {children}
    </main>
  );
}
    
