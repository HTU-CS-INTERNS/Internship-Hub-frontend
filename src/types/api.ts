// General API response structure
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Generic user type
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  update_at: string;
}

// Faculty and Department types
export interface Faculty {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  faculty_id: number;
}

// Payload for creating a user
export type CreateUserPayload = Omit<User, 'id' | 'created_at' | 'update_at'> & { password?: string };

// Payload for updating a user
export type UpdateUserPayload = Partial<CreateUserPayload>;
