// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  user_name: string;
  user_email: string;
  role_id: string;
  role_name: string;
  employee_id: string;
  employee_name: string;
  created_at: string;
  updated_at: string | null;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  menu_id: string;
  menu_name: string;
  menu_url: string;
}

export interface Session {
  client_id: string;
  session_id: string;
  login_time: string;
  ip_address: string;
  last_activity: string;
}

export interface OAuth {
  authorization_code: string;
  redirect_uri: string;
  expires_in: number;
  sso_token: string;
}

export interface LoginResponseData {
  user: User;
  permissions: Permission[];
  session: Session;
  oauth: OAuth;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  permissions: Permission[];
  session: Session | null;
  oauth: OAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permissionName: string, menuUrl?: string) => boolean;
  // Computed properties for easy access
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Legacy Profile interface for backward compatibility
export interface Profile {
  id?: number;
  username: string;
  name: string;
  email: string;
  isActive?: boolean;
  employee_id?: number;
  roles?: {
    id: number;
    name: string;
    roleCode: string;
  };
}