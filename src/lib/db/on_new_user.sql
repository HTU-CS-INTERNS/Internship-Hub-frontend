-- This trigger function automatically creates a user profile
-- in public.users and a role-specific profile (student, lecturer, etc.)
-- whenever a new user signs up in auth.users.

-- 1. Create the function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a public user profile
  insert into public.users (id, email, role, first_name, last_name, phone_number, is_active)
  values (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'role')::user_role_enum,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.phone,
    true
  );

  -- Create a role-specific profile based on the metadata
  if (new.raw_user_meta_data->>'role' = 'STUDENT') then
    insert into public.students (user_id, student_id_number)
    values (new.id, new.raw_user_meta_data->>'student_id_number');
  elsif (new.raw_user_meta_data->>'role' = 'LECTURER') then
    insert into public.lecturers (user_id, staff_id)
    values (new.id, new.raw_user_meta_data->>'staff_id');
  elsif (new.raw_user_meta_data->>'role' = 'SUPERVISOR') then
    -- Note: company_id needs to be handled separately, perhaps updated later.
    insert into public.company_supervisors (user_id, job_title)
    values (new.id, new.raw_user_meta_data->>'job_title');
  end if;

  return new;
end;
$$;

-- 2. Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
