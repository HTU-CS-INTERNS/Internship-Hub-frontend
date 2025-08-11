# Supabase Migration Guide

This project has been migrated from a custom backend API to use Supabase as the backend service. Follow these steps to set up your Supabase project and update your environment configuration.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Wait for the project to be fully initialized

## 2. Set up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/schema.sql` into the SQL Editor
3. Run the SQL script to create all tables, types, and policies

## 3. Configure Environment Variables

Update your `.env.local` file with your Supabase project credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development settings
NODE_ENV=development

# Optional: For additional security
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can find these values in your Supabase project dashboard under Settings > API.

## 4. Authentication Setup

The project uses Supabase Auth for user authentication. The migration includes:

- **New Auth Context**: `src/contexts/supabase-auth-context.tsx`
- **Supabase Client**: `src/lib/supabase.ts`
- **API Client**: `src/lib/supabase-api-client.ts`

### Key Changes:

1. **Authentication** is now handled by Supabase Auth
2. **API calls** use Supabase client instead of REST API calls
3. **Row Level Security (RLS)** is enabled for data protection
4. **Real-time subscriptions** are available for live data updates

## 5. Key Files Changed

- `.env.local` - Updated with Supabase environment variables
- `src/lib/supabase.ts` - New Supabase client configuration
- `src/lib/supabase-api-client.ts` - New API client using Supabase
- `src/types/database.ts` - TypeScript types for database tables
- `src/contexts/supabase-auth-context.tsx` - New auth context for Supabase
- `supabase/schema.sql` - Complete database schema

## 6. Database Schema Overview

The database includes the following main tables:

- **users** - User profiles (extends auth.users)
- **faculties** - Academic faculties
- **departments** - Academic departments
- **companies** - Companies offering internships
- **students** - Student-specific information
- **lecturers** - Lecturer-specific information
- **company_supervisors** - Company supervisor information
- **internships** - Internship records
- **daily_reports** - Student daily reports
- **daily_tasks** - Daily tasks assigned to students
- **location_check_ins** - Location-based check-ins
- **evaluations** - Internship evaluations
- **evaluation_scores** - Detailed evaluation scores
- **issues** - System issues/tickets
- **change_log** - Audit trail for changes

## 7. Row Level Security (RLS)

The schema includes basic RLS policies:

- Users can read and update their own data
- Admins have broader access
- Students can read their own records
- Lecturers can access assigned students' data

You may need to adjust these policies based on your specific requirements.

## 8. Running the Application

1. Install the Supabase client dependency:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Update your app to use the new auth context:
   ```tsx
   // Replace the old AuthProvider with SupabaseAuthProvider
   import { AuthProvider } from '@/contexts/supabase-auth-context'
   ```

3. Start your development server:
   ```bash
   npm run dev
   ```

## 9. Migration Notes

- **Authentication**: User sessions are now managed by Supabase Auth
- **API Calls**: All API calls now use Supabase client methods
- **Real-time**: You can now subscribe to real-time changes on any table
- **File Storage**: Supabase Storage can be used for file uploads (not included in this migration)
- **Edge Functions**: Supabase Edge Functions can be used for server-side logic

## 10. Next Steps

1. Test all authentication flows (login, signup, logout)
2. Verify that all data operations work correctly
3. Adjust RLS policies as needed for your security requirements
4. Consider implementing real-time subscriptions for live data updates
5. Add file upload functionality using Supabase Storage if needed

## Troubleshooting

- **Authentication issues**: Check that your Supabase URL and keys are correct
- **Database errors**: Verify that the schema was applied correctly
- **Permission issues**: Review RLS policies and adjust as needed
- **TypeScript errors**: Make sure all type definitions are imported correctly

For more help, refer to the [Supabase documentation](https://supabase.com/docs).
