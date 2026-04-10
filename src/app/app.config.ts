import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { UnsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { MockInterceptor } from './core/interceptors/mock.interceptor';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Application Configuration
 *
 * Provides all the core services, guards, interceptors, and other providers
 * that the Angular application needs to function.
 *
 * Similar to how React provides context providers at the app level.
 *
 * Configured providers:
 * - Router: Client-side routing
 * - HttpClient: HTTP communication (with interceptors)
 * - Animations: Angular animations support
 * - Services: Auth, Notes, Storage services (provided in their decorators)
 * - Guards: Route guards for auth and unsaved changes
 * - Interceptors: Mock API, Auth token injection, Error handling
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // ========================================================================
    // ROUTING
    // ========================================================================
    // Provide the route configuration defined in app.routes.ts
    provideRouter(routes),

    // ========================================================================
    // HTTP CLIENT
    // ========================================================================
    // Provide HttpClient with custom interceptors
    provideHttpClient(
      // We'll manually add interceptors below for better control
      // This uses the new standalone API
    ),

    // ========================================================================
    // INTERCEPTORS
    // These handle HTTP requests/responses globally
    // ========================================================================
    // Order matters: MockInterceptor should be first to intercept requests
    // then AuthInterceptor to add tokens, then ErrorInterceptor to handle errors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    // ========================================================================
    // ROUTE GUARDS
    // ========================================================================
    // Provide guards that can be used in route configuration
    AuthGuard,
    UnsavedChangesGuard,

    // ========================================================================
    // ANIMATIONS
    // ========================================================================
    // Enable Angular animations support
    provideAnimations()

    // ========================================================================
    // SERVICES
    // ========================================================================
    // Services are provided in their @Injectable decorators with providedIn: 'root'
    // This makes them available throughout the application
    // - AuthStoreService (src/app/core/services/auth-store.service.ts)
    // - NotesStoreService (src/app/core/services/notes-store.service.ts)
    // - AuthService (src/app/core/services/auth.service.ts)
    // - NotesService (src/app/core/services/notes.service.ts)
    // - BrowserStorageService (src/app/core/services/browser-storage.service.ts)
  ]
};
