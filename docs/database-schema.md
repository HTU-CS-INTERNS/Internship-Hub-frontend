
# InternHub - Relational Database Schema (PostgreSQL/MySQL)

This document outlines a conceptual relational database schema for the InternHub application.

## General Notes:

*   **Primary Keys (PK)**: Typically `id SERIAL PRIMARY KEY` (PostgreSQL) or `id INT AUTO_INCREMENT PRIMARY KEY` (MySQL).
*   **Foreign Keys (FK)**: Indicated with `_id` suffix, referencing the `id` of another table. Appropriate `ON DELETE` and `ON UPDATE` actions (e.g., `CASCADE`, `SET NULL`, `RESTRICT`) should be considered.
*   **Timestamps**: `created_at` and `updated_at` fields should ideally use `TIMESTAMP WITH TIME ZONE` (PostgreSQL) or `TIMESTAMP` (MySQL) with default values like `NOW()` or `CURRENT_TIMESTAMP`.
*   **ENUMs**: PostgreSQL has native ENUM types. MySQL can use ENUM or a check constraint with VARCHAR. For simplicity, ENUM is specified.
*   **Indexes**: Should be created on foreign keys and columns frequently used in `WHERE` clauses or `JOIN` conditions.
*   **Naming Conventions**: Tables are plural, columns are snake_case.

---

## Tables:

### 1. `users`

Stores information about all users in the system.

*   `id` (SERIAL or INT) - PK
*   `name` (VARCHAR(255)) - Not Null
*   `email` (VARCHAR(255)) - Not Null, Unique
*   `password_hash` (VARCHAR(255)) - Not Null (for app-managed auth if not using Firebase Auth)
*   `role` (ENUM('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN')) - Not Null
*   `avatar_url` (VARCHAR(255), optional)
*   `contact_number` (VARCHAR(50), optional)
*   `faculty_id` (INT, optional) - FK to `faculties.id`
*   `department_id` (INT, optional) - FK to `departments.id`
*   `company_name` (VARCHAR(255), optional) - (for Supervisor)
*   `company_address` (TEXT, optional) - (for Supervisor)
*   `status` (ENUM('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION')) - Not Null, Default: 'PENDING_VERIFICATION'
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 2. `faculties`

Stores university faculties.

*   `id` (SERIAL or INT) - PK
*   `faculty_code` (VARCHAR(20)) - Not Null, Unique (e.g., "FENG")
*   `name` (VARCHAR(255)) - Not Null (e.g., "Faculty of Engineering")
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 3. `departments`

Stores university departments, linked to faculties.

*   `id` (SERIAL or INT) - PK
*   `department_code` (VARCHAR(20)) - Not Null, Unique (e.g., "DCOMSC")
*   `name` (VARCHAR(255)) - Not Null (e.g., "Department of Computer Science")
*   `faculty_id` (INT) - Not Null, FK to `faculties.id`
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 4. `student_lecturer_assignments`

Join table for many-to-many relationship between students and assigned lecturers. A student is typically assigned one lecturer for an internship period.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `lecturer_id` (INT) - Not Null, FK to `users.id` (where role is LECTURER)
*   `assignment_date` (TIMESTAMP) - Default: `NOW()`
*   `is_active` (BOOLEAN) - Default: `true` (to handle past assignments if needed)
*   `created_at` (TIMESTAMP)
*   Unique constraint on (`student_id`, `is_active=true`) if a student can only have one active lecturer.

---

### 5. `student_supervisor_assignments`

Join table for students and their industrial supervisors (if supervisors are also `users`).

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `supervisor_id` (INT) - Not Null, FK to `users.id` (where role is SUPERVISOR)
*   `assignment_date` (TIMESTAMP) - Default: `NOW()`
*   `is_active` (BOOLEAN) - Default: `true`
*   `created_at` (TIMESTAMP)

---

### 6. `internship_placements`

Stores details about a student's internship placement.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, Unique (if 1 active placement per student), FK to `users.id`
*   `company_name` (VARCHAR(255)) - Not Null
*   `company_address` (TEXT, optional)
*   `company_supervisor_name` (VARCHAR(255)) - Not Null (This is the external supervisor's name)
*   `company_supervisor_email` (VARCHAR(255)) - Not Null (External supervisor's email)
*   `start_date` (DATE) - Not Null
*   `end_date` (DATE) - Not Null
*   `location_details` (TEXT, optional) - e.g., "Remote", "Office Address", specific instructions.
*   `status` (ENUM('NOT_SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED')) - Not Null, Default: 'NOT_SUBMITTED'
*   `rejection_reason` (TEXT, optional) - If status is 'REJECTED'
*   `hod_comments` (TEXT, optional) - Comments from HOD during approval
*   `submitted_at` (TIMESTAMP, optional)
*   `approved_at` (TIMESTAMP, optional)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 7. `tasks`

Stores daily tasks declared by students.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `task_date` (DATE) - Not Null
*   `description` (TEXT) - Not Null
*   `outcomes` (TEXT) - Not Null
*   `learning_objectives` (TEXT) - Not Null
*   `department_outcome_link` (VARCHAR(255), optional) - Link to specific departmental learning outcomes
*   `status` (ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')) - Not Null, Default: 'PENDING'
*   `supervisor_comments` (TEXT, optional)
*   `lecturer_comments` (TEXT, optional)
*   `submitted_at` (TIMESTAMP, optional)
*   `approved_by_supervisor_at` (TIMESTAMP, optional)
*   `approved_by_lecturer_at` (TIMESTAMP, optional)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 8. `task_attachments`

Stores attachments related to tasks.

*   `id` (SERIAL or INT) - PK
*   `task_id` (INT) - Not Null, FK to `tasks.id`
*   `file_name` (VARCHAR(255)) - Not Null
*   `file_url` (VARCHAR(255)) - Not Null (e.g., Cloud Storage URL)
*   `file_type` (VARCHAR(100), optional) - MIME type
*   `uploaded_at` (TIMESTAMP) - Default: `NOW()`

---

### 9. `reports`

Stores daily/weekly work reports submitted by students.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `report_date` (DATE) - Not Null
*   `title` (VARCHAR(255), optional) - Specific title for the report
*   `description` (TEXT) - Not Null, Summary of work done
*   `challenges_faced` (TEXT, optional)
*   `learning_objectives` (TEXT) - Not Null, Key learnings
*   `outcomes` (TEXT, optional) - Specific outcomes if different from learnings
*   `secure_photo_url` (VARCHAR(255), optional) - Cloud Storage URL for secure photo
*   `status` (ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')) - Not Null, Default: 'PENDING'
*   `supervisor_comments` (TEXT, optional)
*   `lecturer_comments` (TEXT, optional)
*   `submitted_at` (TIMESTAMP, optional)
*   `approved_by_supervisor_at` (TIMESTAMP, optional)
*   `approved_by_lecturer_at` (TIMESTAMP, optional)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 10. `report_attachments`

Stores attachments related to reports.

*   `id` (SERIAL or INT) - PK
*   `report_id` (INT) - Not Null, FK to `reports.id`
*   `file_name` (VARCHAR(255)) - Not Null
*   `file_url` (VARCHAR(255)) - Not Null
*   `file_type` (VARCHAR(100), optional) - MIME type
*   `uploaded_at` (TIMESTAMP) - Default: `NOW()`

---

### 11. `chats`

Represents a communication channel.

*   `id` (SERIAL or INT) - PK
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP) - When the last message was sent

---

### 12. `chat_participants`

Links users to chats (many-to-many).

*   `id` (SERIAL or INT) - PK
*   `chat_id` (INT) - Not Null, FK to `chats.id`
*   `user_id` (INT) - Not Null, FK to `users.id`
*   `joined_at` (TIMESTAMP) - Default: `NOW()`
*   Unique constraint on (`chat_id`, `user_id`)

---

### 13. `messages`

Stores individual messages within a chat.

*   `id` (SERIAL or INT) - PK
*   `chat_id` (INT) - Not Null, FK to `chats.id`
*   `sender_id` (INT) - Not Null, FK to `users.id`
*   `content` (TEXT) - Not Null
*   `timestamp` (TIMESTAMP) - Not Null, Default: `NOW()`
*   `created_at` (TIMESTAMP)

---

### 14. `message_reads`

Tracks when a user has read a message (for unread counts).

*   `id` (SERIAL or INT) - PK
*   `message_id` (INT) - Not Null, FK to `messages.id`
*   `user_id` (INT) - Not Null, FK to `users.id`
*   `read_at` (TIMESTAMP) - Not Null, Default: `NOW()`
*   Unique constraint on (`message_id`, `user_id`)

---

### 15. `schedule_events`

Stores calendar events for users.

*   `id` (SERIAL or INT) - PK
*   `user_id` (INT) - Not Null, FK to `users.id` (owner of the event)
*   `title` (VARCHAR(255)) - Not Null
*   `start_time` (TIMESTAMP) - Not Null
*   `end_time` (TIMESTAMP) - Not Null
*   `type` (ENUM('meeting', 'deadline', 'personal', 'reminder', 'visit')) - Not Null
*   `description` (TEXT, optional)
*   `attendees_info` (TEXT, optional) - Comma-separated names/emails for simplicity, or could be a JSON field. For a more robust solution, a separate `event_attendees` table linking to `users` or storing email could be used.
*   `location` (VARCHAR(255), optional) - For physical meetings or visits
*   `is_all_day` (BOOLEAN) - Not Null, Default: `false`
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 16. `evaluations`

Stores performance evaluations of students.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `evaluator_id` (INT) - Not Null, FK to `users.id` (Lecturer or Supervisor)
*   `evaluator_role` (ENUM('LECTURER', 'SUPERVISOR')) - Not Null
*   `evaluation_date` (DATE) - Not Null
*   `overall_comments` (TEXT) - Not Null
*   `strengths` (TEXT, optional)
*   `areas_for_improvement` (TEXT, optional)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

### 17. `evaluation_scores`

Stores scores for specific metrics for an evaluation.

*   `id` (SERIAL or INT) - PK
*   `evaluation_id` (INT) - Not Null, FK to `evaluations.id`
*   `metric_key` (VARCHAR(100)) - Not Null (e.g., 'technical_skills', 'communication' from constants)
*   `score` (SMALLINT) - Not Null (e.g., 1-5)
*   `metric_label` (VARCHAR(255)) - Not Null (e.g., 'Technical Skills')
*   Unique constraint on (`evaluation_id`, `metric_key`)

---

### 18. `check_ins`

Stores student check-in records.

*   `id` (SERIAL or INT) - PK
*   `student_id` (INT) - Not Null, FK to `users.id`
*   `check_in_timestamp` (TIMESTAMP) - Not Null, Default: `NOW()`
*   `latitude` (DECIMAL(9,6), optional)
*   `longitude` (DECIMAL(9,6), optional)
*   `address_resolved` (TEXT, optional) - Derived from GPS or manually entered
*   `manual_reason` (TEXT, optional) - If GPS denied or outside geofence
*   `is_gps_verified` (BOOLEAN) - Not Null, Default: `false`
*   `is_outside_geofence` (BOOLEAN) - Not Null, Default: `false`
*   `photo_url` (VARCHAR(255), optional) - Cloud Storage URL for secure photo
*   `supervisor_verification_status` (ENUM('PENDING', 'VERIFIED', 'FLAGGED'), optional)
*   `supervisor_comments` (TEXT, optional)
*   `created_at` (TIMESTAMP)

---

### 19. `system_settings`

Stores global configuration for the application. Typically a single document or row.

*   `id` (SERIAL or INT) - PK (Could be fixed to 1 for a single row)
*   `setting_key` (VARCHAR(100)) - Not Null, Unique (e.g., 'enableSupervisorAutoInvite')
*   `setting_value` (TEXT) - Not Null
*   `setting_type` (VARCHAR(50)) - Not Null (e.g., 'BOOLEAN', 'INTEGER', 'STRING')
*   `description` (TEXT, optional)
*   `updated_at` (TIMESTAMP)
*   *(Alternative: Fixed columns if settings are static)*
    *   `id` (INT, PK, Default: 1)
    *   `enable_supervisor_auto_invite` (BOOLEAN) - Default: `true`
    *   `default_internship_duration_weeks` (INTEGER) - Default: 16
    *   `max_file_size_upload_mb` (INTEGER) - Default: 10
    *   `maintenance_mode` (BOOLEAN) - Default: `false`
    *   `updated_at` (TIMESTAMP)

---

### 20. `department_settings`

Stores settings specific to each department.

*   `id` (SERIAL or INT) - PK
*   `department_id` (INT) - Not Null, Unique, FK to `departments.id`
*   `auto_approve_low_risk_placements` (BOOLEAN) - Default: `false`
*   `min_internship_duration_weeks` (INTEGER, optional) - Overrides system default
*   `custom_welcome_message` (TEXT, optional)
*   `mandatory_report_fields` (TEXT, optional) - Could be JSON array of strings
*   `updated_at` (TIMESTAMP)

---

### 21. `issues`

Stores reported issues or grievances.

*   `id` (SERIAL or INT) - PK
*   `title` (VARCHAR(255)) - Not Null
*   `description` (TEXT) - Not Null
*   `reported_by_user_id` (INT) - Not Null, FK to `users.id`
*   `reported_at` (TIMESTAMP) - Not Null, Default: `NOW()`
*   `student_involved_id` (INT, optional) - FK to `users.id`
*   `lecturer_involved_id` (INT, optional) - FK to `users.id`
*   `supervisor_involved_id` (INT, optional) - FK to `users.id`
*   `department_id` (INT, optional) - FK to `departments.id`
*   `faculty_id` (INT, optional) - FK to `faculties.id`
*   `status` (ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) - Not Null, Default: 'OPEN'
*   `priority` (ENUM('LOW', 'MEDIUM', 'HIGH')) - Not Null, Default: 'MEDIUM'
*   `resolution_details` (TEXT, optional)
*   `resolved_at` (TIMESTAMP, optional)
*   `assigned_to_hod_id` (INT, optional) - FK to `users.id` (where role is HOD)
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

---

This relational schema provides a more structured approach. Specific SQL dialects (PostgreSQL, MySQL) might have slightly different syntax for ENUMs, SERIAL/AUTO_INCREMENT, or JSON types, but the overall structure should be adaptable.
      
