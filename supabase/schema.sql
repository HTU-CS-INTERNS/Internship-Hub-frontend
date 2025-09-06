
-- --- ENUM Types ---

CREATE TYPE user_role AS ENUM ('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION');
CREATE TYPE internship_status AS ENUM ('NOT_SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');
CREATE TYPE task_report_status AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE schedule_event_type AS ENUM ('meeting', 'deadline', 'personal', 'reminder', 'visit');
CREATE TYPE evaluation_evaluator_role AS ENUM ('LECTURER', 'SUPERVISOR');
CREATE TYPE check_in_verification_status AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED');
CREATE TYPE issue_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE issue_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- --- Tables ---

-- 1. Faculties
CREATE TABLE faculties (
  id VARCHAR(20) PRIMARY KEY, -- e.g., FENG, FBM
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN faculties.id IS 'Unique code for the faculty';

-- 2. Departments
CREATE TABLE departments (
  id VARCHAR(20) PRIMARY KEY, -- e.g., DCOMSC, DMECH
  name VARCHAR(255) NOT NULL,
  faculty_id VARCHAR(20) NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN departments.id IS 'Unique code for the department';

-- 3. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, -- Should match auth.users.email
  role user_role NOT NULL,
  avatar_url TEXT,
  contact_number VARCHAR(50),
  faculty_id VARCHAR(20) REFERENCES faculties(id) ON DELETE SET NULL,
  department_id VARCHAR(20) REFERENCES departments(id) ON DELETE SET NULL,
  -- Supervisor specific fields
  company_name VARCHAR(255),
  company_address TEXT,
  -- Student specific field
  school_id VARCHAR(100), -- For student's matriculation number or school ID
  status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
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
