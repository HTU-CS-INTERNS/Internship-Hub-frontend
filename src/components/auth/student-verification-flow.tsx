
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface VerificationStep1Props {
  onOtpSent: (email: string, otp: string) => void;
}

interface VerificationStep2Props {
  email: string;
  otp: string;
  onVerificationComplete: () => void;
}

function VerificationStep1({ onOtpSent }: VerificationStep1Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(`[VerificationStep1] handleSendOtp called for email: ${email}`);

    try {
      const response = await fetch('/api/auth/send-student-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      console.log(`[VerificationStep1] API response status: ${response.status}`);

      const data = await response.json();
      console.log(`[VerificationStep1] API response data:`, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast({
        title: 'OTP Sent',
        description: data.message,
      });

      if (data.otp) {
        toast({
          title: 'Development Mode',
          description: `Your OTP is: ${data.otp}`,
          variant: 'default',
        });
        onOtpSent(email, data.otp);
      } else {
        throw new Error("OTP was not returned from the server.");
      }
    } catch (error) {
      console.error('[VerificationStep1] CATCH BLOCK: Error sending OTP.', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Student Account Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label htmlFor="email">School Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your school email address to receive verification code.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : 'Send Verification Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function VerificationStep2({ email, otp: otpFromStep1, onVerificationComplete }: VerificationStep2Props) {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[VerificationStep2] handleVerification called for email: ${email}`);
    
    if (otpCode !== otpFromStep1) {
      toast({
        title: 'Error',
        description: 'The OTP you entered is incorrect.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-student-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log(`[VerificationStep2] API response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`[VerificationStep2] API response data:`, data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate account');
      }

      toast({
        title: 'Success',
        description: data.message,
      });

      onVerificationComplete();
    } catch (error) {
      console.error('[VerificationStep2] CATCH BLOCK: Error verifying account.', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Verification failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Registration</CardTitle>
        <CardDescription>Enter the code sent to your email and set your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <Label htmlFor="email-display">Email</Label>
            <Input
              id="email-display"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Create Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function StudentVerificationFlow() {
  const [step, setStep] = useState<'email' | 'verification' | 'complete'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleOtpSent = (sentEmail: string, sentOtp: string) => {
    setEmail(sentEmail);
    setOtp(sentOtp);
    setStep('verification');
  };

  const handleVerificationComplete = () => {
    setStep('complete');
  };

  if (step === 'complete') {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Registration Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="mb-4">Your account has been created successfully.</p>
          <Button 
            asChild
            className="w-full"
          >
            <Link href="/login">Continue to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {step === 'email' && <VerificationStep1 onOtpSent={handleOtpSent} />}
      {step === 'verification' && (
        <VerificationStep2 
          email={email} 
          otp={otp}
          onVerificationComplete={handleVerificationComplete} 
        />
      )}
    </>
  );
}
