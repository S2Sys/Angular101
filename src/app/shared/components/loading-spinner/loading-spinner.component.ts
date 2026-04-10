import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent - Loading Indicator
 *
 * Displays a loading spinner when data is being fetched or
 * an operation is in progress.
 *
 * Usage:
 *   <app-loading-spinner [isLoading]="loading$ | async"></app-loading-spinner>
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" *ngIf="isLoading">
      <div class="spinner"></div>
      <p class="loading-text">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        gap: 15px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .loading-text {
        color: #666;
        font-size: 14px;
        margin: 0;
      }
    `
  ]
})
export class LoadingSpinnerComponent {
  /**
   * Whether to show the spinner
   */
  @Input() isLoading: boolean = false;

  /**
   * Optional loading message
   */
  @Input() message: string = 'Loading...';
}
