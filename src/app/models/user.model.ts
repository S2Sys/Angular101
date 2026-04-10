/**
 * User Model - Represents an authenticated user in the application
 * Mirrors React101's User interface
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

/**
 * Represents the authentication response from the API
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Request payload for login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Request payload for signup/registration
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Internal authentication state stored in AuthStoreService
 * Equivalent to React's AuthContext state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Union type for all possible auth reducer actions
 * Each action represents a state mutation in the auth store
 */
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_RESTORED'; payload: { user: User; token: string } }
  | { type: 'CLEAR_ERROR' };
