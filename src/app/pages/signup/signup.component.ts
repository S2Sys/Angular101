import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthStoreService } from '@core/services/auth-store.service';

/**
 * Custom Validator for password matching
 * Ensures password and confirmPassword fields match
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

/**
 * SignupComponent - User Registration Page
 *
 * Handles user registration with email, name, and password.
 * Uses Reactive Forms for form state management with custom validators.
 * Equivalent to React101's SignupPage component.
 *
 * Form Features:
 * - Name validation (required)
 * - Email validation (required, valid email format, unique)
 * - Password validation (required, minimum 6 characters)
 * - Password confirmation (must match password)
 * - Form submission with loading state
 * - Error display
 * - Link to login page
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h1>Sign Up for Angular101</h1>
        <p class="subtitle">Create an account to start learning Angular</p>

        <!-- Signup Form -->
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Enter your full name"
              [class.error]="isFieldInvalid('name')"
              autofocus
            />
            <div class="error-message" *ngIf="isFieldInvalid('name')">
              <span *ngIf="signupForm.get('name').errors?.['required']">
                Name is required
              </span>
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              <span *ngIf="signupForm.get('email').errors?.['required']">
                Email is required
              </span>
              <span *ngIf="signupForm.get('email').errors?.['email']">
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
              placeholder="Enter a password (minimum 6 characters)"
              [class.error]="isFieldInvalid('password')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              <span *ngIf="signupForm.get('password').errors?.['required']">
                Password is required
              </span>
              <span *ngIf="signupForm.get('password').errors?.['minlength']">
                Password must be at least 6 characters
              </span>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              [class.error]="isFieldInvalid('confirmPassword')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
              <span *ngIf="signupForm.get('confirmPassword').errors?.['required']">
                Please confirm your password
              </span>
            </div>
            <div class="error-message" *ngIf="signupForm.get('confirmPassword').touched && signupForm.errors?.['passwordMismatch']">
              <span>Passwords do not match</span>
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
            [disabled]="signupForm.invalid || (loading$ | async)"
          >
            <span *ngIf="!(loading$ | async)">Create Account</span>
            <span *ngIf="loading$ | async">Creating Account...</span>
          </button>
        </form>

        <!-- Link to Login -->
        <p class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .signup-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .signup-card {
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
        box-sizing: border-box;
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

      .login-link {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }

      .login-link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
      }

      .login-link a:hover {
        text-decoration: underline;
      }
    `
  ]
})
export class SignupComponent implements OnInit, OnDestroy {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  /**
   * Reactive form for signup
   * Contains name, email, password, and confirmPassword fields with validators
   */
  signupForm: FormGroup;

  /**
   * Observable streams from AuthStoreService
   */
  loading$ = this.authStore.loading$;
  error$ = this.authStore.error$;

  /**
   * Subject to manage unsubscriptions
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
    // Note: Group validators like passwordMatchValidator apply to multiple fields
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      // Apply custom validator to check password match
      { validators: passwordMatchValidator }
    );
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // Subscribe to authentication state
    // If user successfully signs up, navigate to dashboard
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
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Check if a form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Validate form
    if (this.signupForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signupForm.controls).forEach((key) => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get form values
    const { name, email, password } = this.signupForm.value;

    // Call AuthStoreService.signup()
    this.authStore.signup(email, password, name);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.authStore.clearError();
  }
}
