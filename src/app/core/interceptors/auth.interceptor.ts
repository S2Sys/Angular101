import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStoreService } from '../services/auth-store.service';

/**
 * AuthInterceptor - JWT Token Injection
 *
 * This interceptor automatically adds the JWT token to all HTTP requests
 * by reading from the Authorization header.
 *
 * How it works:
 * 1. Intercepts every HTTP request
 * 2. Gets the current JWT token from AuthStoreService
 * 3. Adds Authorization: Bearer <token> header if token exists
 * 4. Passes the modified request to the next handler
 *
 * Similar to React101's API token handling
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authStore: AuthStoreService) {}

  /**
   * Intercept HTTP requests and add JWT token
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get current JWT token
    const token = this.authStore.getToken();

    // If token exists, add it to request headers
    if (token) {
      // Clone the request and add Authorization header
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Pass the request to the next handler
    return next.handle(req);
  }
}
