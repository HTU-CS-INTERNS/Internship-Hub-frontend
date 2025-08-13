
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/supabase-api-client';

export async function POST(request: NextRequest) {
  console.log('[API /verify-student-otp] Received request.');
  try {
    const { email, password } = await request.json();
    console.log(`[API /verify-student-otp] Processing request for email: ${email}`);

    if (!email || !password) {
      console.error('[API /verify-student-otp] Error: Email and password are required.');
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    console.log(`[API /verify-student-otp] Activating account for: ${email}`);
    const result = await apiClient.activateStudentAccount(email, password);
    console.log(`[API /verify-student-otp] Account activation result:`, result);

    return NextResponse.json({ success: true, message: 'Account activated successfully', data: result });

  } catch (error) {
    console.error('[API /verify-student-otp] CATCH BLOCK: An unexpected error occurred.', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage, fullError: error }, { status: 500 });
  }
}
