export type Database = {
  public: {
    Tables: {
      change_log: {
        Row: {
          id: number
          table_name: string
          record_id: number
          operation: string
          changed_by: string | null
          changed_at: string | null
        }
        Insert: {
          table_name: string
          record_id: number
          operation: string
          changed_by?: string | null
        }
        Update: {
          table_name?: string
          record_id?: number
          operation?: string
          changed_by?: string | null
        }
      }
      companies: {
        Row: {
          id: number
          name: string
          address: string | null
          city: string | null
          region: string | null
          industry: string | null
          contact_email: string | null
          contact_phone: string | null
          latitude: number | null
          longitude: number | null
          geofence_radius_meters: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          address?: string | null
          city?: string | null
          region?: string | null
          industry?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          latitude?: number | null
          longitude?: number | null
          geofence_radius_meters?: number | null
        }
        Update: {
          name?: string
          address?: string | null
          city?: string | null
          region?: string | null
          industry?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          latitude?: number | null
          longitude?: number | null
          geofence_radius_meters?: number | null
        }
      }
      company_supervisors: {
        Row: {
          id: number
          user_id: string
          company_id: number
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_id: number
          job_title?: string | null
        }
        Update: {
          user_id?: string
          company_id?: number
          job_title?: string | null
        }
      }
      daily_reports: {
        Row: {
          id: number
          internship_id: number
          student_id: number
          report_date: string
          title: string
          description: string
          outcomes: string | null
          learning_objectives: string | null
          challenges_faced: string | null
          supervisor_comments: string | null
          supervisor_rating: number | null
          lecturer_comments: string | null
          lecturer_rating: number | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          internship_id: number
          student_id: number
          report_date: string
          title: string
          description: string
          outcomes?: string | null
          learning_objectives?: string | null
          challenges_faced?: string | null
          supervisor_comments?: string | null
          supervisor_rating?: number | null
          lecturer_comments?: string | null
          lecturer_rating?: number | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
        }
        Update: {
          internship_id?: number
          student_id?: number
          report_date?: string
          title?: string
          description?: string
          outcomes?: string | null
          learning_objectives?: string | null
          challenges_faced?: string | null
          supervisor_comments?: string | null
          supervisor_rating?: number | null
          lecturer_comments?: string | null
          lecturer_rating?: number | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
        }
      }
      daily_tasks: {
        Row: {
          id: number
          internship_id: number
          student_id: number
          task_date: string
          description: string
          expected_outcome: string | null
          learning_objective: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          supervisor_comments: string | null
          lecturer_comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          internship_id: number
          student_id: number
          task_date: string
          description: string
          expected_outcome?: string | null
          learning_objective?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          supervisor_comments?: string | null
          lecturer_comments?: string | null
        }
        Update: {
          internship_id?: number
          student_id?: number
          task_date?: string
          description?: string
          expected_outcome?: string | null
          learning_objective?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          supervisor_comments?: string | null
          lecturer_comments?: string | null
        }
      }
      departments: {
        Row: {
          id: number
          name: string
          department_code: string
          faculty_id: number | null
        }
        Insert: {
          name: string
          department_code: string
          faculty_id?: number | null
        }
        Update: {
          name?: string
          department_code?: string
          faculty_id?: number | null
        }
      }
      evaluation_scores: {
        Row: {
          id: number
          evaluation_id: number | null
          skill_category: string
          score: number
          max_score: number
          comments: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          evaluation_id?: number | null
          skill_category: string
          score: number
          max_score: number
          comments?: string | null
        }
        Update: {
          evaluation_id?: number | null
          skill_category?: string
          score?: number
          max_score?: number
          comments?: string | null
        }
      }
      evaluations: {
        Row: {
          id: number
          internship_id: number | null
          evaluator_id: string | null
          evaluation_date: string
          evaluation_type: 'MID_TERM' | 'FINAL' | null
          comments: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          internship_id?: number | null
          evaluator_id?: string | null
          evaluation_date: string
          evaluation_type?: 'MID_TERM' | 'FINAL' | null
          comments?: string | null
        }
        Update: {
          internship_id?: number | null
          evaluator_id?: string | null
          evaluation_date?: string
          evaluation_type?: 'MID_TERM' | 'FINAL' | null
          comments?: string | null
        }
      }
      faculties: {
        Row: {
          id: number
          name: string
          faculty_code: string
        }
        Insert: {
          name: string
          faculty_code: string
        }
        Update: {
          name?: string
          faculty_code?: string
        }
      }
      internships: {
        Row: {
          id: number
          student_id: string | null
          company_id: number | null
          company_supervisor_id: number | null
          lecturer_id: number | null
          start_date: string
          end_date: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | null
        }
        Insert: {
          student_id?: string | null
          company_id?: number | null
          company_supervisor_id?: number | null
          lecturer_id?: number | null
          start_date: string
          end_date: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | null
        }
        Update: {
          student_id?: string | null
          company_id?: number | null
          company_supervisor_id?: number | null
          lecturer_id?: number | null
          start_date?: string
          end_date?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | null
        }
      }
      issues: {
        Row: {
          id: number
          title: string
          description: string
          reported_by_user_id: string
          status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          reported_by_user_id: string
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
        }
        Update: {
          title?: string
          description?: string
          reported_by_user_id?: string
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
        }
      }
      lecturers: {
        Row: {
          id: number
          user_id: string | null
          staff_id: string
          office_location: string | null
          faculty_id: number | null
          department_id: number | null
        }
        Insert: {
          user_id?: string | null
          staff_id: string
          office_location?: string | null
          faculty_id?: number | null
          department_id?: number | null
        }
        Update: {
          user_id?: string | null
          staff_id?: string
          office_location?: string | null
          faculty_id?: number | null
          department_id?: number | null
        }
      }
      location_check_ins: {
        Row: {
          id: number
          internship_id: number
          student_id: number
          check_in_timestamp: string
          latitude: number
          longitude: number
          is_within_geofence: boolean
          device_info: string | null
          created_at: string
        }
        Insert: {
          internship_id: number
          student_id: number
          latitude: number
          longitude: number
          is_within_geofence: boolean
          device_info?: string | null
        }
        Update: {
          internship_id?: number
          student_id?: number
          latitude?: number
          longitude?: number
          is_within_geofence?: boolean
          device_info?: string | null
        }
      }
      students: {
        Row: {
          id: number
          user_id: string
          student_id_number: string | null
          faculty_id: number | null
          department_id: number | null
          program_of_study: string | null
          is_verified: boolean | null
          profile_complete: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          student_id_number?: string | null
          faculty_id?: number | null
          department_id?: number | null
          program_of_study?: string | null
          is_verified?: boolean | null
          profile_complete?: boolean | null
        }
        Update: {
          user_id?: string
          student_id_number?: string | null
          faculty_id?: number | null
          department_id?: number | null
          program_of_study?: string | null
          is_verified?: boolean | null
          profile_complete?: boolean | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'ADMIN'
          first_name: string
          last_name: string
          phone_number: string | null
          faculty_id: number | null
          department_id: number | null
          company_name: string | null
          company_address: string | null
          student_id_number: string | null
          staff_id: string | null
          job_title: string | null
          is_active: boolean | null
        }
        Insert: {
          id: string
          email: string
          role: 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'ADMIN'
          first_name: string
          last_name: string
          phone_number?: string | null
          faculty_id?: number | null
          department_id?: number | null
          company_name?: string | null
          company_address?: string | null
          student_id_number?: string | null
          staff_id?: string | null
          job_title?: string | null
          is_active?: boolean | null
        }
        Update: {
          email?: string
          role?: 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'ADMIN'
          first_name?: string
          last_name?: string
          phone_number?: string | null
          faculty_id?: number | null
          department_id?: number | null
          company_name?: string | null
          company_address?: string | null
          student_id_number?: string | null
          staff_id?: string | null
          job_title?: string | null
          is_active?: boolean | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
