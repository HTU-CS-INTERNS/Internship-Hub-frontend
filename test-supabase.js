// Test file to verify Supabase connection
// Run this after setting up your database schema

import { supabase } from './src/lib/supabase';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('Faculties table data:', data);
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️ No authenticated user (this is normal for initial setup)');
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️ No user session found');
    }
    
    console.log('🎉 Supabase setup appears to be working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
  }
}

// Uncomment the line below to run the test
testSupabaseConnection();

export default testSupabaseConnection;
