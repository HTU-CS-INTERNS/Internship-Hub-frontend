
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

const registrationStep1Schema = z.object({
  schoolId: z.string().min(3, { message: 'School ID must be at least 3 characters.' }).max(20, { message: 'School ID too long.'}),
  schoolEmail: z.string().email({ message: 'Please enter a valid school email address.' }),
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
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type RegistrationStep1Values = z.infer<typeof registrationStep1Schema>;
type RegistrationStep2Values = z.infer<typeof registrationStep2Schema>;
type RegistrationStep3Values = z.infer<typeof registrationStep3Schema>;

const fetchStudentDataFromSchoolDB = async (schoolId: string): Promise<{name: string, facultyId: string, departmentId: string} | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (schoolId.toLowerCase() === 'invalid_id_example') {
    return null;
  }
  const faculty = FACULTIES.find(f => f.name.includes("Engineering")) || FACULTIES[0];
  const department = DEPARTMENTS.find(d => d.facultyId === faculty.id) || DEPARTMENTS.find(d => d.id === "D005");
  
  return { 
    name: `Student ${schoolId.substring(0,5)}`,
    facultyId: faculty.id, 
    departmentId: department?.id || DEPARTMENTS[0].id 
  };
};

const SIMULATED_OTP = "123456"; // For testing

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [verifiedSchoolEmail, setVerifiedSchoolEmail] = React.useState('');
  const [userDataFromDB, setUserDataFromDB] = React.useState<{name: string, facultyId: string, departmentId: string} | null>(null);

  const step1Form = useForm<RegistrationStep1Values>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: { schoolId: '', schoolEmail: '' },
  });

  const step2Form = useForm<RegistrationStep2Values>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: { otp: '' },
  });

  const step3Form = useForm<RegistrationStep3Values>({
    resolver: zodResolver(registrationStep3Schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function handleStep1Submit(values: RegistrationStep1Values) {
    setIsLoading(true);
    const studentData = await fetchStudentDataFromSchoolDB(values.schoolId);

    if (!studentData) {
      toast({ 
        title: 'School ID Verification Failed', 
        description: 'The School ID provided was not found or is invalid. Please check and try again.', 
        variant: 'destructive' 
      });
      step1Form.setError("schoolId", { type: "manual", message: "Invalid School ID."});
      setIsLoading(false);
      return;
    }
    
    setUserDataFromDB(studentData);
    setVerifiedSchoolEmail(values.schoolEmail);
    
    toast({ 
      title: 'OTP Sent!', 
      description: `An OTP (simulated as ${SIMULATED_OTP}) has been sent to ${values.schoolEmail}. Please enter it below.`,
      variant: "default",
      duration: 7000,
    });
    setStep(2); 
    setIsLoading(false);
  }

  async function handleStep2Submit(values: RegistrationStep2Values) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate OTP check
    
    if (values.otp !== SIMULATED_OTP) {
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
      description: `Welcome, ${userDataFromDB?.name}! Please set a secure password for your account.`,
      variant: 'default'
    });
    setStep(3);
    setIsLoading(false);
  }

  async function handleStep3Submit(values: RegistrationStep3Values) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (typeof window !== "undefined" && userDataFromDB) {
      localStorage.setItem('userRole', 'STUDENT');
      localStorage.setItem('userName', userDataFromDB.name);
      localStorage.setItem('userEmail', verifiedSchoolEmail); // Use the verified school email
      localStorage.setItem('userFacultyId', userDataFromDB.facultyId);
      localStorage.setItem('userDepartmentId', userDataFromDB.departmentId);
      localStorage.removeItem('onboardingComplete');
    }
    
    toast({
      title: "Registration Successful!",
      description: `Welcome, ${userDataFromDB?.name || 'Student'}! Your account is created. Please complete your profile.`,
      variant: "default",
    });
    setIsLoading(false);
    router.push('/profile');
  }

  const facultyName = userDataFromDB ? FACULTIES.find(f => f.id === userDataFromDB.facultyId)?.name : 'N/A';
  const departmentName = userDataFromDB ? DEPARTMENTS.find(d => d.id === userDataFromDB.departmentId)?.name : 'N/A';

  if (step === 1) {
    return (
      <Form {...step1Form}>
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
          <FormField
            control={step1Form.control}
            name="schoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School ID / Matriculation Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your unique school ID" {...field} className="rounded-lg border-input"/>
                </FormControl>
                <FormDescription>This will be used to verify your student status.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={step1Form.control}
            name="schoolEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.id@school.domain" {...field} className="rounded-lg border-input"/>
                </FormControl>
                <FormDescription>An OTP will be sent to this school email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Send OTP"}
          </Button>
        </form>
      </Form>
    );
  }

  if (step === 2 && userDataFromDB) {
    return (
      <Form {...step2Form}>
        <Card className="bg-muted/50 border-input shadow-inner mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                    <CheckCircle className="mr-2 h-5 w-5"/> Identity Partially Verified
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground space-y-1">
                <p>An OTP has been sent to: <strong>{verifiedSchoolEmail}</strong></p>
                <p className="text-xs text-muted-foreground">Please enter the 6-digit code below to confirm your identity.</p>
                <p className="text-xs text-muted-foreground mt-2">If this is you, please proceed:</p>
                <ul className="text-xs list-disc list-inside pl-2">
                    <li><strong>Name:</strong> {userDataFromDB.name}</li>
                    <li><strong>Faculty:</strong> {facultyName}</li>
                    <li><strong>Department:</strong> {departmentName}</li>
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
                    className="rounded-lg border-input text-center tracking-[0.5em]" 
                    maxLength={6}
                  />
                </FormControl>
                <FormDescription>Check your school email ({verifiedSchoolEmail}) for the code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP & Continue"}
          </Button>
           <Button type="button" variant="link" onClick={() => setStep(1)} className="w-full text-sm" disabled={isLoading}>
            Back to School ID/Email Entry
          </Button>
        </form>
      </Form>
    );
  }

  if (step === 3 && userDataFromDB) {
    return (
      <Form {...step3Form}>
         <Card className="bg-green-500/10 border-green-500/30 shadow-inner mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-green-700 dark:text-green-300">
                    <KeyRound className="mr-2 h-5 w-5"/> Set Your Password
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-700/90 dark:text-green-300/90 space-y-1">
                <p>Welcome, <strong>{userDataFromDB.name}</strong>! Your email <strong>{verifiedSchoolEmail}</strong> and school identity have been verified.</p>
                <p>Please create a secure password for your InternshipTrack account.</p>
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
                  <Input type="password" placeholder="Choose a strong password" {...field} className="rounded-lg border-input"/>
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
                  <Input type="password" placeholder="Re-enter your password" {...field} className="rounded-lg border-input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account & Proceed to Profile"}
          </Button>
        </form>
      </Form>
    );
  }
  
  // Fallback for unexpected state, e.g. step 2 or 3 without userDataFromDB
  if ((step === 2 || step === 3) && !userDataFromDB) { 
      return (
          <div className="text-center space-y-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
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
    
    