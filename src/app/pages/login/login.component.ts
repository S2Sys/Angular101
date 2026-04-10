import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthStoreService } from '@core/services/auth-store.service';

/**
 * LoginComponent - User Authentication Page
 *
 * Handles user login with email and password.
 * Uses Reactive Forms for form state management.
 * Equivalent to React101's LoginPage component.
 *
 * Form Features:
 * - Email validation (required, valid email format)
 * - Password validation (required, minimum 6 characters)
 * - Form submission with loading state
 * - Error display
 * - Link to signup page
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Login to Angular101</h1>
        <p class="subtitle">Learn Angular with a comprehensive example app</p>

        <!-- Demo Credentials Info -->
        <div class="demo-info">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: <code>demo@example.com</code></p>
          <p>Password: <code>password</code></p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')"
              autofocus
            />
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              <span *ngIf="loginForm.get('email').errors?.['required']">
                Email is required
              </span>
              <span *ngIf="loginForm.get('email').errors?.['email']">
                Please enter a valid email address
              </span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="isFieldInvalid('password')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              <span *ngIf="loginForm.get('password').errors?.['required']">
                Password is required
              </span>
              <span *ngIf="loginForm.get('password').errors?.['minlength']">
                Password must be at least 6 characters
              </span>
            </div>
          </div>

          <!-- Global Error Message -->
          <div class="error-alert" *ngIf="error$ | async as error">
            <p>{{ error }}</p>
            <button type="button" (click)="clearError()">Dismiss</button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary"
            [disabled]="loginForm.invalid || (loading$ | async)"
          >
            <span *ngIf="!(loading$ | async)">Login</span>
            <span *ngIf="loading$ | async">Logging in...</span>
          </button>
        </form>

        <!-- Link to Signup -->
        <p class="signup-link">
          Don't have an account? <a routerLink="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        padding: 40px;
        width: 100%;
        max-width: 400px;
      }

      h1 {
        font-size: 28px;
        margin: 0 0 10px 0;
        color: #333;
      }

      .subtitle {
        color: #666;
        margin: 0 0 20px 0;
        font-size: 14px;
      }

      .demo-info {
        background: #f5f5f5;
        border-left: 4px solid #667eea;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
        font-size: 14px;
      }

      .demo-info p {
        margin: 5px 0;
      }

      .demo-info code {
        background: #fff;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }

      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      input.error {
        border-color: #e74c3c;
      }

      .error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
      }

      .error-alert {
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 20px;
        color: #c33;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .error-alert p {
        margin: 0;
      }

      .error-alert button {
        background: none;
        border: none;
        color: #c33;
        cursor: pointer;
        text-decoration: underline;
        font-size: 12px;
      }

      .btn-primary {
        width: 100%;
        padding: 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-primary:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .signup-link {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }

      .signup-link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
      }

      .signup-link a:hover {
        text-decoration: underline;
      }
    `
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  /**
   * Reactive form for login
   * Contains email and password fields with validators
   */
  loginForm: FormGroup;

  /**
   * Observable streams from AuthStoreService
   * Components subscribe to these to get loading and error states
   */
  loading$ = this.authStore.loading$;
  error$ = this.authStore.error$;

  /**
   * Subject to manage unsubscriptions in ngOnDestroy
   */
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private authStore: AuthStoreService,
    private router: Router
  ) {
    // Initialize form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // Subscribe to authentication state
    // If user successfully logs in, navigate to dashboard
    this.authStore.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          // User authenticated, navigate to dashboard
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Check if a form field is invalid and has been touched
   * Used to show validation error messages
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Handle form submission
   * Called when user clicks the Login button and form is valid
   */
  onSubmit(): void {
    // Validate form before submitting
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get form values
    const { email, password } = this.loginForm.value;

    // Call AuthStoreService.login()
    // This will dispatch AUTH_START, make API call, dispatch AUTH_SUCCESS/ERROR
    this.authStore.login(email, password);
  }

  /**
   * Clear error message
   * Called when user clicks the dismiss button on error message
   */
  clearError(): void {
    this.authStore.clearError();
  }
}
