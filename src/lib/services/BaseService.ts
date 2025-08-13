
import { apiClient } from '@/lib/supabase-api-client';

/**
 * Base Service - Common operations used across all user roles
 * Provides shared functionality for authentication, profile management, and basic data access
 */
export class BaseService {
  // Error handling
  protected static handleSuccess(data: any) {
    return { success: true, data, error: null };
  }

  protected static handleError(error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, data: null, error: errorMessage };
  }

  // Authentication & Profile
  static async getCurrentUser() {
    try {
      const result = await apiClient.getCurrentUser();
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async logout() {
    try {
      await apiClient.logout();
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // University Structure
  static async getFaculties() {
    try {
      const result = await apiClient.getFaculties();
      return this.handleSuccess(result || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getDepartments(facultyId?: string) {
    try {
      let departments = await apiClient.getDepartments();
      
      if (facultyId) {
        departments = departments.filter((dept: any) => dept.faculty_id === parseInt(facultyId));
      }
      
      return this.handleSuccess(departments || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCompanies() {
    try {
      const result = await apiClient.getCompanies();
      return this.handleSuccess(result || []);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
