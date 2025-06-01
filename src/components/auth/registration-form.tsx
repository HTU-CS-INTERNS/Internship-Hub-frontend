
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
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FACULTIES, DEPARTMENTS } from '@/lib/constants'; // For simulation

const registrationStep1Schema = z.object({
  schoolId: z.string().min(3, { message: 'School ID must be at least 3 characters.' }).max(20, { message: 'School ID too long.'}),
  email: z.string().email({ message: 'Please enter a valid personal email address.' }),
});

const registrationStep2Schema = z.object({
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

// Simulate fetching student data from a school database
const fetchStudentDataFromSchoolDB = async (schoolId: string): Promise<{name: string, facultyId: string, departmentId: string} | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  if (schoolId.toLowerCase() === 'invalid_id_example') {
    return null; // Simulate invalid ID
  }
  // Simulate finding a student
  const faculty = FACULTIES.find(f => f.name.includes("Engineering")) || FACULTIES[0];
  const department = DEPARTMENTS.find(d => d.facultyId === faculty.id) || DEPARTMENTS.find(d => d.id === "D005"); // Default to Software Engineering
  
  return { 
    name: `Student ${schoolId.substring(0,5)}`, // Generic name based on ID
    facultyId: faculty.id, 
    departmentId: department?.id || DEPARTMENTS[0].id 
  };
};


export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [verifiedEmail, setVerifiedEmail] = React.useState('');
  const [userDataFromDB, setUserDataFromDB] = React.useState<{name: string, facultyId: string, departmentId: string} | null>(null);


  const step1Form = useForm<RegistrationStep1Values>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: { schoolId: '', email: '' },
  });

  const step2Form = useForm<RegistrationStep2Values>({
    resolver: zodResolver(registrationStep2Schema),
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
    setVerifiedEmail(values.email);
    
    toast({ 
      title: 'School ID Verified!', 
      description: `Welcome, ${studentData.name}! A (simulated) verification link has been sent to ${values.email}.`,
      variant: "default"
    });
    // In a real app, user would click a link in an email. Here we simulate that by moving to step 2.
    setStep(2); 
    setIsLoading(false);
  }

  async function handleStep2Submit(values: RegistrationStep2Values) {
    setIsLoading(true);
    // Simulate account creation API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Persist user data (simulated with localStorage)
    if (typeof window !== "undefined" && userDataFromDB) {
      localStorage.setItem('userRole', 'STUDENT');
      localStorage.setItem('userName', userDataFromDB.name);
      localStorage.setItem('userEmail', verifiedEmail);
      localStorage.setItem('userFaculty', FACULTIES.find(f => f.id === userDataFromDB.facultyId)?.name || 'N/A');
      localStorage.setItem('userDepartment', DEPARTMENTS.find(d => d.id === userDataFromDB.departmentId)?.name || 'N/A');
    }
    
    toast({
      title: "Registration Successful!",
      description: `Welcome, ${userDataFromDB?.name || 'Student'}! Your account is created. Please complete your profile.`,
      variant: "default",
    });
    setIsLoading(false);
    router.push('/profile'); // Redirect to profile setup
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} className="rounded-lg border-input"/>
                </FormControl>
                <FormDescription>A verification link will be sent here (simulated).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Continue
          </Button>
        </form>
      </Form>
    );
  }

  if (step === 2 && userDataFromDB) {
    return (
      <Form {...step2Form}>
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
           <Card className="bg-muted/50 border-input shadow-inner">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                    <CheckCircle className="mr-2 h-5 w-5"/> Identity Verified
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground space-y-1">
                <p><strong>Name:</strong> {userDataFromDB.name}</p>
                <p><strong>Email:</strong> {verifiedEmail}</p>
                <p><strong>Faculty:</strong> {facultyName}</p>
                <p><strong>Department:</strong> {departmentName}</p>
                <p className="text-muted-foreground pt-2">Please set a secure password for your account.</p>
            </CardContent>
           </Card>
          <FormField
            control={step2Form.control}
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
            control={step2Form.control}
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
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account & Proceed to Profile
          </Button>
        </form>
      </Form>
    );
  }
  
  if (step === 2 && !userDataFromDB) { // Should not happen if flow is correct
      return (
          <div className="text-center space-y-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive"/>
              <h3 className="text-lg font-semibold text-destructive">Verification Error</h3>
              <p className="text-sm text-destructive-foreground">There was an issue verifying your details. Please go back and try again.</p>
              <Button onClick={() => setStep(1)} variant="outline" className="border-destructive text-destructive hover:bg-destructive/20">Go Back</Button>
          </div>
      )
  }

  return null; // Fallback
}
