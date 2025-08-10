-- Function to get a user's complete profile data
create
or replace function get_user_profile (user_id_param uuid) returns table (
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
) as $$
begin
  return query
  select
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
    f.name as faculty_name,
    d.name as department_name
  from
    public.users as u
    left join public.faculties as f on u.faculty_id = f.id
    left join public.departments as d on u.department_id = d.id
  where
    u.id = user_id_param;
end;
$$ language plpgsql security definer;
