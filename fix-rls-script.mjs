import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' });

const supabaseUrl = 'https://pibsmsgbzahzisqjiovf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...\n');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-rls.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        
        if (error) {
          console.error('❌ Error:', error.message);
        } else {
          console.log('✅ Success');
        }
      }
    }
    
    console.log('\n🎉 RLS policies fixed!');
    
  } catch (error) {
    console.error('❌ Failed to fix RLS policies:', error.message);
  }
}

fixRLS();
