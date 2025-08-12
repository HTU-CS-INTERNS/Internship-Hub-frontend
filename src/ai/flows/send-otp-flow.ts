'use server';
/**
 * @fileOverview A Genkit flow to generate and 'send' an OTP for email verification.
 *
 * - sendOtp - A function that simulates sending an OTP.
 * - SendOtpInput - The input type for the sendOtp function.
 * - SendOtpOutput - The return type for the sendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendOtpInputSchema = z.object({
  email: z.string().email().describe('The email address to which the OTP should be sent.'),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  otp: z.string().length(6).describe('The 6-digit One-Time Password.'),
  message: z.string().describe('A message indicating the status of the OTP sending process.'),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const generateOtp = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async (input) => {
    const otp = generateOtp();
    
    // In a real application, you'd use an email service here.
    console.log(`Simulating OTP send to ${input.email}: OTP is ${otp}`);

    return {
      otp: otp,
      message: `An OTP has been 'sent' to ${input.email}. (Simulated OTP: ${otp})`,
    };
  }
);
