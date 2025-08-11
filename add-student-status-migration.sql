-- Migration script to add student status field
-- Run this on your existing Supabase database

-- Add the student_status_enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE student_status_enum AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the status column to the students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status student_status_enum DEFAULT 'PENDING';

-- Update existing students based on their is_verified status
-- Students who are verified become ACTIVE, others remain PENDING
UPDATE public.students 
SET status = CASE 
    WHEN is_verified = true THEN 'ACTIVE'::student_status_enum
    ELSE 'PENDING'::student_status_enum
END
WHERE status IS NULL;

-- Add a comment to document the field
COMMENT ON COLUMN public.students.status IS 'Student verification status: PENDING (newly added by admin), ACTIVE (email verified), INACTIVE (deactivated)';

-- Create an index for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
