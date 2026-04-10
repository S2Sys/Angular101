import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStoreService } from '../services/auth-store.service';

/**
 * ErrorInterceptor - Global Error Handling
 *
 * This interceptor handles HTTP errors globally:
 * - 401 Unauthorized: Clear auth state and redirect to login
 * - 403 Forbidden: User doesn't have permission
 * - 4xx Client Errors: Show error message
 * - 5xx Server Errors: Show generic error message
 *
 * Centralizes error handling across the app
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authStore: AuthStoreService) {}

  /**
   * Intercept HTTP responses and handle errors
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different error status codes
        if (error.status === 401) {
          // Unauthorized: Clear auth state
          this.authStore.logout();
          // Could navigate to login here if needed
        } else if (error.status === 403) {
          // Forbidden: User doesn't have permission
          console.error('Access denied (403):', error.message);
        } else if (error.status === 404) {
          // Not Found
          console.error('Resource not found (404):', error.message);
        } else if (error.status >= 500) {
          // Server Error
          console.error('Server error:', error.message);
        }

        // Log error for debugging
        console.error('HTTP Error:', error);

        // Pass error to the caller
        return throwError(() => error);
      })
    );
  }
}
