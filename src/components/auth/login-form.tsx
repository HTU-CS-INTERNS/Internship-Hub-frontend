
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
  role: z.enum(['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], { // Added ADMIN
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
      role: 'STUDENT', 
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "Login Successful!",
      description: `Welcome back! You are logged in as a ${USER_ROLES[values.role as UserRole]}.`,
      variant: "default",
    });
    
    if (typeof window !== "undefined") {
      localStorage.setItem('userRole', values.role);
      localStorage.setItem('userEmail', values.email);

      let currentUserName = localStorage.getItem('userName');
      const defaultNameForRole = values.role === 'STUDENT' ? 'New Student' 
                                : values.role === 'SUPERVISOR' ? 'New Supervisor'
                                : values.role === 'ADMIN' ? 'Admin User' 
                                : USER_ROLES[values.role as UserRole];

      if (!currentUserName || currentUserName === 'New User' || currentUserName === 'User' || currentUserName === 'New Supervisor' || currentUserName === 'New Student') {
        const nameFromEmail = values.email.split('@')[0];
        const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        localStorage.setItem('userName', capitalizedName || defaultNameForRole);
      }
    }
    
    if (values.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
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
                  className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:space-y-0 sm:gap-x-4 sm:gap-y-2" // Adjusted for better wrapping
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
