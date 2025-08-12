
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/supabase-api-client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const result = await apiClient.activateStudentAccount(email, password);

    return NextResponse.json({ success: true, message: 'Account activated successfully', data: result });

  } catch (error) {
    console.error('Error verifying student and activating account:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
