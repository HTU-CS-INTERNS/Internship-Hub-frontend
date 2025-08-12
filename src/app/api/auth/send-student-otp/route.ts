
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/supabase-api-client';
import { sendOtp } from '@/ai/flows/send-otp-flow';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const student = await apiClient.verifyStudentByEmail(email);

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found or already verified' }, { status: 404 });
    }

    const otpResponse = await sendOtp({ email });

    // In a real app, you would store the OTP hash in your database with an expiration
    // For this example, we return it for the frontend to use in the next step.
    return NextResponse.json({
      success: true,
      message: otpResponse.message,
      otp: otpResponse.otp, // For development/testing
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
