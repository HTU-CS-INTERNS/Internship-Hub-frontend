'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Eye, EyeOff } from 'lucide-react';

interface VerificationStep1Props {
  onOtpSent: (email: string) => void;
}

interface VerificationStep2Props {
  email: string;
  onVerificationComplete: () => void;
}

function VerificationStep1({ onOtpSent }: VerificationStep1Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.sendLecturerOtp(email);

      toast({
        title: 'OTP Sent',
        description: response.message,
      });

      // For development, show the OTP
      if (response.otp) {
        toast({
          title: 'Development Mode',
          description: `Your OTP is: ${response.otp}`,
          variant: 'default',
        });
      }

      onOtpSent(email);
    } catch (error) {
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
        <CardTitle>Lecturer Account Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label htmlFor="email">University Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your university email address to activate your lecturer account
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function VerificationStep2({ email, onVerificationComplete }: VerificationStep2Props) {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const response = await apiClient.verifyLecturerOtp({
        email,
        otp_code: otpCode,
        password,
        staff_id: staffId || undefined,
        phone_number: phoneNumber || undefined,
        office_location: officeLocation || undefined,
      });

      toast({
        title: 'Success',
        description: response.message,
      });

      onVerificationComplete();
    } catch (error) {
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
        <CardTitle>Complete Account Setup</CardTitle>
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

          <div>
            <Label htmlFor="staff-id">Staff ID (Optional)</Label>
            <Input
              id="staff-id"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g., LEC001"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., +233 123 456 789"
            />
          </div>

          <div>
            <Label htmlFor="office">Office Location (Optional)</Label>
            <Input
              id="office"
              value={officeLocation}
              onChange={(e) => setOfficeLocation(e.target.value)}
              placeholder="e.g., Engineering Block, Room 201"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Activating Account...' : 'Complete Account Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function LecturerVerificationFlow() {
  const [step, setStep] = useState<'email' | 'verification' | 'complete'>('email');
  const [email, setEmail] = useState('');

  const handleOtpSent = (sentEmail: string) => {
    setEmail(sentEmail);
    setStep('verification');
  };

  const handleVerificationComplete = () => {
    setStep('complete');
  };

  if (step === 'complete') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Activated!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Your lecturer account has been activated successfully.</p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            Continue to Login
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
          onVerificationComplete={handleVerificationComplete} 
        />
      )}
    </>
  );
}
