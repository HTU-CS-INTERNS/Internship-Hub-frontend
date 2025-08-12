# Database Setup Steps

Follow these steps to set up your Supabase database:

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/kbjzbhlefdyjiqpnanor
2. Navigate to the "SQL Editor" tab in the left sidebar
3. Click "New Query" to create a new SQL script

## Step 2: Run the Schema Script

Copy and paste the following SQL script into the SQL Editor and run it:

```sql
-- Enable RLS (Row Level Security)
-- Create custom types/enums
CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'LECTURER', 'SUPERVISOR', 'ADMIN');
CREATE TYPE submission_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE issue_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE evaluation_type_enum AS ENUM ('MID_TERM', 'FINAL');
CREATE TYPE internship_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE student_status_enum AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- Create tables

-- Faculties table
CREATE TABLE public.faculties (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  faculty_code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faculties_pkey PRIMARY KEY (id)
);

-- Departments table
CREATE TABLE public.departments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  department_code text NOT NULL UNIQUE,
  faculty_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id)
);

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role_enum NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  faculty_id bigint,
  department_id bigint,
  company_name text,
  company_address text,
  student_id_number text,
  staff_id text,
  job_title text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);

-- Companies table
CREATE TABLE public.companies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  address text,
  city text,
  region text,
  industry text,
  contact_email text,
  contact_phone text,
  latitude numeric,
  longitude numeric,
  geofence_radius_meters integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- Company supervisors table
CREATE TABLE public.company_supervisors (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  company_id bigint NOT NULL,
  job_title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT company_supervisors_pkey PRIMARY KEY (id),
  CONSTRAINT company_supervisors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT company_supervisors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Lecturers table
CREATE TABLE public.lecturers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  staff_id text NOT NULL UNIQUE,
  office_location text,
  faculty_id bigint,
  department_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lecturers_pkey PRIMARY KEY (id),
  CONSTRAINT lecturers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT lecturers_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT lecturers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);

-- Students table
CREATE TABLE public.students (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  student_id_number text UNIQUE,
  faculty_id bigint,
  department_id bigint,
  program_of_study text,
  is_verified boolean DEFAULT false,
  profile_complete boolean DEFAULT false,
  status student_status_enum DEFAULT 'PENDING',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT students_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT students_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);

-- Internships table
CREATE TABLE public.internships (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  student_id uuid,
  company_id bigint,
  company_supervisor_id bigint,
  lecturer_id bigint,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status internship_status_enum DEFAULT 'PENDING',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT internships_pkey PRIMARY KEY (id),
  CONSTRAINT internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT internships_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT internships_company_supervisor_id_fkey FOREIGN KEY (company_supervisor_id) REFERENCES public.company_supervisors(id),
  CONSTRAINT internships_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(id)
);

-- Daily reports table
CREATE TABLE public.daily_reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  internship_id bigint NOT NULL,
  student_id bigint NOT NULL,
  report_date date NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  outcomes text,
  learning_objectives text,
  challenges_faced text,
  supervisor_comments text,
  supervisor_rating integer CHECK (supervisor_rating >= 1 AND supervisor_rating <= 5),
  lecturer_comments text,
  lecturer_rating integer CHECK (lecturer_rating >= 1 AND supervisor_rating <= 5),
  status submission_status_enum DEFAULT 'PENDING',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_reports_pkey PRIMARY KEY (id),
  CONSTRAINT daily_reports_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  CONSTRAINT daily_reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Daily tasks table
CREATE TABLE public.daily_tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  internship_id bigint NOT NULL,
  student_id bigint NOT NULL,
  task_date date NOT NULL,
  description text NOT NULL,
  expected_outcome text,
  learning_objective text,
  status submission_status_enum DEFAULT 'PENDING',
  supervisor_comments text,
  lecturer_comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT daily_tasks_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  CONSTRAINT daily_tasks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Location check-ins table
CREATE TABLE public.location_check_ins (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  internship_id bigint NOT NULL,
  student_id bigint NOT NULL,
  check_in_timestamp timestamp with time zone DEFAULT now(),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_within_geofence boolean NOT NULL,
  device_info text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT location_check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT location_check_ins_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  CONSTRAINT location_check_ins_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Evaluations table
CREATE TABLE public.evaluations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  internship_id bigint,
  evaluator_id uuid,
  evaluation_date date NOT NULL,
  evaluation_type evaluation_type_enum,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  CONSTRAINT evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.users(id)
);

-- Evaluation scores table
CREATE TABLE public.evaluation_scores (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  evaluation_id bigint,
  skill_category text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric AND score <= 100::numeric),
  max_score numeric NOT NULL,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_scores_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_scores_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluations(id) ON DELETE CASCADE
);

-- Issues table
CREATE TABLE public.issues (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  reported_by_user_id uuid NOT NULL,
  status issue_status_enum DEFAULT 'OPEN',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT issues_pkey PRIMARY KEY (id),
  CONSTRAINT issues_reported_by_user_id_fkey FOREIGN KEY (reported_by_user_id) REFERENCES public.users(id)
);

-- Change log table
CREATE TABLE public.change_log (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  table_name text NOT NULL,
  record_id bigint NOT NULL,
  operation text NOT NULL,
  changed_by uuid,
  changed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT change_log_pkey PRIMARY KEY (id),
  CONSTRAINT change_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id)
);

-- Email notifications table
CREATE TABLE public.email_notifications (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_notifications_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_email_notifications_recipient ON public.email_notifications(recipient_email);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);


-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_student_id_number ON public.students(student_id_number);
CREATE INDEX idx_lecturers_user_id ON public.lecturers(user_id);
CREATE INDEX idx_lecturers_staff_id ON public.lecturers(staff_id);
CREATE INDEX idx_internships_student_id ON public.internships(student_id);
CREATE INDEX idx_internships_company_id ON public.internships(company_id);
CREATE INDEX idx_daily_reports_internship_id ON public.daily_reports(internship_id);
CREATE INDEX idx_daily_tasks_internship_id ON public.daily_tasks(internship_id);
CREATE INDEX idx_location_check_ins_internship_id ON public.location_check_ins(internship_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON public.lecturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON public.internships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON public.daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON public.daily_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Enable Row Level Security (RLS)

After the schema is created, run this script to enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Function to get the role of the current user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$;


-- Create basic RLS policies
-- Users can read their own data and admins can read all
CREATE POLICY "Users can read own data" ON public.users FOR SELECT
  USING (auth.uid() = id OR get_my_role() = 'ADMIN');

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to insert into students table
CREATE POLICY "Admins can insert students" ON public.students FOR INSERT
  WITH CHECK (get_my_role() = 'ADMIN');

-- Students can read their own data
CREATE POLICY "Students can read own data" ON public.students FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('ADMIN', 'LECTURER'));

-- Allow reading faculties and departments for all authenticated users
CREATE POLICY "Allow reading faculties" ON public.faculties FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow reading departments" ON public.departments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow reading companies for authenticated users
CREATE POLICY "Allow reading companies" ON public.companies FOR SELECT
  USING (auth.role() = 'authenticated');
  
-- Allow admins to create companies
CREATE POLICY "Admins can create companies" ON public.companies FOR INSERT
  WITH CHECK (get_my_role() = 'ADMIN');
```

## Step 4: Add Sample Data (Optional)

You can add some sample data to test your setup:

```sql
-- Insert sample faculties
INSERT INTO public.faculties (name, faculty_code) VALUES
('Faculty of Engineering', 'FENG'),
('Faculty of Business Management', 'FBM'),
('Faculty of Science', 'FSCI');

-- Insert sample departments
INSERT INTO public.departments (name, department_code, faculty_id) VALUES
('Computer Science', 'DCOMSC', 1),
('Mechanical Engineering', 'DMECH', 1),
('Business Administration', 'DBA', 2);

-- Insert sample companies
INSERT INTO public.companies (name, address, city, region, industry) VALUES
('Tech Solutions Ltd', '123 Tech Street', 'Accra', 'Greater Accra', 'Technology'),
('Manufacturing Corp', '456 Industry Ave', 'Kumasi', 'Ashanti', 'Manufacturing');
```

Once you've run these scripts, your database will be ready to use with your application!

