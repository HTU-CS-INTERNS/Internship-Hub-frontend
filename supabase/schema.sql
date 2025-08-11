
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

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
  user_id uuid NOT NULL,
  student_id_number text UNIQUE,
  faculty_id bigint,
  department_id bigint,
  program_of_study text,
  status student_status_enum DEFAULT 'PENDING',
  is_verified boolean DEFAULT false,
  profile_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
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
  lecturer_rating integer CHECK (lecturer_rating >= 1 AND lecturer_rating <= 5),
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

-- 14. Email Notifications (for tracking sent emails)
CREATE TABLE email_notifications (
  id SERIAL PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('supervisor_verification', 'task_notification', 'report_notification', 'evaluation_request')),
  metadata JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE email_notifications IS 'Email notifications sent by the system for tracking purposes.';
COMMENT ON COLUMN email_notifications.template_type IS 'Type of email template used for categorization.';
COMMENT ON COLUMN email_notifications.metadata IS 'Additional data related to the email (JSON format).';
COMMENT ON COLUMN email_notifications.status IS 'Current status of the email notification.';

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

-- Create RLS policies (basic examples - adjust as needed)

-- Users can read their own data and admins can read all
CREATE POLICY "Users can read own data" ON public.users FOR SELECT
  USING (auth.uid() = id OR 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Students can read their own data
CREATE POLICY "Students can read own data" ON public.students FOR SELECT
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'LECTURER')));

-- Similar policies for other tables...
-- (Add more specific policies based on your business requirements)

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN users.id IS 'References the id in Supabase auth.users table';
COMMENT ON COLUMN users.school_id IS 'Student matriculation or unique school identifier';


-- 4. Student-Lecturer Assignments
CREATE TABLE student_lecturer_assignments (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Constraint: users.role MUST BE 'LECTURER' (handled by app logic or DB trigger)
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, is_active) WHERE (is_active = TRUE) -- A student can only have one active lecturer assignment
);
COMMENT ON COLUMN student_lecturer_assignments.lecturer_id IS 'User ID of the assigned lecturer';

-- 5. Student-Supervisor Assignments (If supervisors are platform users)
CREATE TABLE student_supervisor_assignments (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Constraint: users.role MUST BE 'SUPERVISOR'
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, is_active) WHERE (is_active = TRUE) -- A student can only have one active company supervisor assignment (if internal)
);

-- 6. Internship Placements
CREATE TABLE internship_placements (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- Assuming one active placement per student
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT,
  company_supervisor_name VARCHAR(255) NOT NULL,
  company_supervisor_email VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_details TEXT, -- e.g., "Remote", "Office Address", specific instructions.
  status internship_status NOT NULL DEFAULT 'NOT_SUBMITTED',
  rejection_reason TEXT,
  hod_comments TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  company_latitude DECIMAL(9,6),
  company_longitude DECIMAL(9,6),
  geofence_radius_meters INTEGER,
  CONSTRAINT dates_check CHECK (end_date >= start_date)
);
COMMENT ON COLUMN internship_placements.company_latitude IS 'Latitude of the company for geofencing.';
COMMENT ON COLUMN internship_placements.company_longitude IS 'Longitude of the company for geofencing.';
COMMENT ON COLUMN internship_placements.geofence_radius_meters IS 'Radius in meters for geofence validation.';

-- 7. Tasks (Daily work declarations by students)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  description TEXT NOT NULL,
  outcomes TEXT NOT NULL,
  learning_objectives TEXT NOT NULL,
  department_outcome_link VARCHAR(255),
  status task_report_status NOT NULL DEFAULT 'PENDING',
  supervisor_comments TEXT,
  lecturer_comments TEXT,
  submitted_at TIMESTAMPTZ, -- If there's a formal submission step
  approved_by_supervisor_at TIMESTAMPTZ,
  approved_by_lecturer_at TIMESTAMPTZ,
  attachments TEXT[], -- Array of file paths/URLs from Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reports (Weekly/Daily work reports by students)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL, -- Could be start_date of a week for weekly reports
  title VARCHAR(255),
  description TEXT NOT NULL, -- Summary of work done
  challenges_faced TEXT,
  learning_objectives TEXT NOT NULL, -- Key learnings
  outcomes TEXT,
  secure_photo_url TEXT, -- URL from Supabase Storage
  attachments TEXT[], -- Array of file paths/URLs from Supabase Storage
  status task_report_status NOT NULL DEFAULT 'PENDING',
  supervisor_comments TEXT,
  lecturer_comments TEXT,
  submitted_at TIMESTAMPTZ,
  approved_by_supervisor_at TIMESTAMPTZ,
  approved_by_lecturer_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Chats (Communication channels) - Conceptual, may need more complex structure for group chats etc.
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- When the last message was sent
);

-- 10. Chat Participants
CREATE TABLE chat_participants (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chat_id, user_id)
);

-- 11. Messages
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() -- Redundant with timestamp, but good for consistency
);

-- 12. Schedule Events
CREATE TABLE schedule_events (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Owner of the event
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type schedule_event_type NOT NULL,
  description TEXT,
  attendees_info TEXT, -- Simple storage for external attendees, or JSON for structured
  location VARCHAR(255),
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT event_dates_check CHECK (end_time >= start_time)
);

-- 13. Evaluations
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Lecturer or Supervisor
  evaluator_role evaluation_evaluator_role NOT NULL,
  evaluation_date DATE NOT NULL,
  overall_comments TEXT NOT NULL,
  strengths TEXT,
  areas_for_improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, evaluator_id, evaluation_date) -- Prevent duplicate evaluations for same student/evaluator/date
);

-- 14. Evaluation Scores
CREATE TABLE evaluation_scores (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  metric_key VARCHAR(100) NOT NULL, -- e.g., 'technical_skills', 'communication'
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  metric_label VARCHAR(255) NOT NULL, -- e.g., 'Technical Skills'
  UNIQUE (evaluation_id, metric_key)
);

-- 15. Check-ins
CREATE TABLE check_ins (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  address_resolved TEXT,
  manual_reason TEXT,
  is_gps_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_outside_geofence BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url TEXT, -- URL from Supabase Storage for secure photo
  supervisor_verification_status check_in_verification_status DEFAULT 'PENDING',
  supervisor_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- No updated_at here as check-ins are typically immutable once created, supervisor adds comments
);

-- 16. Issues (Grievances/Problems)
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  student_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lecturer_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  supervisor_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id VARCHAR(20) REFERENCES departments(id) ON DELETE SET NULL, -- For routing to correct HOD
  faculty_id VARCHAR(20) REFERENCES faculties(id) ON DELETE SET NULL,
  status issue_status NOT NULL DEFAULT 'OPEN',
  priority issue_priority NOT NULL DEFAULT 'MEDIUM',
  resolution_details TEXT,
  resolved_at TIMESTAMPTZ,
  assigned_to_hod_id UUID REFERENCES users(id) ON DELETE SET NULL, -- HOD responsible for resolution
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Triggers for updated_at ---
-- Generic function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables that have an updated_at column
CREATE TRIGGER set_timestamp_faculties
BEFORE UPDATE ON faculties
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_departments
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_internship_placements
BEFORE UPDATE ON internship_placements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tasks
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reports
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_chats
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_schedule_events
BEFORE UPDATE ON schedule_events
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_evaluations
BEFORE UPDATE ON evaluations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_issues
BEFORE UPDATE ON issues
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- --- Indexes ---
-- Add indexes for foreign keys and frequently queried columns

-- departments
CREATE INDEX idx_departments_faculty_id ON departments(faculty_id);

-- users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_faculty_id ON users(faculty_id);
CREATE INDEX idx_users_department_id ON users(department_id);

-- student_lecturer_assignments
CREATE INDEX idx_student_lecturer_assignments_student_id ON student_lecturer_assignments(student_id);
CREATE INDEX idx_student_lecturer_assignments_lecturer_id ON student_lecturer_assignments(lecturer_id);

-- student_supervisor_assignments
CREATE INDEX idx_student_supervisor_assignments_student_id ON student_supervisor_assignments(student_id);
CREATE INDEX idx_student_supervisor_assignments_supervisor_id ON student_supervisor_assignments(supervisor_id);

-- internship_placements
CREATE INDEX idx_internship_placements_student_id ON internship_placements(student_id);
CREATE INDEX idx_internship_placements_status ON internship_placements(status);

-- tasks
CREATE INDEX idx_tasks_student_id ON tasks(student_id);
CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- reports
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_report_date ON reports(report_date);
CREATE INDEX idx_reports_status ON reports(status);

-- chat_participants
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- messages
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- schedule_events
CREATE INDEX idx_schedule_events_user_id ON schedule_events(user_id);
CREATE INDEX idx_schedule_events_start_time ON schedule_events(start_time);
CREATE INDEX idx_schedule_events_type ON schedule_events(type);

-- evaluations
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);

-- evaluation_scores
CREATE INDEX idx_evaluation_scores_evaluation_id ON evaluation_scores(evaluation_id);

-- check_ins
CREATE INDEX idx_check_ins_student_id ON check_ins(student_id);
CREATE INDEX idx_check_ins_check_in_timestamp ON check_ins(check_in_timestamp);
CREATE INDEX idx_check_ins_supervisor_verification_status ON check_ins(supervisor_verification_status);

-- issues
CREATE INDEX idx_issues_reported_by_user_id ON issues(reported_by_user_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_department_id ON issues(department_id);
CREATE INDEX idx_issues_assigned_to_hod_id ON issues(assigned_to_hod_id);


-- --- RLS Policies Placeholder ---
-- IMPORTANT: Row Level Security (RLS) is NOT enabled by this script.
-- You MUST enable RLS for each table and define appropriate policies
-- in the Supabase dashboard or via SQL after running this script.
-- Example (conceptual - DO NOT RUN AS IS without understanding your auth):
--
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Students can manage their own tasks"
--   ON tasks FOR ALL
--   USING (auth.uid() = student_id)
--   WITH CHECK (auth.uid() = student_id);
--
-- CREATE POLICY "Lecturers can view tasks of their assigned students"
--   ON tasks FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM student_lecturer_assignments sla
--       WHERE sla.lecturer_id = auth.uid() AND sla.student_id = tasks.student_id AND sla.is_active = TRUE
--     )
--   );
-- Add similar policies for all tables based on your access control requirements.

COMMENT ON SCHEMA public IS 'Default public schema';
COMMENT ON SCHEMA auth IS 'Supabase Auth schema';
COMMENT ON SCHEMA storage IS 'Supabase Storage schema';
-- Ensure other schemas like extensions are also commented if needed.

-- Initial seed data (optional, for basic setup)
-- INSERT INTO faculties (id, name) VALUES
-- ('FENG', 'Faculty of Engineering'),
-- ('FBM', 'Faculty of Business and Management'),
-- ('FIT', 'Faculty of Information Technology')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO departments (id, name, faculty_id) VALUES
-- ('DCOMSC', 'Department of Computer Science', 'FIT'),
-- ('DMECH', 'Department of Mechanical Engineering', 'FENG'),
-- ('DMKT', 'Department of Marketing', 'FBM')
-- ON CONFLICT (id) DO NOTHING;

-- Note: User creation should primarily be handled through Supabase Auth (auth.users table)
-- and your application's registration flow, which then inserts into the public.users table.

SELECT 'Database schema setup complete. Remember to enable RLS and define policies.';
