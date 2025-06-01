
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], {
    required_error: "You need to select a role."
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'STUDENT', // Default role
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "Login Successful!",
      description: `Welcome back! You are logged in as a ${USER_ROLES[values.role as UserRole]}.`,
      variant: "default",
    });
    
    if (typeof window !== "undefined") {
      localStorage.setItem('userRole', values.role);
      localStorage.setItem('userEmail', values.email); // Store the email

      // Set a userName if not already present or if it's a placeholder like "New User"
      let currentUserName = localStorage.getItem('userName');
      if (!currentUserName || currentUserName === 'New User' || currentUserName === 'User') {
        // For students, the name should ideally be set during registration.
        // If a student logs in directly without full registration (not ideal),
        // this provides a basic name. Profile page handles full name update.
        const nameFromEmail = values.email.split('@')[0];
        const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        localStorage.setItem('userName', capitalizedName);
      }
      // Note: The 'onboardingComplete' flag is NOT touched here.
      // The registration flow manages it to guide new students through profile/internship setup.
      // Logged-in users go to dashboard; profile page handles missing info if 'onboardingComplete' is not 'true'.
    }
    
    router.push('/dashboard');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Login as:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  {(Object.keys(USER_ROLES) as UserRole[]).map((roleKey) => (
                    <FormItem key={roleKey} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={roleKey} id={`role-${roleKey.toLowerCase()}`} />
                      </FormControl>
                      <Label htmlFor={`role-${roleKey.toLowerCase()}`} className="font-normal cursor-pointer">
                        {USER_ROLES[roleKey]}
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
