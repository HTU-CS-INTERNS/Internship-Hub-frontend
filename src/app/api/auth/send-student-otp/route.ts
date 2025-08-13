
import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentByEmail } from '@/lib/supabase-api-client';
import { sendOtp } from '@/ai/flows/send-otp-flow';

export async function POST(request: NextRequest) {
  console.log('[API /send-student-otp] Received request.');
  try {
    const { email } = await request.json();
    console.log(`[API /send-student-otp] Processing request for email: ${email}`);

    if (!email) {
      console.error('[API /send-student-otp] Error: Email is required.');
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const student = await verifyStudentByEmail(email);
    console.log(`[API /send-student-otp] Student verification result:`, student);

    if (!student) {
      console.error(`[API /send-student-otp] Error: Student not found or already verified for email: ${email}`);
      return NextResponse.json({ success: false, error: 'Student not found or already verified' }, { status: 404 });
    }

    console.log(`[API /send-student-otp] Sending OTP for email: ${email}`);
    const otpResponse = await sendOtp({ email });
    console.log(`[API /send-student-otp] OTP response received:`, otpResponse);

    return NextResponse.json({
      success: true,
      message: otpResponse.message,
      otp: otpResponse.otp, // For development/testing
    });

  } catch (error) {
    console.error('[API /send-student-otp] CATCH BLOCK: An unexpected error occurred.', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage, fullError: error }, { status: 500 });
  }
}
