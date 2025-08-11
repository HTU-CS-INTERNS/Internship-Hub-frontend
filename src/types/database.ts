export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      change_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: number
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: number
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: number
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          geofence_radius_meters: number | null
          id: number
          industry: string | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          geofence_radius_meters?: number | null
          id?: number
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          geofence_radius_meters?: number | null
          id?: number
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_supervisors: {
        Row: {
          company_id: number
          created_at: string
          id: number
          job_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: number
          job_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: number
          job_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_supervisors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_supervisors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          challenges_faced: string | null
          created_at: string
          description: string
          id: number
          internship_id: number
          learning_objectives: string | null
          lecturer_comments: string | null
          lecturer_rating: number | null
          outcomes: string | null
          report_date: string
          status: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id: number
          supervisor_comments: string | null
          supervisor_rating: number | null
          title: string
          updated_at: string
        }
        Insert: {
          challenges_faced?: string | null
          created_at?: string
          description: string
          id?: number
          internship_id: number
          learning_objectives?: string | null
          lecturer_comments?: string | null
          lecturer_rating?: number | null
          outcomes?: string | null
          report_date: string
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id: number
          supervisor_comments?: string | null
          supervisor_rating?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          challenges_faced?: string | null
          created_at?: string
          description?: string
          id?: number
          internship_id?: number
          learning_objectives?: string | null
          lecturer_comments?: string | null
          lecturer_rating?: number | null
          outcomes?: string | null
          report_date?: string
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id?: number
          supervisor_comments?: string | null
          supervisor_rating?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          created_at: string
          description: string
          expected_outcome: string | null
          id: number
          internship_id: number
          learning_objective: string | null
          lecturer_comments: string | null
          status: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id: number
          supervisor_comments: string | null
          task_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          expected_outcome?: string | null
          id?: number
          internship_id: number
          learning_objective?: string | null
          lecturer_comments?: string | null
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id: number
          supervisor_comments?: string | null
          task_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          expected_outcome?: string | null
          id?: number
          internship_id?: number
          learning_objective?: string | null
          lecturer_comments?: string | null
          status?: Database["public"]["Enums"]["submission_status_enum"] | null
          student_id?: number
          supervisor_comments?: string | null
          task_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          department_code: string
          faculty_id: number | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_code: string
          faculty_id?: number | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_code?: string
          faculty_id?: number | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          bounced_at: string | null
          created_at: string
          failed_at: string | null
          html_content: string
          id: number
          metadata: Json | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_type: string
        }
        Insert: {
          bounced_at?: string | null
          created_at?: string
          failed_at?: string | null
          html_content: string
          id?: number
          metadata?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_type: string
        }
        Update: {
          bounced_at?: string | null
          created_at?: string
          failed_at?: string | null
          html_content?: string
          id?: number
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string
        }
        Relationships: []
      }
      evaluation_scores: {
        Row: {
          comments: string | null
          created_at: string
          evaluation_id: number | null
          id: number
          max_score: number
          score: number
          skill_category: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          evaluation_id?: number | null
          id?: number
          max_score: number
          score: number
          skill_category: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          evaluation_id?: number | null
          id?: number
          max_score?: number
          score?: number
          skill_category?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_scores_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          comments: string | null
          created_at: string
          evaluation_date: string
          evaluation_type:
            | Database["public"]["Enums"]["evaluation_type_enum"]
            | null
          evaluator_id: string | null
          id: number
          internship_id: number | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          evaluation_date: string
          evaluation_type?:
            | Database["public"]["Enums"]["evaluation_type_enum"]
            | null
          evaluator_id?: string | null
          id?: number
          internship_id?: number | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          evaluation_date?: string
          evaluation_type?:
            | Database["public"]["Enums"]["evaluation_type_enum"]
            | null
          evaluator_id?: string | null
          id?: number
          internship_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          created_at: string
          faculty_code: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          faculty_code: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          faculty_code?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          company_id: number | null
          company_supervisor_id: number | null
          created_at: string
          end_date: string
          id: number
          lecturer_id: number | null
          start_date: string
          status: Database["public"]["Enums"]["internship_status_enum"] | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: number | null
          company_supervisor_id?: number | null
          created_at?: string
          end_date: string
          id?: number
          lecturer_id?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["internship_status_enum"] | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: number
          company_supervisor_id?: number | null
          created_at?: string
          end_date?: string
          id?: number
          lecturer_id?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["internship_status_enum"] | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internships_company_supervisor_id_fkey"
            columns: ["company_supervisor_id"]
            isOneToOne: false
            referencedRelation: "company_supervisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internships_lecturer_id_fkey"
            columns: ["lecturer_id"]
            isOneToOne: false
            referencedRelation: "lecturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string
          description: string
          id: number
          reported_by_user_id: string
          status: Database["public"]["Enums"]["issue_status_enum"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          reported_by_user_id: string
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          reported_by_user_id?: string
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_reported_by_user_id_fkey"
            columns: ["reported_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lecturers: {
        Row: {
          created_at: string
          department_id: number | null
          faculty_id: number | null
          id: number
          office_location: string | null
          staff_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: number | null
          faculty_id?: number | null
          id?: number
          office_location?: string | null
          staff_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: number | null
          faculty_id?: number | null
          id?: number
          office_location?: string | null
          staff_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecturers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecturers_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecturers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_check_ins: {
        Row: {
          check_in_timestamp: string
          created_at: string
          device_info: string | null
          id: number
          internship_id: number
          is_within_geofence: boolean
          latitude: number
          longitude: number
          student_id: number
        }
        Insert: {
          check_in_timestamp?: string
          created_at?: string
          device_info?: string | null
          id?: number
          internship_id: number
          is_within_geofence: boolean
          latitude: number
          longitude: number
          student_id: number
        }
        Update: {
          check_in_timestamp?: string
          created_at?: string
          device_info?: string | null
          id?: number
          internship_id?: number
          is_within_geofence?: boolean
          latitude?: number
          longitude?: number
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_check_ins_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_check_ins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          department_id: number | null
          faculty_id: number | null
          id: number
          is_verified: boolean | null
          profile_complete: boolean | null
          program_of_study: string | null
          status: Database["public"]["Enums"]["student_status_enum"] | null
          student_id_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: number | null
          faculty_id?: number | null
          id?: number
          is_verified?: boolean | null
          profile_complete?: boolean | null
          program_of_study?: string | null
          status?: Database["public"]["Enums"]["student_status_enum"] | null
          student_id_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: number | null
          faculty_id?: number | null
          id?: number
          is_verified?: boolean | null
          profile_complete?: boolean | null
          program_of_study?: string | null
          status?: Database["public"]["Enums"]["student_status_enum"] | null
          student_id_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_address: string | null
          company_name: string | null
          created_at: string
          department_id: number | null
          email: string
          faculty_id: number | null
          first_name: string
          id: string
          is_active: boolean | null
          job_title: string | null
          last_name: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          staff_id: string | null
          student_id_number: string | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          department_id?: number | null
          email: string
          faculty_id?: number | null
          first_name: string
          id: string
          is_active?: boolean | null
          job_title?: string | null
          last_name: string
          phone_number?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          staff_id?: string | null
          student_id_number?: string | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          department_id?: number | null
          email?: string
          faculty_id?: number | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          staff_id?: string | null
          student_id_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      evaluation_type_enum: "MID_TERM" | "FINAL"
      internship_status_enum:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "IN_PROGRESS"
        | "COMPLETED"
      issue_status_enum: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      student_status_enum: "PENDING" | "ACTIVE" | "INACTIVE"
      submission_status_enum: "PENDING" | "APPROVED" | "REJECTED"
      user_role_enum: "STUDENT" | "LECTURER" | "SUPERVISOR" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
