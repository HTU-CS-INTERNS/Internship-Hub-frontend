-- Function to get a user's full profile with joined data
-- This is called via RPC from the frontend api-client.
create or replace function get_user_profile(user_id_param uuid)
returns table (
    id uuid,
    email text,
    role user_role_enum,
    first_name text,
    last_name text,
    phone_number text,
    is_active boolean,
    faculty_id bigint,
    faculty_name text,
    department_id bigint,
    department_name text,
    company_name text,
    company_address text,
    student_id_number text,
    staff_id text,
    job_title text
)
language plpgsql
security definer -- Important for accessing auth schema
set search_path = public
as $$
begin
    return query
    select
        u.id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.is_active,
        u.faculty_id,
        f.name as faculty_name,
        u.department_id,
        d.name as department_name,
        u.company_name,
        u.company_address,
        u.student_id_number,
        u.staff_id,
        u.job_title
    from
        public.users u
    left join
        public.faculties f on u.faculty_id = f.id
    left join
        public.departments d on u.department_id = d.id
    where
        u.id = user_id_param;
end;
$$;

-- Grant execution rights to the authenticated role
grant execute on function public.get_user_profile(uuid) to authenticated;
