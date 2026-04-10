import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ErrorDisplayComponent - Error Message Display
 *
 * Displays error messages in a user-friendly way.
 * Components can emit event when user dismisses the error.
 *
 * Usage:
 *   <app-error-display
 *     [error]="error$ | async"
 *     (dismiss)="onDismissError()">
 *   </app-error-display>
 */
@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="error">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <div class="error-content">
          <p class="error-text">{{ error }}</p>
        </div>
        <button class="btn-close" (click)="onDismiss()" aria-label="Dismiss error">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        margin-bottom: 20px;
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

      .error-message {
        background: #fee;
        border: 1px solid #fcc;
        border-left: 4px solid #e74c3c;
        border-radius: 4px;
        padding: 15px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .error-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .error-content {
        flex: 1;
      }

      .error-text {
        margin: 0;
        color: #c33;
        font-size: 14px;
        line-height: 1.5;
      }

      .btn-close {
        background: none;
        border: none;
        color: #c33;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        flex-shrink: 0;
        transition: color 0.3s;
      }

      .btn-close:hover {
        color: #a22;
      }
    `
  ]
})
export class ErrorDisplayComponent {
  /**
   * The error message to display
   */
  @Input() error: string | null = null;

  /**
   * Emitted when user dismisses the error
   */
  @Output() dismiss = new EventEmitter<void>();

  /**
   * Handle dismiss button click
   */
  onDismiss(): void {
    this.dismiss.emit();
  }
}
