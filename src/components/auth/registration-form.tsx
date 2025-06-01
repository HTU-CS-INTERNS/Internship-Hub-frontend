
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
import { Loader2 } from 'lucide-react';

const registrationStep1Schema = z.object({
  schoolId: z.string().min(1, { message: 'School ID is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const registrationStep2Schema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type RegistrationStep1Values = z.infer<typeof registrationStep1Schema>;
type RegistrationStep2Values = z.infer<typeof registrationStep2Schema>;

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [verifiedEmail, setVerifiedEmail] = React.useState('');
  const [userDataFromDB, setUserDataFromDB] = React.useState<{name: string, faculty: string, department: string} | null>(null);


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
    // Simulate School ID verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (values.schoolId === 'INVALID_ID_EXAMPLE') {
      toast({ title: 'Error', description: 'Invalid School ID. Please try again.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    // Simulate fetching data from school DB
    setUserDataFromDB({ name: 'Jane Doe (from DB)', faculty: 'Faculty of Mock Data', department: 'Department of Examples' });
    
    // Simulate sending verification email
    toast({ title: 'Verification Email Sent', description: `A verification link has been sent to ${values.email}. Please check your inbox.` });
    setVerifiedEmail(values.email); // Store email for next step (or ideally, use a token from verification link)
    setStep(2); // Move to password setting step
    setIsLoading(false);
  }

  async function handleStep2Submit(values: RegistrationStep2Values) {
    setIsLoading(true);
    // Simulate account creation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, save student data (name, faculty, dept from DB) and password
    // For now, store basic info and role in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem('userRole', 'STUDENT'); // Set role to student
      localStorage.setItem('userName', userDataFromDB?.name || 'New Student');
      localStorage.setItem('userEmail', verifiedEmail);
      // Potentially store faculty/dept if needed later on profile page
    }
    
    toast({
      title: "Registration Successful!",
      description: `Welcome, ${userDataFromDB?.name || 'Student'}! Your account has been created. Please set up your profile.`,
      variant: "default",
    });
    setIsLoading(false);
    router.push('/profile'); // Redirect to profile setup
  }

  if (step === 1) {
    return (
      <Form {...step1Form}>
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
          <FormField
            control={step1Form.control}
            name="schoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your school ID" {...field} />
                </FormControl>
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
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormDescription>A verification link will be sent here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify & Continue
          </Button>
        </form>
      </Form>
    );
  }

  if (step === 2) {
    return (
      <Form {...step2Form}>
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
           <div className="text-sm text-muted-foreground">
            Verification successful for {verifiedEmail}. <br/>
            Welcome, {userDataFromDB?.name}! Your faculty is {userDataFromDB?.faculty} and department is {userDataFromDB?.department}.
            Please set your password.
          </div>
          <FormField
            control={step2Form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>
      </Form>
    );
  }

  return null; // Should not happen
}

    