
-- Enable a few extensions that are commonly used.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For gen_random_uuid() if not using Postgres 13+ which has it built-in
CREATE EXTENSION IF NOT EXISTS "moddatetime"; -- For an easy way to update `updated_at` columns

-- -----------------------------------------------------------------------------
-- ENUM Types
-- Create custom ENUM types to ensure data consistency for specific fields.
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'STUDENT',
  'LECTURER',
  'SUPERVISOR',
  'HOD',
  'ADMIN'
);

CREATE TYPE user_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'PENDING_VERIFICATION'
);

CREATE TYPE placement_status AS ENUM (
  'NOT_SUBMITTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE entry_status AS ENUM ( -- For tasks and reports
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE schedule_event_type AS ENUM (
  'MEETING',
  'DEADLINE',
  'PERSONAL',
  'REMINDER',
  'VISIT'
);

CREATE TYPE evaluation_role AS ENUM (
  'LECTURER',
  'SUPERVISOR'
);

CREATE TYPE check_in_verification_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'FLAGGED'
);

CREATE TYPE issue_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

CREATE TYPE issue_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Faculties Table
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE faculties IS 'Stores university faculties.';

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE departments IS 'Stores university departments, linked to faculties.';

-- Users Table
-- This table stores public profile information for users.
-- It links to Supabase's built-in `auth.users` table.
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, -- Should match auth.users.email
  role user_role NOT NULL,
  avatar_url VARCHAR(255),
  contact_number VARCHAR(50),
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  -- Supervisor-specific fields
  company_name VARCHAR(255),
  company_address TEXT,
  status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  -- Student-specific (if needed here, e.g., school_id)
  school_id VARCHAR(50), -- Example: if you verify and store student school ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Stores public user profile information, extending Supabase auth.users.';

-- Student Lecturer Assignments Table
CREATE TABLE student_lecturer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Constraint: role should be LECTURER
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' ),
  CONSTRAINT check_lecturer_role CHECK ( (SELECT role FROM users WHERE id = lecturer_id) = 'LECTURER' ),
  UNIQUE (student_id, is_active) -- Assuming a student can only have one active lecturer assignment
);
COMMENT ON TABLE student_lecturer_assignments IS 'Links students to their assigned lecturers.';

-- Student Supervisor Assignments Table (if SUPERVISOR is a user role in the system)
CREATE TABLE student_supervisor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Constraint: role should be SUPERVISOR
  assignment_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_student_supervisor_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' ),
  CONSTRAINT check_supervisor_user_role CHECK ( (SELECT role FROM users WHERE id = supervisor_id) = 'SUPERVISOR' )
);
COMMENT ON TABLE student_supervisor_assignments IS 'Links students to their company supervisors if supervisors are system users.';

-- Internship Placements Table
CREATE TABLE internship_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE, -- Assuming one active placement per student
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT,
  company_supervisor_name VARCHAR(255) NOT NULL, -- External supervisor's name
  company_supervisor_email VARCHAR(255) NOT NULL, -- External supervisor's email
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_details TEXT, -- e.g., "Remote", "Office Address", specific instructions.
  status placement_status NOT NULL DEFAULT 'NOT_SUBMITTED',
  rejection_reason TEXT,
  hod_comments TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  lecturer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Assigned university lecturer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_placement_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' ),
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);
COMMENT ON TABLE internship_placements IS 'Stores details about a student''s internship placement.';

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  description TEXT NOT NULL,
  outcomes TEXT NOT NULL,
  learning_objectives TEXT NOT NULL,
  department_outcome_link VARCHAR(255),
  status entry_status NOT NULL DEFAULT 'PENDING',
  supervisor_comments TEXT,
  lecturer_comments TEXT,
  submitted_at TIMESTAMPTZ,
  approved_by_supervisor_at TIMESTAMPTZ,
  approved_by_lecturer_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_task_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' )
);
COMMENT ON TABLE tasks IS 'Stores daily tasks declared by students.';

-- Task Attachments Table
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE task_attachments IS 'Stores attachments related to tasks.';

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  title VARCHAR(255),
  description TEXT NOT NULL, -- Summary of work done
  challenges_faced TEXT,
  learning_objectives TEXT NOT NULL,
  outcomes TEXT,
  secure_photo_path TEXT, -- Path in Supabase Storage
  status entry_status NOT NULL DEFAULT 'PENDING',
  supervisor_comments TEXT,
  lecturer_comments TEXT,
  submitted_at TIMESTAMPTZ,
  approved_by_supervisor_at TIMESTAMPTZ,
  approved_by_lecturer_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_report_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' )
);
COMMENT ON TABLE reports IS 'Stores daily/weekly work reports submitted by students.';

-- Report Attachments Table
CREATE TABLE report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE report_attachments IS 'Stores attachments related to reports.';

-- Chats Table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- When the last message was sent
);
COMMENT ON TABLE chats IS 'Represents a communication channel.';

-- Chat Participants Table
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chat_id, user_id)
);
COMMENT ON TABLE chat_participants IS 'Links users to chats (many-to-many).';

-- Messages Table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY, -- Use BIGSERIAL for auto-incrementing message ID for ordering
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() -- Also serves as timestamp
);
COMMENT ON TABLE messages IS 'Stores individual messages within a chat.';

-- Message Reads Table (optional, for read receipts)
CREATE TABLE message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id)
);
COMMENT ON TABLE message_reads IS 'Tracks when a user has read a message.';

-- Schedule Events Table
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type schedule_event_type NOT NULL,
  description TEXT,
  attendees_info TEXT, -- Could be JSON or comma-separated emails/names
  location VARCHAR(255),
  is_all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_event_times CHECK (end_time >= start_time)
);
COMMENT ON TABLE schedule_events IS 'Stores calendar events for users.';

-- Evaluations Table
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_role evaluation_role NOT NULL,
  evaluation_date DATE NOT NULL,
  overall_comments TEXT NOT NULL,
  strengths TEXT,
  areas_for_improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_evaluation_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' ),
  CONSTRAINT check_evaluator_role_match CHECK ( (SELECT role FROM users WHERE id = evaluator_id)::TEXT = evaluator_role::TEXT )
);
COMMENT ON TABLE evaluations IS 'Stores performance evaluations of students.';

-- Evaluation Scores Table
CREATE TABLE evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  metric_key VARCHAR(100) NOT NULL, -- e.g., 'technical_skills', 'communication'
  metric_label VARCHAR(255) NOT NULL, -- e.g., 'Technical Skills'
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (evaluation_id, metric_key)
);
COMMENT ON TABLE evaluation_scores IS 'Stores scores for specific metrics for an evaluation.';

-- Check-ins Table
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_timestamp TIMESTAMPTZ DEFAULT NOW(),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  address_resolved TEXT,
  manual_reason TEXT,
  is_gps_verified BOOLEAN DEFAULT FALSE,
  is_outside_geofence BOOLEAN DEFAULT FALSE,
  photo_path TEXT, -- Path in Supabase Storage
  supervisor_verification_status check_in_verification_status,
  supervisor_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_checkin_student_role CHECK ( (SELECT role FROM users WHERE id = student_id) = 'STUDENT' )
);
COMMENT ON TABLE check_ins IS 'Stores student check-in records.';

-- System Settings Table (single row or key-value)
-- Using key-value for flexibility
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL, -- e.g., 'BOOLEAN', 'INTEGER', 'STRING'
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE system_settings IS 'Stores global configuration for the application.';

-- Department Settings Table
CREATE TABLE department_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL UNIQUE REFERENCES departments(id) ON DELETE CASCADE,
  auto_approve_low_risk_placements BOOLEAN DEFAULT FALSE,
  min_internship_duration_weeks INTEGER,
  custom_welcome_message TEXT,
  mandatory_report_fields JSONB, -- Store as JSON array of strings
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE department_settings IS 'Stores settings specific to each department.';

-- Issues Table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  student_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lecturer_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  supervisor_involved_id UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  status issue_status NOT NULL DEFAULT 'OPEN',
  priority issue_priority NOT NULL DEFAULT 'MEDIUM',
  resolution_details TEXT,
  resolved_at TIMESTAMPTZ,
  assigned_to_hod_id UUID REFERENCES users(id) ON DELETE SET NULL, -- HOD user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE issues IS 'Stores reported issues or grievances.';

-- -----------------------------------------------------------------------------
-- Triggers for `updated_at`
-- Uses the `moddatetime` extension to automatically update `updated_at`
-- -----------------------------------------------------------------------------

CREATE TRIGGER handle_faculties_updated_at BEFORE UPDATE ON faculties
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_internship_placements_updated_at BEFORE UPDATE ON internship_placements
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_schedule_events_updated_at BEFORE UPDATE ON schedule_events
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_department_settings_updated_at BEFORE UPDATE ON department_settings
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
CREATE TRIGGER handle_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);


-- -----------------------------------------------------------------------------
-- Indexes for Foreign Keys and Frequently Queried Columns
-- -----------------------------------------------------------------------------

-- departments
CREATE INDEX idx_departments_faculty_id ON departments(faculty_id);
-- users
CREATE INDEX idx_users_faculty_id ON users(faculty_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
-- student_lecturer_assignments
CREATE INDEX idx_student_lecturer_assignments_student_id ON student_lecturer_assignments(student_id);
CREATE INDEX idx_student_lecturer_assignments_lecturer_id ON student_lecturer_assignments(lecturer_id);
-- student_supervisor_assignments
CREATE INDEX idx_student_supervisor_assignments_student_id ON student_supervisor_assignments(student_id);
CREATE INDEX idx_student_supervisor_assignments_supervisor_id ON student_supervisor_assignments(supervisor_id);
-- internship_placements
CREATE INDEX idx_internship_placements_student_id ON internship_placements(student_id);
CREATE INDEX idx_internship_placements_lecturer_id ON internship_placements(lecturer_id);
CREATE INDEX idx_internship_placements_status ON internship_placements(status);
-- tasks
CREATE INDEX idx_tasks_student_id ON tasks(student_id);
CREATE INDEX idx_tasks_status ON tasks(status);
-- task_attachments
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
-- reports
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
-- report_attachments
CREATE INDEX idx_report_attachments_report_id ON report_attachments(report_id);
-- chat_participants
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
-- messages
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
-- message_reads
CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
-- schedule_events
CREATE INDEX idx_schedule_events_user_id ON schedule_events(user_id);
CREATE INDEX idx_schedule_events_start_time ON schedule_events(start_time);
-- evaluations
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
-- evaluation_scores
CREATE INDEX idx_evaluation_scores_evaluation_id ON evaluation_scores(evaluation_id);
-- check_ins
CREATE INDEX idx_check_ins_student_id ON check_ins(student_id);
-- department_settings
CREATE INDEX idx_department_settings_department_id ON department_settings(department_id);
-- issues
CREATE INDEX idx_issues_reported_by_user_id ON issues(reported_by_user_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_department_id ON issues(department_id);


-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- IMPORTANT: Enable RLS for each table and define policies.
-- This script does NOT define RLS policies as they are highly specific.
-- Example: ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
-- Then define policies, e.g.,
-- CREATE POLICY "Allow public read access" ON public.faculties FOR SELECT USING (true);
-- CREATE POLICY "Allow admin full access" ON public.faculties FOR ALL USING (auth.role() = 'authenticated' AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
-- -----------------------------------------------------------------------------
-- Make sure to enable RLS for all tables that contain sensitive data.

-- -----------------------------------------------------------------------------
-- Storage Policies for Attachments
-- IMPORTANT: Create buckets in Supabase Storage (e.g., 'task_attachments', 'report_attachments', 'check_in_photos').
-- Define storage policies for these buckets to control access.
-- Example for a bucket named 'task_attachments':
-- - Allow authenticated users to upload: (bucket_id = 'task_attachments') AND (auth.role() = 'authenticated')
-- - Allow authenticated users to read their own attachments or if they are involved (e.g., lecturer/supervisor):
--   (bucket_id = 'task_attachments') AND (auth.role() = 'authenticated') AND ( (SELECT student_id FROM tasks WHERE id = (storage.foldername(name))[1]::uuid) = auth.uid() OR ... (add more complex logic) )
-- -----------------------------------------------------------------------------

-- End of schema.sql
      