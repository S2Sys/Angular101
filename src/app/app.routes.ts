import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UnsavedChangesGuard, canDeactivateUnsavedChanges } from './core/guards/unsaved-changes.guard';

/**
 * Application Routes Configuration
 *
 * Defines all routes in the application with their components and guards.
 * Similar to React Router in React101.
 *
 * Route structure:
 * - Public routes: /login, /signup (accessible without authentication)
 * - Protected routes: /dashboard, /notes/:id, /profile, /settings (require authentication)
 * - Default route: / redirects to /dashboard
 * - Catch-all: /* redirects to /dashboard
 */
export const routes: Routes = [
  // ============================================================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================================================

  {
    path: 'login',
    loadComponent: () =>
      import('@pages/login/login.component').then((m) => m.LoginComponent),
    data: { title: 'Login' }
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('@pages/signup/signup.component').then((m) => m.SignupComponent),
    data: { title: 'Sign Up' }
  },

  // ============================================================================
  // PROTECTED ROUTES (Require authentication)
  // ============================================================================

  {
    path: 'dashboard',
    loadComponent: () =>
      import('@pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' }
  },

  {
    path: 'notes/:id',
    loadComponent: () =>
      import('@pages/note-detail/note-detail.component').then(
        (m) => m.NoteDetailComponent
      ),
    canActivate: [AuthGuard],
    canDeactivate: [canDeactivateUnsavedChanges],
    data: { title: 'Note' }
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('@pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
    data: { title: 'Profile' }
  },

  {
    path: 'settings',
    loadComponent: () =>
      import('@pages/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [AuthGuard],
    data: { title: 'Settings' }
  },

  // ============================================================================
  // DEFAULT & CATCH-ALL ROUTES
  // ============================================================================

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
