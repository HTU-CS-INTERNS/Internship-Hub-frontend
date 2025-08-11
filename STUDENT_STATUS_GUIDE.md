# Student Status System - Admin Guide

## Overview
We've added a new student status system to track the verification process of students from when they're added by admins to when they activate their accounts.

## Student Status Types

### 1. PENDING (Default)
- **When:** Automatically set when an admin creates/adds a new student
- **Meaning:** Student account has been created but not yet verified their email
- **Student Access:** Cannot access the full application until verified

### 2. ACTIVE
- **When:** Automatically set when student verifies their email and signs in
- **Meaning:** Student has completed email verification and can fully use the system
- **Student Access:** Full access to all student features

### 3. INACTIVE
- **When:** Manually set by admin (for disciplinary or administrative reasons)
- **Meaning:** Student account has been deactivated
- **Student Access:** Cannot access the application

## Workflow

### For Admins:
1. Admin adds a new student → Status = **PENDING**
2. System sends verification email to student
3. Student clicks verification link and signs in → Status automatically changes to **ACTIVE**
4. Admin can manually change status to **INACTIVE** if needed

### For Students:
1. Receive email verification link
2. Click link and complete sign-in
3. Status automatically changes from PENDING to ACTIVE
4. Can now access full application features

## New Admin Service Methods

### Status Management
- `getPendingStudents()` - Get all students awaiting email verification
- `getActiveStudents()` - Get all verified active students
- `activateStudent(id)` - Manually activate a student
- `deactivateStudent(id)` - Manually deactivate a student
- `updateStudentStatus(id, status)` - Update to specific status

### Bulk Operations
- `bulkUpdateStudentStatus(ids[], status)` - Update multiple students at once

### Analytics Updates
The system analytics now include:
- `studentsAwaitingApproval` - Count of PENDING students
- `activeStudents` - Count of ACTIVE students  
- `inactiveStudents` - Count of INACTIVE students

## Database Changes

### New Field Added:
- `students.status` - ENUM('PENDING', 'ACTIVE', 'INACTIVE') DEFAULT 'PENDING'

### Migration:
Run the `add-student-status-migration.sql` script to update existing databases.

## Implementation Benefits

1. **Clear Tracking:** Admins can easily see which students haven't verified their emails
2. **Automatic Updates:** No manual intervention needed when students verify
3. **Better Analytics:** Clear metrics on student verification rates
4. **Account Management:** Easy way to deactivate problematic accounts
5. **Audit Trail:** Clear status history for each student

## Usage Examples

```typescript
// Get all pending students (awaiting verification)
const { data: pendingStudents } = await AdminService.getPendingStudents();

// Manually activate a student
await AdminService.activateStudent(studentId);

// Bulk update multiple students
await AdminService.bulkUpdateStudentStatus([1, 2, 3], 'ACTIVE');

// Check system analytics
const { data: analytics } = await AdminService.getSystemAnalytics();
console.log(analytics.userVerificationStatus.studentsAwaitingApproval);
```

## Notes
- The system automatically handles status updates when students verify their emails
- Existing students will be migrated to appropriate statuses based on their `is_verified` field
- The old `is_verified` field is still maintained for backward compatibility
