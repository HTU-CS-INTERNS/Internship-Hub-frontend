/**
 * Admin Account Setup Script for Supabase
 * 
 * This script creates an admin user in your Supabase project.
 * Run this script once to create your first admin account.
 * 
 * Usage: node setup-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

const supabaseUrl = 'https://pibsmsgbzahzisqjiovf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log('🚀 Setting up admin account...\n');
  
  // Admin user details
  const adminEmail = 'admin@internshiphub.com';
  const adminPassword = 'Admin123!@#'; // Change this to a secure password
  const adminData = {
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Skip email confirmation
    user_metadata: {
      first_name: 'System',
      last_name: 'Administrator',
      role: 'ADMIN'
    }
  };

  try {
    console.log('1️⃣ Creating auth user...');
    
    // Create the auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser(adminData);
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Auth user already exists, proceeding with profile setup...');
        
        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === adminEmail);
        
        if (!existingUser) {
          throw new Error('Could not find existing user');
        }
        
        authUser.user = existingUser;
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created successfully');
    }

    const userId = authUser.user.id;
    console.log(`👤 User ID: ${userId}`);

    console.log('\n2️⃣ Creating user profile...');
    
    // Create user profile in the users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: adminEmail,
        role: 'ADMIN',
        first_name: 'System',
        last_name: 'Administrator',
        phone_number: '+1234567890',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      throw profileError;
    }

    console.log('✅ User profile created successfully');

    console.log('\n🎉 Admin account setup complete!');
    console.log('\n📋 Admin Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔗 You can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Add sample faculties and departments
async function setupSampleData() {
  console.log('\n3️⃣ Setting up sample data...');
  
  try {
    // Insert sample faculties
    const { data: faculties, error: facultyError } = await supabase
      .from('faculties')
      .upsert([
        { name: 'Faculty of Engineering', faculty_code: 'FENG' },
        { name: 'Faculty of Business Management', faculty_code: 'FBM' },
        { name: 'Faculty of Science', faculty_code: 'FSCI' }
      ])
      .select();

    if (facultyError) {
      console.error('Warning: Could not create faculties:', facultyError.message);
    } else {
      console.log('✅ Sample faculties created');
    }

    // Insert sample departments
    if (faculties && faculties.length > 0) {
      const { error: deptError } = await supabase
        .from('departments')
        .upsert([
          { name: 'Computer Science', department_code: 'DCOMSC', faculty_id: faculties[0].id },
          { name: 'Mechanical Engineering', department_code: 'DMECH', faculty_id: faculties[0].id },
          { name: 'Business Administration', department_code: 'DBA', faculty_id: faculties[1].id }
        ]);

      if (deptError) {
        console.error('Warning: Could not create departments:', deptError.message);
      } else {
        console.log('✅ Sample departments created');
      }
    }

    // Insert sample companies
    const { error: companyError } = await supabase
      .from('companies')
      .upsert([
        {
          name: 'Tech Solutions Ltd',
          address: '123 Tech Street',
          city: 'Accra',
          region: 'Greater Accra',
          industry: 'Technology',
          contact_email: 'contact@techsolutions.com'
        },
        {
          name: 'Manufacturing Corp',
          address: '456 Industry Ave',
          city: 'Kumasi',
          region: 'Ashanti',
          industry: 'Manufacturing',
          contact_email: 'info@manufacturing.com'
        }
      ]);

    if (companyError) {
      console.error('Warning: Could not create companies:', companyError.message);
    } else {
      console.log('✅ Sample companies created');
    }

  } catch (error) {
    console.error('Warning: Some sample data could not be created:', error.message);
  }
}

// Main execution
async function main() {
  await setupAdmin();
  await setupSampleData();
  process.exit(0);
}

main().catch(console.error);
