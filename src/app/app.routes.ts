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
  // LEARNING EXAMPLES ROUTES (Public, for learning)
  // ============================================================================

  {
    path: 'examples',
    loadComponent: () =>
      import('@pages/examples/examples.component').then((m) => m.ExamplesComponent),
    data: { title: 'Learning Examples' },
    children: [
      {
        path: 'parent-child',
        loadComponent: () =>
          import('@pages/examples/parent-child.component').then((m) => m.ParentChildComponent),
        data: { title: 'Parent to Child' }
      },
      {
        path: 'child-parent',
        loadComponent: () =>
          import('@pages/examples/child-parent.component').then((m) => m.ChildParentComponent),
        data: { title: 'Child to Parent' }
      },
      {
        path: 'siblings',
        loadComponent: () =>
          import('@pages/examples/siblings.component').then((m) => m.SiblingsComponent),
        data: { title: 'Sibling Communication' }
      },
      {
        path: 'global-state',
        loadComponent: () =>
          import('@pages/examples/global-state.component').then((m) => m.GlobalStateComponent),
        data: { title: 'Global State' }
      },
      {
        path: 'observables',
        loadComponent: () =>
          import('@pages/examples/observables.component').then((m) => m.ObservablesComponent),
        data: { title: 'Observable Patterns' }
      },
      {
        path: '',
        redirectTo: 'parent-child',
        pathMatch: 'full'
      }
    ]
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
