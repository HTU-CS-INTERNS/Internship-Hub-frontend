
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

// In a real application, this prompt might be used to draft an email containing the OTP.
// For this mock, it's not directly used by the flow logic but is good practice to define.
const otpEmailPrompt = ai.definePrompt({
  name: 'otpEmailPrompt',
  input: { schema: z.object({ email: SendOtpInputSchema.shape.email, otp: SendOtpOutputSchema.shape.otp }) },
  output: { schema: z.object({ emailBody: z.string() }) },
  prompt: `Draft a short and friendly email to {{email}} containing the following One-Time Password (OTP): {{otp}}. The email should state that the OTP is for verifying their email address for InternHub and that it's valid for a short period (e.g., 10 minutes).`,
});

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async (input) => {
    const otp = generateOtp();
    
    // Simulate sending the OTP. In a real app, you'd use an email service here.
    // For example, you might call a service that uses the otpEmailPrompt to generate the email body.
    console.log(`Simulating OTP send to ${input.email}: OTP is ${otp}`);

    // Example of how you might use the prompt (currently commented out):
    // const { output: emailContent } = await otpEmailPrompt({email: input.email, otp });
    // if (emailContent?.emailBody) {
    //   // Call an email sending service with emailContent.emailBody
    //   console.log("Simulated email body:", emailContent.emailBody);
    // }

    return {
      otp: otp,
      message: `An OTP has been 'sent' to ${input.email}. (Simulated OTP: ${otp})`,
    };
  }
);
