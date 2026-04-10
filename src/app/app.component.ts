import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent - Root Component
 *
 * The root component of the application. All other components are rendered
 * within this component via the router outlet.
 *
 * Structure:
 * - Shows navbar (when user is authenticated)
 * - RouterOutlet: Where pages are rendered based on route
 * - Error boundary: Global error display (if implemented)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <!-- Root container for the entire application -->
    <div class="app-container">
      <!-- Page content is rendered here based on current route -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class AppComponent {
  title = 'Angular101';
}
