import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AuthStoreService } from '../services/auth-store.service';

/**
 * canActivateAuth Guard Function
 *
 * Functional route guard that checks if the user is authenticated
 * before allowing access to protected routes.
 *
 * Usage in routes:
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [canActivateAuth]
 *   }
 *
 * How it works:
 * 1. Subscribe to isAuthenticated$ from AuthStoreService
 * 2. If user is authenticated, allow access (return true)
 * 3. If user is not authenticated, redirect to login (return false)
 */
export const canActivateAuth: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authStore?: AuthStoreService,
  router?: Router
): Observable<boolean> => {
  // Inject dependencies (Angular will handle this)
  const auth = new AuthGuardImpl().authStore;
  const nav = new AuthGuardImpl().router;

  return auth.isAuthenticated$.pipe(
    take(1),
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        // User not authenticated, redirect to login
        nav.navigate(['/login']);
      }
    })
  );
};

/**
 * AuthGuardImpl - Implementation class for DI
 * Used internally by the guard function
 */
@Injectable({
  providedIn: 'root'
})
class AuthGuardImpl {
  constructor(
    public authStore: AuthStoreService,
    public router: Router
  ) {}
}

/**
 * Alternative: Class-based CanActivate Guard
 * (If you prefer class-based approach)
 *
 * Usage:
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [AuthGuard]
 *   }
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authStore: AuthStoreService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authStore.isAuthenticated$.pipe(
      take(1),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          // User not authenticated, redirect to login
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
