import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { BrowserStorageService } from '@core/services/browser-storage.service';

/**
 * SettingsComponent - User Settings and Preferences Page
 *
 * Allows users to configure app preferences like theme, notifications, etc.
 * Currently placeholder - can be expanded with more settings.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="settings-container">
      <div class="settings-card">
        <h1>Settings</h1>

        <form [formGroup]="settingsForm" (ngSubmit)="onSave()">
          <!-- Theme Setting -->
          <div class="setting-group">
            <label>
              <input
                type="checkbox"
                formControlName="darkMode"
                (change)="onDarkModeChange()">
              Enable Dark Mode
            </label>
            <p class="setting-description">
              Use dark theme for better visibility at night
            </p>
          </div>

          <!-- Notifications Setting -->
          <div class="setting-group">
            <label>
              <input
                type="checkbox"
                formControlName="notifications"
                disabled>
              Enable Notifications
            </label>
            <p class="setting-description">
              Receive notifications for note updates (Coming soon)
            </p>
          </div>

          <!-- Export Data -->
          <div class="setting-group">
            <button type="button" class="btn-secondary" (click)="onExportData()">
              Export All Data
            </button>
            <p class="setting-description">
              Download a backup of all your notes and data
            </p>
          </div>

          <!-- Clear Cache -->
          <div class="setting-group">
            <button
              type="button"
              class="btn-secondary"
              (click)="onClearCache()">
              Clear Cache
            </button>
            <p class="setting-description">
              Remove cached data from this device
            </p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Save Settings</button>
          </div>
        </form>

        <div class="success-message" *ngIf="showSuccess">
          ✓ Settings saved successfully
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .settings-card {
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

      form {
        margin-bottom: 20px;
      }

      .setting-group {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #f5f5f5;
      }

      .setting-group:last-of-type {
        border-bottom: none;
      }

      label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        color: #333;
        cursor: pointer;
        font-weight: 500;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      input[type="checkbox"]:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .setting-description {
        margin: 8px 0 0 30px;
        color: #999;
        font-size: 14px;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 30px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-primary {
        background: #667eea;
        color: white;
        flex: 1;
      }

      .btn-primary:hover {
        background: #5568d3;
      }

      .btn-secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        flex: 1;
      }

      .btn-secondary:hover {
        background: #eee;
      }

      .success-message {
        background: #e8f8f5;
        border: 1px solid #a3e4d7;
        border-left: 4px solid #27ae60;
        color: #27ae60;
        padding: 12px;
        border-radius: 4px;
        font-size: 14px;
        animation: slideIn 0.3s ease-in;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private storage: BrowserStorageService
  ) {
    this.settingsForm = this.fb.group({
      darkMode: [false],
      notifications: [false]
    });
  }

  ngOnInit(): void {
    // Load saved settings
    const settings = this.storage.getItem('appSettings');
    if (settings) {
      this.settingsForm.patchValue(settings);
    }
  }

  onDarkModeChange(): void {
    const isDarkMode = this.settingsForm.get('darkMode').value;
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  onSave(): void {
    const settings = this.settingsForm.value;
    this.storage.setItem('appSettings', settings);

    // Show success message
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  onExportData(): void {
    alert('Export functionality coming soon!');
  }

  onClearCache(): void {
    if (confirm('Are you sure? This will clear all cached data.')) {
      this.storage.clear();
      alert('Cache cleared');
    }
  }
}
