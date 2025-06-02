
# InternshipTrack - Firestore Database Schema (Conceptual)

This document outlines a conceptual schema for the InternshipTrack application using Firestore, a NoSQL document database.

## General Notes:

*   **IDs**: Unless specified, `id` fields are typically the auto-generated document IDs from Firestore.
*   **Timestamps**: Fields like `createdAt`, `updatedAt`, `submissionDate`, `timestamp` should ideally use Firestore Server Timestamps. For simplicity, they are often represented as ISO date strings here.
*   **References**: Fields like `studentId`, `facultyId`, `lecturerId` store the ID of the related document in another collection.
*   **Denormalization**: Some data might be denormalized (e.g., storing `studentName` in a report document) for easier querying and display, though not explicitly detailed for all cases here.
*   **Subcollections**: Firestore allows for subcollections, which can be a powerful way to organize related data (e.g., messages within a chat).

---

## Collections:

### 1. `users`

Stores information about all users in the system.

*   `id` (string) - User's unique ID (e.g., Firebase Auth UID)
*   `name` (string) - Full name of the user
*   `email` (string) - Email address (unique)
*   `role` (string) - Enum: 'STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'
*   `avatarUrl` (string, optional) - URL to profile picture
*   `contactNumber` (string, optional) - Phone number
*   `facultyId` (string, optional) - Reference to `faculties` collection (for Student, Lecturer, HOD)
*   `departmentId` (string, optional) - Reference to `departments` collection (for Student, Lecturer, HOD)
*   `assignedLecturerId` (string, optional) - Reference to `users` (Lecturer) (for Student)
*   `companyName` (string, optional) - (for Supervisor)
*   `companyAddress` (string, optional) - (for Supervisor)
*   `assignedStudentIds` (array of string, optional) - List of student IDs (for Lecturer, Supervisor)
*   `status` (string) - Enum: 'ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION'
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)

---

### 2. `faculties`

Stores university faculties.

*   `id` (string) - Unique faculty ID (e.g., "FENG")
*   `name` (string) - Full name of the faculty (e.g., "Faculty of Engineering")
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)

---

### 3. `departments`

Stores university departments, linked to faculties.

*   `id` (string) - Unique department ID (e.g., "DCOMSC")
*   `name` (string) - Full name of the department (e.g., "Department of Computer Science")
*   `facultyId` (string) - Reference to `faculties` collection
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)

---

### 4. `internshipPlacements`

Stores details about a student's internship placement. A student typically has one active placement.

*   `id` (string) - Document ID can be the same as `studentId` for a 1:1 mapping if desired, or auto-generated.
*   `studentId` (string) - Reference to `users` collection (Student)
*   `companyName` (string)
*   `companyAddress` (string, optional)
*   `supervisorName` (string) - Company supervisor's name
*   `supervisorEmail` (string) - Company supervisor's email
*   `startDate` (string) - YYYY-MM-DD
*   `endDate` (string) - YYYY-MM-DD
*   `location` (string) - e.g., "Remote", "Office Address"
*   `status` (string) - Enum: 'NOT_SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
*   `rejectionReason` (string, optional) - If status is 'REJECTED'
*   `hodComments` (string, optional) - Comments from HOD during approval
*   `submittedAt` (timestamp, optional)
*   `approvedAt` (timestamp, optional)
*   `updatedAt` (timestamp)

---

### 5. `tasks`

Stores daily tasks declared by students.

*   `id` (string)
*   `studentId` (string) - Reference to `users` collection (Student)
*   `date` (string) - YYYY-MM-DD for the task
*   `description` (string)
*   `outcomes` (string)
*   `learningObjectives` (string)
*   `departmentOutcomeLink` (string, optional) - Link to specific departmental learning outcomes
*   `status` (string) - Enum: 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'
*   `attachments` (array of objects, optional)
    *   `name` (string)
    *   `url` (string) - Cloud Storage URL
    *   `type` (string) - MIME type
*   `supervisorComments` (string, optional)
*   `lecturerComments` (string, optional)
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)
*   `submittedAt` (timestamp, optional)
*   `approvedBySupervisorAt` (timestamp, optional)
*   `approvedByLecturerAt` (timestamp, optional)

---

### 6. `reports`

Stores daily/weekly work reports submitted by students. This structure is very similar to `tasks` but might have distinct fields or approval workflows.

*   `id` (string)
*   `studentId` (string) - Reference to `users` collection (Student)
*   `date` (string) - YYYY-MM-DD for the report
*   `title` (string, optional) - Specific title for the report
*   `description` (string) - Summary of work done
*   `challengesFaced` (string, optional)
*   `learningObjectives` (string) - Key learnings
*   `outcomes` (string, optional) - Specific outcomes if different from learnings
*   `securePhotoUrl` (string, optional) - Cloud Storage URL for secure photo
*   `attachments` (array of objects, optional)
    *   `name` (string)
    *   `url` (string) - Cloud Storage URL
    *   `type` (string) - MIME type
*   `status` (string) - Enum: 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'
*   `supervisorComments` (string, optional)
*   `lecturerComments` (string, optional)
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)
*   `submittedAt` (timestamp, optional)
*   `approvedBySupervisorAt` (timestamp, optional)
*   `approvedByLecturerAt` (timestamp, optional)

---

### 7. `chats`

Represents a communication channel between users.

*   `id` (string) - Could be a concatenated ID of participants (e.g., `userId1_userId2` sorted alphabetically)
*   `participants` (array of string) - List of `userId`s in the chat
*   `lastMessage` (object, optional)
    *   `content` (string)
    *   `senderId` (string)
    *   `timestamp` (timestamp)
*   `unreadCounts` (map, optional) - e.g., `{ userId1: 2, userId2: 0 }`
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp) - When the last message was sent

#### 7.1. `chats/{chatId}/messages` (Subcollection)

Stores individual messages within a chat.

*   `id` (string)
*   `senderId` (string) - Reference to `users` collection
*   `content` (string)
*   `timestamp` (timestamp)
*   `readBy` (array of string, optional) - List of `userId`s who have read the message

---

### 8. `scheduleEvents`

Stores calendar events for users.

*   `id` (string)
*   `userId` (string) - Reference to `users` (owner of the event)
*   `title` (string)
*   `startTime` (timestamp)
*   `endTime` (timestamp)
*   `type` (string) - Enum: 'meeting', 'deadline', 'personal', 'reminder', 'visit'
*   `description` (string, optional)
*   `attendees` (array of string, optional) - List of participant names or emails (for meetings/visits)
*   `location` (string, optional) - For physical meetings or visits
*   `isAllDay` (boolean, default: false)
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)

---

### 9. `evaluations`

Stores performance evaluations of students by lecturers or supervisors.

*   `id` (string)
*   `studentId` (string) - Reference to `users` (Student being evaluated)
*   `evaluatorId` (string) - Reference to `users` (Lecturer or Supervisor)
*   `evaluatorRole` (string) - Enum: 'LECTURER', 'SUPERVISOR'
*   `evaluationDate` (string) - YYYY-MM-DD
*   `scores` (map) - e.g., `{ technical_skills: 4, communication: 5, ... }`
*   `overallComments` (string)
*   `strengths` (string, optional)
*   `areasForImprovement` (string, optional)
*   `createdAt` (timestamp)
*   `updatedAt` (timestamp)

---

### 10. `checkIns`

Stores student check-in records for presence verification.

*   `id` (string)
*   `studentId` (string) - Reference to `users` collection (Student)
*   `timestamp` (timestamp) - Time of check-in
*   `location` (object or string)
    *   `latitude` (number, optional)
    *   `longitude` (number, optional)
    *   `address` (string, optional) - Derived from GPS or manually entered
    *   `manualReason` (string, optional) - If GPS denied or outside geofence
*   `isGpsVerified` (boolean, default: false)
*   `isOutsideGeofence` (boolean, default: false)
*   `photoUrl` (string, optional) - Cloud Storage URL for secure photo
*   `supervisorVerificationStatus` (string, optional) - Enum: 'PENDING', 'VERIFIED', 'FLAGGED'
*   `supervisorComments` (string, optional)

---

### 11. `systemSettings`

Stores global configuration for the application. Typically a single document.

*   `id` (string) - e.g., "global" (singleton document ID)
*   `enableSupervisorAutoInvite` (boolean)
*   `defaultInternshipDurationWeeks` (number)
*   `maxFileSizeUploadMb` (number)
*   `maintenanceMode` (boolean)
*   `updatedAt` (timestamp)

---

### 12. `departmentSettings`

Stores settings specific to each department.

*   `id` (string) - Department ID (references `departments.id`)
*   `autoApproveLowRiskPlacements` (boolean, default: false)
*   `minInternshipDurationWeeks` (number, optional) - Overrides system default
*   `customWelcomeMessage` (string, optional)
*   `mandatoryReportFields` (array of string, optional)
*   `updatedAt` (timestamp)

---

### 13. `issues`

Stores reported issues or grievances.

*   `id` (string)
*   `title` (string)
*   `description` (string)
*   `reportedByUserId` (string) - Reference to `users`
*   `reportedAt` (timestamp)
*   `studentInvolvedId` (string, optional) - Reference to `users` (Student)
*   `lecturerInvolvedId` (string, optional) - Reference to `users` (Lecturer)
*   `supervisorInvolvedId` (string, optional) - Reference to `users` (Supervisor)
*   `departmentId` (string, optional) - Reference to `departments` (if department-specific)
*   `facultyId` (string, optional) - Reference to `faculties`
*   `status` (string) - Enum: 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
*   `priority` (string) - Enum: 'LOW', 'MEDIUM', 'HIGH'
*   `resolutionDetails` (string, optional)
*   `resolvedAt` (timestamp, optional)
*   `assignedToHodId` (string, optional) - If escalated to HOD
*   `updatedAt` (timestamp)

---

This schema provides a starting point. Actual implementation might require adjustments based on specific query patterns, data access needs, and performance considerations. For example, embedding small, frequently accessed related data can sometimes be more efficient than separate lookups, while subcollections are excellent for one-to-many relationships that need to be queried independently.
