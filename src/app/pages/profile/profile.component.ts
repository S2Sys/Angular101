import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthStoreService } from '@core/services/auth-store.service';

/**
 * ProfileComponent - User Profile Page
 *
 * Displays current user's profile information.
 * Placeholder for now - can be expanded to edit profile, change password, etc.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="profile-container">
      <div class="profile-card">
        <h1>My Profile</h1>

        <div class="profile-info" *ngIf="currentUser$ | async as user">
          <div class="info-group">
            <label>Name</label>
            <p>{{ user.name }}</p>
          </div>

          <div class="info-group">
            <label>Email</label>
            <p>{{ user.email }}</p>
          </div>

          <div class="info-group">
            <label>Member Since</label>
            <p>{{ formatDate(user.createdAt) }}</p>
          </div>
        </div>

        <p class="placeholder-text">
          Profile editing coming soon!
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .profile-card {
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      h1 {
        margin: 0 0 30px 0;
        font-size: 28px;
        color: #333;
      }

      .profile-info {
        display: grid;
        gap: 20px;
        margin-bottom: 30px;
      }

      .info-group {
        border-bottom: 1px solid #f5f5f5;
        padding-bottom: 15px;
      }

      .info-group:last-child {
        border-bottom: none;
      }

      label {
        display: block;
        font-weight: 500;
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      p {
        margin: 0;
        color: #333;
        font-size: 16px;
      }

      .placeholder-text {
        color: #999;
        font-size: 14px;
        text-align: center;
      }
    `
  ]
})
export class ProfileComponent {
  currentUser$ = this.authStore.currentUser$;

  constructor(private authStore: AuthStoreService) {}

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
