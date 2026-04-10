import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthAction, AuthState, User } from '@models/user.model';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';

/**
 * AuthStoreService - Authentication State Management
 *
 * This service manages all authentication-related state using BehaviorSubject
 * and a reducer pattern. It's equivalent to React101's AuthContext with useReducer.
 *
 * Key concepts:
 * - BehaviorSubject: Like useState but observable (reactive)
 * - Reducer pattern: Dispatch actions to update state (like useReducer)
 * - Observable streams: Components subscribe to state changes
 *
 * Usage:
 *   constructor(private authStore: AuthStoreService) {}
 *   currentUser$ = this.authStore.currentUser$;
 *   isAuthenticated$ = this.authStore.isAuthenticated$;
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStoreService {
  // ============================================================================
  // STATE (BehaviorSubjects - similar to useState in React)
  // ============================================================================

  /**
   * Current authenticated user
   * Emits User | null
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Authentication status
   * Emits boolean: true if user is logged in
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Loading state during auth operations
   * Emits boolean: true while login/signup in progress
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  /**
   * Error message from auth operations
   * Emits string | null: Error message or null if no error
   */
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  /**
   * JWT Token for API authentication
   * Emits string | null: JWT token or null if not authenticated
   */
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  // ============================================================================
  // CONSTRUCTOR & INITIALIZATION
  // ============================================================================

  constructor(
    private authService: AuthService,
    private storage: BrowserStorageService
  ) {
    // Auto-restore session from localStorage when app initializes
    this.restoreSession();
  }

  // ============================================================================
  // PUBLIC API METHODS (equivalent to React context methods)
  // ============================================================================

  /**
   * Login with email and password
   * Dispatches AUTH_START → API call → AUTH_SUCCESS/ERROR
   *
   * @param email - User's email
   * @param password - User's password
   */
  login(email: string, password: string): void {
    // Step 1: Dispatch AUTH_START (set loading = true)
    this.dispatch({ type: 'AUTH_START' });

    // Step 2: Call AuthService.login() which makes HTTP request
    this.authService.login(email, password).subscribe({
      // Step 3a: On success, dispatch AUTH_SUCCESS with user and token
      next: (response) => {
        // Save token and user to localStorage for persistence
        this.storage.setItem('authToken', response.token);
        this.storage.setItem('currentUser', response.user);

        // Update state via reducer
        this.dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token: response.token }
        });
      },

      // Step 3b: On error, dispatch AUTH_ERROR
      error: (err) => {
        const errorMessage =
          err?.error?.message || 'Login failed. Please check your credentials.';
        this.dispatch({
          type: 'AUTH_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Register a new user with signup
   * Similar flow to login: START → API call → SUCCESS/ERROR
   *
   * @param email - User's email
   * @param password - User's password
   * @param name - User's full name
   */
  signup(email: string, password: string, name: string): void {
    this.dispatch({ type: 'AUTH_START' });

    this.authService.signup(email, password, name).subscribe({
      next: (response) => {
        this.storage.setItem('authToken', response.token);
        this.storage.setItem('currentUser', response.user);

        this.dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token: response.token }
        });
      },

      error: (err) => {
        const errorMessage =
          err?.error?.message ||
          'Signup failed. Please check your information and try again.';
        this.dispatch({
          type: 'AUTH_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Logout the current user
   * Clears all auth state and localStorage
   */
  logout(): void {
    // Clear tokens and user data from localStorage
    this.storage.removeItem('authToken');
    this.storage.removeItem('currentUser');

    // Update state: LOGOUT action clears all auth fields
    this.dispatch({ type: 'LOGOUT' });
  }

  /**
   * Clear error message
   * Used by UI components to dismiss error notifications
   */
  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' });
  }

  /**
   * Get the current token value synchronously
   * @returns JWT token or null
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Restore authenticated session from localStorage on app initialization
   * Checks if a stored token exists and is still valid
   */
  private restoreSession(): void {
    const storedToken = this.storage.getItem<string>('authToken');
    const storedUser = this.storage.getItem<User>('currentUser');

    // If we have both token and user in storage, consider session restored
    if (storedToken && storedUser) {
      this.dispatch({
        type: 'SESSION_RESTORED',
        payload: { user: storedUser, token: storedToken }
      });

      // Optionally validate token with backend (optional enhancement)
      // this.authService.validateToken().subscribe(
      //   isValid => {
      //     if (!isValid) {
      //       this.logout();
      //     }
      //   }
      // );
    }
  }

  /**
   * Dispatch an action to the reducer
   * This updates state and notifies all subscribers
   *
   * @param action - The action to dispatch (type + optional payload)
   */
  private dispatch(action: AuthAction): void {
    // Get current state
    const currentState: AuthState = {
      user: this.currentUserSubject.value,
      token: this.tokenSubject.value,
      isAuthenticated: this.isAuthenticatedSubject.value,
      loading: this.loadingSubject.value,
      error: this.errorSubject.value
    };

    // Apply reducer to get new state
    const newState = this.authReducer(currentState, action);

    // Update all BehaviorSubjects with new state values
    // This triggers all subscribers to receive the new values
    this.currentUserSubject.next(newState.user);
    this.tokenSubject.next(newState.token);
    this.isAuthenticatedSubject.next(newState.isAuthenticated);
    this.loadingSubject.next(newState.loading);
    this.errorSubject.next(newState.error);
  }

  /**
   * Reducer function - Pure function that takes current state and action,
   * returns new state (similar to React's useReducer)
   *
   * @param state - Current authentication state
   * @param action - Action to apply
   * @returns New state
   */
  private authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
      // AUTH_START: User initiated login/signup
      case 'AUTH_START':
        return {
          ...state,
          loading: true,
          error: null
        };

      // AUTH_SUCCESS: Login/signup completed successfully
      case 'AUTH_SUCCESS':
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
          error: null
        };

      // AUTH_ERROR: Login/signup failed
      case 'AUTH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload,
          isAuthenticated: false
        };

      // LOGOUT: User logged out or session expired
      case 'LOGOUT':
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        };

      // SESSION_RESTORED: Session restored from localStorage on app init
      case 'SESSION_RESTORED':
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
          error: null
        };

      // CLEAR_ERROR: Clear error message
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: null
        };

      // Default case: return state unchanged (required for exhaustiveness)
      default:
        return state;
    }
  }
}
