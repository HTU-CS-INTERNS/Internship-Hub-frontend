
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserProfileData } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
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
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await api<{ user: UserProfileData; session: { access_token: string; } }>('/auth/login', {
        method: 'POST',
        body: values,
      });

      const { user, session } = response;
      
      if (typeof window !== "undefined") {
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', `${user.first_name} ${user.last_name}`);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('user', JSON.stringify(user));
        // This is a temporary measure to make other parts of the app work
        localStorage.setItem('isLoggedIn', 'true');
      }

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${user.first_name || user.email}! You are logged in as a ${USER_ROLES[user.role] || user.role}.`,
        variant: "default",
      });

      // Redirect based on user role
      switch (user.role?.toLowerCase()) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'lecturer':
          router.push('/dashboard');
          break;
        case 'company_supervisor':
          router.push('/dashboard');
          break;
        case 'hod':
          router.push('/department-ops');
          break;
        case 'student':
          router.push('/dashboard');
          break;
        default:
          router.push('/dashboard');
      }

    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred. Please check your credentials and try again.',
        variant: 'destructive'
      });
    } finally {
        setIsLoading(false);
    }
  }

  const inputStyles = "bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-400 rounded-lg focus:ring-primary focus:border-primary";

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
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  {...field} 
                  className={inputStyles}
                />
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
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className={inputStyles}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-primary-foreground hover:bg-primary-foreground/90 text-primary shadow-md text-base py-3 rounded-lg" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
