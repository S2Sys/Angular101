import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, SignupRequest } from '@models/user.model';

/**
 * AuthService - API Communication for Authentication
 *
 * This service handles all HTTP calls related to authentication.
 * It's separate from AuthStoreService to maintain clean separation of concerns:
 * - AuthService: HTTP API calls and data fetching
 * - AuthStoreService: State management and business logic
 *
 * In development, HTTP calls are intercepted by MockInterceptor
 * In production, this would make real HTTP requests to the backend
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API endpoints (intercepted by mock API in development)
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * Login with email and password
   * Returns an Observable of AuthResponse containing user and JWT token
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Observable<AuthResponse> containing user and token
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  /**
   * Register a new user account
   * Returns an Observable of AuthResponse containing new user and JWT token
   *
   * @param email - User's email address
   * @param password - User's password (will be hashed on backend)
   * @param name - User's full name
   * @returns Observable<AuthResponse> containing user and token
   */
  signup(email: string, password: string, name: string): Observable<AuthResponse> {
    const request: SignupRequest = { email, password, name };
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request);
  }

  /**
   * Validate if the current JWT token is still valid
   * Used to restore session on app initialization
   *
   * @returns Observable<boolean> - true if token is valid, false otherwise
   */
  validateToken(): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/validate-token`, {});
  }

  /**
   * Get the currently authenticated user's profile
   * Called after successful login to get full user details
   *
   * @returns Observable<any> containing full user profile
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  /**
   * Update the current user's profile information
   * Called from settings page to update user details
   *
   * @param profileData - Partial user data to update
   * @returns Observable<any> containing updated user profile
   */
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }
}
