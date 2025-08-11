/**
 * Admin Service Verification Script
 * This script helps verify that all admin POST/PUT/DELETE activities are properly connected to Supabase
 */

import { AdminService } from '@/lib/services/AdminService';

// Test data for verification
const testData = {
  faculty: {
    name: 'Test Faculty',
    faculty_code: 'TF001'
  },
  department: {
    name: 'Test Department',
    department_code: 'TD001',
    faculty_id: 1 // Update with actual faculty ID
  },
  company: {
    name: 'Test Company',
    address: '123 Test St',
    city: 'Test City',
    region: 'Test Region',
    industry: 'Technology',
    contact_email: 'test@company.com'
  },
  student: {
    user_id: 'test-user-id', // Update with actual user ID
    student_id_number: 'STU001',
    faculty_id: 1,
    department_id: 1,
    program_of_study: 'Computer Science',
    status: 'PENDING' as const
  },
  lecturer: {
    user_id: 'test-lecturer-id', // Update with actual user ID
    staff_id: 'LEC001',
    faculty_id: 1,
    department_id: 1
  },
  companySupervisor: {
    user_id: 'test-supervisor-id', // Update with actual user ID
    company_id: 1
  }
};

/**
 * Verification Functions
 */

export async function verifyUserManagement() {
  console.log('🔍 Verifying User Management...');
  
  try {
    // Test getting all users
    const usersResult = await AdminService.getAllUsers();
    console.log('✅ Get all users:', usersResult.success);
    
    if (usersResult.success && usersResult.data.length > 0) {
      const userId = usersResult.data[0].id;
      
      // Test updating user
      const updateResult = await AdminService.updateUser(userId, { 
        first_name: 'Updated Name' 
      });
      console.log('✅ Update user:', updateResult.success);
      
      // Test activating/deactivating user
      const activateResult = await AdminService.activateUser(userId);
      console.log('✅ Activate user:', activateResult.success);
      
      const deactivateResult = await AdminService.deactivateUser(userId);
      console.log('✅ Deactivate user:', deactivateResult.success);
    }
  } catch (error) {
    console.error('❌ User management error:', error);
  }
}

export async function verifyFacultyManagement() {
  console.log('🔍 Verifying Faculty Management...');
  
  try {
    // Test creating faculty
    const createResult = await AdminService.createFaculty(testData.faculty);
    console.log('✅ Create faculty:', createResult.success);
    
    if (createResult.success) {
      const facultyId = createResult.data.id;
      
      // Test updating faculty
      const updateResult = await AdminService.updateFaculty(facultyId, {
        name: 'Updated Faculty Name'
      });
      console.log('✅ Update faculty:', updateResult.success);
      
      // Test deleting faculty (uncomment to test, but be careful!)
      // const deleteResult = await AdminService.deleteFaculty(facultyId);
      // console.log('✅ Delete faculty:', deleteResult.success);
    }
  } catch (error) {
    console.error('❌ Faculty management error:', error);
  }
}

export async function verifyDepartmentManagement() {
  console.log('🔍 Verifying Department Management...');
  
  try {
    // Test creating department
    const createResult = await AdminService.createDepartment(testData.department);
    console.log('✅ Create department:', createResult.success);
    
    if (createResult.success) {
      const departmentId = createResult.data.id;
      
      // Test updating department
      const updateResult = await AdminService.updateDepartment(departmentId, {
        name: 'Updated Department Name'
      });
      console.log('✅ Update department:', updateResult.success);
    }
  } catch (error) {
    console.error('❌ Department management error:', error);
  }
}

export async function verifyCompanyManagement() {
  console.log('🔍 Verifying Company Management...');
  
  try {
    // Test creating company
    const createResult = await AdminService.createCompany(testData.company);
    console.log('✅ Create company:', createResult.success);
    
    if (createResult.success) {
      const companyId = createResult.data.id;
      
      // Test updating company
      const updateResult = await AdminService.updateCompany(companyId, {
        name: 'Updated Company Name'
      });
      console.log('✅ Update company:', updateResult.success);
      
      // Test deleting company
      const deleteResult = await AdminService.deleteCompany(companyId);
      console.log('✅ Delete company:', deleteResult.success);
    }
  } catch (error) {
    console.error('❌ Company management error:', error);
  }
}

export async function verifyStudentManagement() {
  console.log('🔍 Verifying Student Management...');
  
  try {
    // Test getting students by status
    const pendingResult = await AdminService.getPendingStudents();
    console.log('✅ Get pending students:', pendingResult.success);
    
    const activeResult = await AdminService.getActiveStudents();
    console.log('✅ Get active students:', activeResult.success);
    
    // Test creating student (uncomment with valid user_id)
    // const createResult = await AdminService.createStudent(testData.student);
    // console.log('✅ Create student:', createResult.success);
    
    // Test student status management
    if (pendingResult.success && pendingResult.data.length > 0) {
      const studentId = pendingResult.data[0].id;
      
      const activateResult = await AdminService.activateStudent(studentId);
      console.log('✅ Activate student:', activateResult.success);
      
      const statusUpdateResult = await AdminService.updateStudentStatus(studentId, 'PENDING');
      console.log('✅ Update student status:', statusUpdateResult.success);
    }
  } catch (error) {
    console.error('❌ Student management error:', error);
  }
}

export async function verifyInternshipManagement() {
  console.log('🔍 Verifying Internship Management...');
  
  try {
    // Test getting internships
    const allResult = await AdminService.getAllInternships();
    console.log('✅ Get all internships:', allResult.success);
    
    const pendingResult = await AdminService.getPendingInternships();
    console.log('✅ Get pending internships:', pendingResult.success);
    
    // Test internship status updates
    if (pendingResult.success && pendingResult.data.length > 0) {
      const internshipId = pendingResult.data[0].id;
      
      const approveResult = await AdminService.approveInternship(internshipId);
      console.log('✅ Approve internship:', approveResult.success);
      
      const rejectResult = await AdminService.rejectInternship(internshipId, 'Test rejection');
      console.log('✅ Reject internship:', rejectResult.success);
    }
  } catch (error) {
    console.error('❌ Internship management error:', error);
  }
}

export async function verifyAnalytics() {
  console.log('🔍 Verifying Analytics...');
  
  try {
    // Test system analytics
    const analyticsResult = await AdminService.getSystemAnalytics();
    console.log('✅ Get system analytics:', analyticsResult.success);
    
    // Test dashboard stats
    const statsResult = await AdminService.getDashboardStats();
    console.log('✅ Get dashboard stats:', statsResult.success);
    
    // Test system health
    const healthResult = await AdminService.getSystemHealth();
    console.log('✅ Get system health:', healthResult.success);
  } catch (error) {
    console.error('❌ Analytics error:', error);
  }
}

export async function verifyBulkOperations() {
  console.log('🔍 Verifying Bulk Operations...');
  
  try {
    // Test bulk student operations (with empty arrays for safety)
    const bulkApproveResult = await AdminService.bulkUpdateStudentStatus([], 'ACTIVE');
    console.log('✅ Bulk approve students (empty):', bulkApproveResult.success);
    
    const bulkRejectResult = await AdminService.bulkUpdateStudentStatus([], 'INACTIVE');
    console.log('✅ Bulk reject students (empty):', bulkRejectResult.success);
  } catch (error) {
    console.error('❌ Bulk operations error:', error);
  }
}

/**
 * Run all verification tests
 */
export async function runFullVerification() {
  console.log('🚀 Starting Admin Service Verification...\n');
  
  await verifyUserManagement();
  console.log('');
  
  await verifyFacultyManagement();
  console.log('');
  
  await verifyDepartmentManagement();
  console.log('');
  
  await verifyCompanyManagement();
  console.log('');
  
  await verifyStudentManagement();
  console.log('');
  
  await verifyInternshipManagement();
  console.log('');
  
  await verifyAnalytics();
  console.log('');
  
  await verifyBulkOperations();
  console.log('');
  
  console.log('✅ Verification complete!');
}

// Usage example:
// import { runFullVerification } from './admin-verification';
// runFullVerification();
