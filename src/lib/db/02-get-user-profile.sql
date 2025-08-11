
-- This function is a placeholder and should be created in your Supabase SQL Editor.
-- It's designed to fetch a user's full profile, including related faculty and department names.

-- Drop the function if it already exists to ensure a clean update
DROP FUNCTION IF EXISTS public.get_user_profile(user_id uuid);

-- Create the function
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  role user_role_enum,
  first_name text,
  last_name text,
  phone_number text,
  faculty_id bigint,
  department_id bigint,
  company_name text,
  company_address text,
  student_id_number text,
  staff_id text,
  job_title text,
  is_active boolean,
  faculty_name text,
  department_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.phone_number,
    u.faculty_id,
    u.department_id,
    u.company_name,
    u.company_address,
    u.student_id_number,
    u.staff_id,
    u.job_title,
    u.is_active,
    f.name AS faculty_name,
    d.name AS department_name
  FROM
    public.users AS u
  LEFT JOIN
    public.faculties AS f ON u.faculty_id = f.id
  LEFT JOIN
    public.departments AS d ON u.department_id = d.id
  WHERE
    u.id = p_user_id;
END;
$$;


-- Add a new function for dashboard statistics
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
    totalStudents bigint,
    activeInternships bigint,
    unassignedInterns bigint,
    totalLecturers bigint,
    avgLecturerWorkload numeric,
    totalCompanies bigint,
    totalFaculties bigint
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        (SELECT COUNT(*) FROM public.students) AS totalStudents,
        (SELECT COUNT(*) FROM public.internships WHERE status = 'IN_PROGRESS') AS activeInternships,
        (SELECT COUNT(*) FROM public.students s LEFT JOIN public.internships i ON s.user_id = i.student_id WHERE i.id IS NULL) AS unassignedInterns,
        (SELECT COUNT(*) FROM public.lecturers) AS totalLecturers,
        CASE
            WHEN (SELECT COUNT(*) FROM public.lecturers) > 0 THEN
                (SELECT COUNT(*) FROM public.internships WHERE lecturer_id IS NOT NULL)::numeric / (SELECT COUNT(*) FROM public.lecturers)
            ELSE 0
        END AS avgLecturerWorkload,
        (SELECT COUNT(*) FROM public.companies) AS totalCompanies,
        (SELECT COUNT(*) FROM public.faculties) AS totalFaculties;
$$;
