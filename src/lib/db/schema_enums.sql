-- Run this SQL code in your Supabase SQL Editor FIRST.
-- This script creates the necessary ENUM types for your database schema.

-- Drop existing types if they exist to start clean
DROP TYPE IF EXISTS public.user_role_enum CASCADE;
DROP TYPE IF EXISTS public.submission_status_enum CASCADE;
DROP TYPE IF EXISTS public.issue_status_enum CASCADE;

-- Create ENUM for user roles
CREATE TYPE public.user_role_enum AS ENUM (
  'STUDENT',
  'SUPERVISOR',
  'LECTURER',
  'ADMIN',
  'HOD'
);

-- Create ENUM for submission statuses
CREATE TYPE public.submission_status_enum AS ENUM (
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'REJECTED'
);

-- Create ENUM for issue statuses
CREATE TYPE public.issue_status_enum AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

-- After running this, you can apply these types to your table columns, e.g.:
-- ALTER TABLE public.users ALTER COLUMN role TYPE user_role_enum USING role::text::user_role_enum;
-- ALTER TABLE public.daily_reports ALTER COLUMN status TYPE submission_status_enum USING status::text::submission_status_enum;
-- ALTER TABLE public.daily_tasks ALTER COLUMN status TYPE submission_status_enum USING status::text::submission_status_enum;
-- ALTER TABLE public.issues ALTER COLUMN status TYPE issue_status_enum USING status::text::issue_status_enum;
