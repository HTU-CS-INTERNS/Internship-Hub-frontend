
import { RegistrationForm } from '@/components/auth/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <Card className="shadow-xl rounded-xl">
      <CardHeader className="space-y-1 text-center p-6">
        <CardTitle className="text-3xl font-headline">Create Account</CardTitle>
        <CardDescription className="font-body text-base">
          Start your internship journey with InternshipTrack.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <RegistrationForm />
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    