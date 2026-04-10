import { Injectable } from '@angular/core';
import { CanDeactivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Interface for components that can be deactivated with a warning
 * Component must implement this interface to use the UnsavedChangesGuard
 */
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * canDeactivateUnsavedChanges Guard Function
 *
 * Functional route guard that warns the user before leaving a page
 * with unsaved changes.
 *
 * Usage:
 * 1. In component, implement CanComponentDeactivate interface
 * 2. Implement canDeactivate() method that returns boolean
 * 3. Add guard to route: canDeactivate: [canDeactivateUnsavedChanges]
 *
 * Example in component:
 *   implements CanComponentDeactivate {
 *     canDeactivate(): boolean {
 *       return this.form.pristine; // Allow leave if form unchanged
 *     }
 *   }
 */
export const canDeactivateUnsavedChanges: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  return component ? component.canDeactivate() : true;
};

/**
 * Alternative: Class-based CanDeactivate Guard
 * (If you prefer class-based approach)
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard {
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    return component ? component.canDeactivate() : true;
  }
}
