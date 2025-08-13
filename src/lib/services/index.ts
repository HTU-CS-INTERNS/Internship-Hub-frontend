
/**
 * Service Layer Exports
 * 
 * This file exports all service classes for easy importing throughout the application.
 * All services extend BaseService and provide role-specific functionality.
 */

// Export base service
export { BaseService } from './BaseService';

// Export role-specific services
// REMOVED StudentServiceFixed export to break circular dependency
export { SupervisorService } from './SupervisorServiceFixed';
export { LecturerService } from './LecturerService';
export { AdminService } from './AdminService';
export { StudentService } from './StudentService'; // This is a temporary addition to fix circular deps


// Export service types (if needed)
// export type { ServiceResponse } from './BaseService';
