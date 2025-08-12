-- Make the user_id column in the students table nullable
-- This allows creating a student record before a user account is created.
ALTER TABLE public.students ALTER COLUMN user_id DROP NOT NULL;

-- Also, ensure the foreign key relationship is set to SET NULL on delete
-- This prevents deleting a student record if the user account is removed.
-- First, drop the existing constraint if it exists
ALTER TABLE public.students
DROP CONSTRAINT IF EXISTS students_user_id_fkey;

-- Then, re-add it with ON DELETE SET NULL
ALTER TABLE public.students
ADD CONSTRAINT students_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE SET NULL;
