

/**
 * Service Layer Exports
 * 
 * This file exports all service classes for easy importing throughout the application.
 * All services extend BaseService and provide role-specific functionality.
 */

// Export base service
export { BaseService } from './BaseService';

// Export role-specific services
export { AdminService } from './AdminService';
export { StudentService } from './StudentService'; // Using the fixed version
export { LecturerService } from './LecturerService';
export { SupervisorService } from './SupervisorServiceFixed'; // Using the fixed version


// Export service types (if needed)
// export type { ServiceResponse } from './BaseService';
