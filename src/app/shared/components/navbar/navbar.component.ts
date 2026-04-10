import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthStoreService } from '@core/services/auth-store.service';

/**
 * NavbarComponent - Application Navigation Bar
 *
 * Displays the main navigation for the application.
 * Shows different navigation based on authentication status.
 *
 * Features:
 * - Logo/app name
 * - Navigation links (dashboard, profile, settings)
 * - Current user name
 * - Logout button
 * - Responsive menu
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo/Brand -->
        <div class="navbar-brand">
          <a routerLink="/" class="logo">
            <span class="logo-icon">📚</span>
            Angular101
          </a>
        </div>

        <!-- Navigation Links -->
        <ul class="nav-links" *ngIf="currentUser$ | async as user">
          <li><a routerLink="/dashboard" routerLinkActive="active">Notes</a></li>
          <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
          <li><a routerLink="/settings" routerLinkActive="active">Settings</a></li>
        </ul>

        <!-- User Section -->
        <div class="navbar-user" *ngIf="currentUser$ | async as user">
          <span class="user-name">{{ user.name }}</span>
          <button class="btn-logout" (click)="onLogout()">Logout</button>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .navbar-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        height: 70px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .navbar-brand {
        display: flex;
        align-items: center;
      }

      .logo {
        color: white;
        text-decoration: none;
        font-size: 24px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .logo-icon {
        font-size: 28px;
      }

      .nav-links {
        display: flex;
        list-style: none;
        gap: 30px;
        margin: 0;
        padding: 0;
        flex: 1;
        justify-content: center;
      }

      .nav-links a {
        color: white;
        text-decoration: none;
        font-size: 15px;
        transition: opacity 0.3s;
        padding: 8px 0;
        border-bottom: 2px solid transparent;
      }

      .nav-links a:hover {
        opacity: 0.8;
      }

      .nav-links a.active {
        border-bottom: 2px solid white;
      }

      .navbar-user {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
      }

      .btn-logout {
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      @media (max-width: 768px) {
        .nav-links {
          gap: 15px;
        }

        .navbar-user {
          gap: 10px;
        }

        .user-name {
          display: none;
        }
      }
    `
  ]
})
export class NavbarComponent {
  /**
   * Observable of current authenticated user
   */
  currentUser$ = this.authStore.currentUser$;

  constructor(
    private authStore: AuthStoreService,
    private router: Router
  ) {}

  /**
   * Handle logout button click
   */
  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
