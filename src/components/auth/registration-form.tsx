
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FACULTIES, DEPARTMENTS } from '@/lib/constants';
import type { UserProfileData } from '@/types';
import { sendOtp } from '@/ai/flows/send-otp-flow';
import { Checkbox } from '@/components/ui/checkbox'; 
import { Label } from '@/components/ui/label'; 
import api from '@/lib/api';

const registrationStep1Schema = z.object({
  student_id_number: z.string().min(3, { message: 'School ID must be at least 3 characters.' }).max(20, { message: 'School ID too long.'}),
  email: z.string().email({ message: 'Please enter a valid school email address.' })
    .refine(email => email.endsWith('@htu.edu.gh'), {
      message: 'Email must be a valid @htu.edu.gh address.'
    }),
});

const registrationStep2Schema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

const registrationStep3Schema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.'})
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.'})
    .regex(/[0-9]/, { message: 'Password must contain at least one number.'})
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character.'}),
  confirmPassword: z.string().min(8, { message: 'Please confirm your password.' }),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the Terms and Conditions to proceed."
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type RegistrationStep1Values = z.infer<typeof registrationStep1Schema>;
type RegistrationStep2Values = z.infer<typeof registrationStep2Schema>;
type RegistrationStep3Values = z.infer<typeof registrationStep3Schema>;

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [verifiedSchoolEmail, setVerifiedSchoolEmail] = React.useState('');
  const [userDataFromDB, setUserDataFromDB] = React.useState<{first_name: string, last_name: string, faculty_id?: number, department_id?: number} | null>(null);
  const [generatedOtpForVerification, setGeneratedOtpForVerification] = React.useState<string | null>(null);

  const step1Form = useForm<RegistrationStep1Values>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: { student_id_number: '', email: '' },
  });

  const step2Form = useForm<RegistrationStep2Values>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: { otp: '' },
  });

  const step3Form = useForm<RegistrationStep3Values>({
    resolver: zodResolver(registrationStep3Schema),
    defaultValues: { password: '', confirmPassword: '', termsAccepted: false },
  });

  async function handleStep1Submit(values: RegistrationStep1Values) {
    setIsLoading(true);
    try {
        const studentData = await api<{first_name: string, last_name: string, faculty_id?: number, department_id?: number}>('/auth/verify-student', {
            method: 'POST',
            body: values,
        });

        setUserDataFromDB(studentData);
        setVerifiedSchoolEmail(values.email);

        const otpResponse = await sendOtp({ email: values.email });
        setGeneratedOtpForVerification(otpResponse.otp);
        toast({
            title: 'Student Record Found!',
            description: `An OTP is being sent to ${values.email} to verify your identity. (Simulated OTP: ${otpResponse.otp})`,
            duration: 7000,
        });
        setStep(2);
    } catch (error: any) {
        toast({
            title: 'Verification Failed',
            description: error.message || 'Could not verify student details. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  async function handleStep2Submit(values: RegistrationStep2Values) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    if (values.otp !== generatedOtpForVerification) {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      step2Form.setError("otp", { type: "manual", message: "Invalid OTP."});
      setIsLoading(false);
      return;
    }

    toast({
      title: 'OTP Verified!',
      description: `Welcome, ${userDataFromDB?.first_name}! Please set a secure password for your InternHub account.`,
      variant: 'default'
    });
    setStep(3);
    setIsLoading(false);
  }

  async function handleStep3Submit(values: RegistrationStep3Values) {
    setIsLoading(true);
    
    const activationData = {
        email: verifiedSchoolEmail,
        password: values.password,
    };

    try {
        const response = await api<{ user: UserProfileData; session: { access_token: string; } }>('/auth/signup', {
            method: 'POST',
            body: activationData,
        });

        const { user, session } = response;
        
        if (typeof window !== "undefined") {
            localStorage.setItem('authToken', session.access_token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userName', `${user.first_name} ${user.last_name}`);
            localStorage.setItem('userEmail', user.email);
        }
        
        toast({
          title: "Account Activated!",
          description: `Welcome, ${user.first_name}! Your InternHub account is ready. Please complete your profile.`,
          variant: "default",
        });

        router.push('/profile');
    } catch (error: any) {
         toast({
            title: 'Activation Failed',
            description: error.message || 'An unknown error occurred. Please try again.',
            variant: 'destructive'
        });
    } finally {
        setIsLoading(false);
    }
  }

  const facultyName = userDataFromDB?.faculty_id ? FACULTIES.find(f => f.id === userDataFromDB.faculty_id)?.name : 'N/A';
  const departmentName = userDataFromDB?.department_id ? DEPARTMENTS.find(d => d.id === userDataFromDB.department_id)?.name : 'N/A';
  
  const inputStyles = "bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-400 rounded-lg focus:ring-primary focus:border-primary";
  const primaryButtonStyles = "w-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary text-base py-3 rounded-lg";
  const linkButtonStyles = "w-full text-sm text-primary-foreground/80 hover:text-primary-foreground";

  if (step === 1) {
    return (
      <div key="registration-step-1">
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            <FormField
              control={step1Form.control}
              name="student_id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School ID / Matriculation Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your unique school ID" 
                      {...field} 
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormDescription>This will be used to verify your student record.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step1Form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ho Technical University Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.id@htu.edu.gh" 
                      {...field} 
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormDescription>Must be your official @htu.edu.gh email. An OTP will be sent here.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className={primaryButtonStyles} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Send OTP"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  if (step === 2 && userDataFromDB) {
    return (
      <div key="registration-step-2">
        <Form {...step2Form}>
          <Card className="bg-primary-foreground/10 border-primary-foreground/20 shadow-inner mb-6">
              <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-primary-foreground">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-400"/> Identity Partially Verified
                  </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-primary-foreground/90 space-y-1">
                  <p>An OTP has been 'sent' to: <strong>{verifiedSchoolEmail}</strong></p>
                  <p className="text-xs text-primary-foreground/70">Please enter the 6-digit code below to confirm your identity. (Simulated OTP: {generatedOtpForVerification})</p>
                  <p className="text-xs text-primary-foreground/70 mt-2">If this is you, please proceed:</p>
                  <ul className="text-xs list-disc list-inside pl-2">
                      <li><strong>Name:</strong> {userDataFromDB.first_name} {userDataFromDB.last_name}</li>
                      {facultyName !== 'N/A' && <li><strong>Faculty:</strong> {facultyName}</li>}
                      {departmentName !== 'N/A' && <li><strong>Department:</strong> {departmentName}</li>}
                  </ul>
              </CardContent>
          </Card>
          <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      {...field}
                      className={`${inputStyles} text-center tracking-[0.5em]`}
                      maxLength={6}
                    />
                  </FormControl>
                  <FormDescription>Check your @htu.edu.gh email ({verifiedSchoolEmail}) for the code.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className={primaryButtonStyles} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP & Continue"}
            </Button>
            <Button type="button" variant="link" onClick={() => setStep(1)} className={linkButtonStyles} disabled={isLoading}>
              Back to School ID/Email Entry
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  if (step === 3 && userDataFromDB) {
    return (
      <div key="registration-step-3">
        <Form {...step3Form}>
          <Card className="bg-primary-foreground/10 border-primary-foreground/20 shadow-inner mb-6">
              <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center text-primary-foreground">
                      <KeyRound className="mr-2 h-5 w-5 text-primary"/> Set Your Password
                  </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-primary-foreground/90 space-y-1">
                  <p>Welcome, <strong>{userDataFromDB.first_name}</strong>! Your identity has been verified.</p>
                  <p>Please create a secure password for your InternHub account.</p>
              </CardContent>
          </Card>
          <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
            <FormField
              control={step3Form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Choose a strong password" 
                      {...field} 
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormDescription>Min. 8 characters, incl. uppercase, lowercase, number, and special character.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step3Form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Re-enter your password" 
                      {...field} 
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={step3Form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-primary-foreground/10 border-primary-foreground/20">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-primary-foreground/50 data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={field.name} className="cursor-pointer text-primary-foreground"> 
                      I agree to the InternHub 
                      <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary-foreground hover:underline"><Link href="/terms-placeholder" target="_blank">Terms & Conditions</Link></Button>
                       {' '}and 
                      <Button variant="link" asChild className="p-0 h-auto ml-1 text-primary-foreground hover:underline"><Link href="/privacy-placeholder" target="_blank">Privacy Policy</Link></Button>.
                    </Label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className={primaryButtonStyles} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Activate Account & Log In"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  if ((step === 2 || step === 3) && !userDataFromDB) {
      return (
          <div className="text-center space-y-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10" key="registration-error-fallback">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive"/>
              <h3 className="text-lg font-semibold text-destructive">Verification Error</h3>
              <p className="text-sm text-destructive-foreground">There was an issue with the verification process. Please start over.</p>
              <Button onClick={() => { setStep(1); setUserDataFromDB(null); setVerifiedSchoolEmail(''); }} variant="outline" className="border-destructive text-destructive hover:bg-destructive/20">
                Start Over
              </Button>
          </div>
      )
  }

  return null;
}
