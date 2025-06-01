
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card className="shadow-xl rounded-xl">
      <CardHeader className="space-y-1 text-center p-6">
        <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
        <CardDescription className="font-body text-base">
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
