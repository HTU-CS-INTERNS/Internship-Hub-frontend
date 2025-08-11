/**
 * Service Layer Exports
 * 
 * This file exports all service classes for easy importing throughout the application.
 * All services extend BaseService and provide role-specific functionality.
 */

// Export base service
export { BaseService } from './BaseService';

// Export role-specific services
export { StudentService } from './StudentServiceFixed';
export { SupervisorService } from './SupervisorServiceFixed';
export { LecturerService } from './LecturerService';
export { AdminService } from './AdminService';

// Export service types (if needed)
export type { ServiceResponse } from './BaseService';
