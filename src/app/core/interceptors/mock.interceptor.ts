import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { handleMockRequest } from '../mock-api/mock-handlers';

/**
 * MockInterceptor - Development Mock Backend
 *
 * This interceptor intercepts all HTTP requests and routes them to mock handlers
 * instead of making real HTTP calls. This allows development and learning without
 * needing a backend server.
 *
 * In production, this interceptor would be disabled and real HTTP calls would be made.
 *
 * Usage:
 * - All HTTP requests in the app are intercepted
 * - Mock handlers process the request and return mock data
 * - Components receive responses as if from a real server
 */
@Injectable()
export class MockInterceptor implements HttpInterceptor {
  /**
   * Intercept HTTP requests
   * Routes to mock handlers for development/learning
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Log request for debugging
    console.log(`[Mock API] ${req.method} ${req.url}`);

    // Handle mock API requests
    return new Observable((observer) => {
      handleMockRequest(req)
        .then((response) => {
          // Check if response is an error
          if (response instanceof HttpErrorResponse) {
            observer.error(response);
          } else if (response instanceof HttpResponse) {
            // For 204 No Content, emit empty response
            if (response.status === 204) {
              observer.next(response.clone({ body: null }));
            } else {
              observer.next(response);
            }
            observer.complete();
          }
        })
        .catch((error) => {
          observer.error(
            new HttpErrorResponse({
              status: 500,
              statusText: 'Internal Server Error',
              error: error
            })
          );
        });
    });
  }
}
