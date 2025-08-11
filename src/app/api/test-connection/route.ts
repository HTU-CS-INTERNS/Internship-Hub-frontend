import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/supabase-api-client';

export async function GET() {
  try {
    console.log('Testing Supabase connection via API route...');
    
    // Test basic connection by fetching faculties
    const faculties = await apiClient.getFaculties();
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: {
        facultiesCount: faculties.length,
        faculties: faculties.slice(0, 3) // Return first 3 for testing
      }
    });
    
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
