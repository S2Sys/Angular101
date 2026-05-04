import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-examples',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="examples-container">
      <aside class="examples-sidebar">
        <h2>Learning Examples</h2>
        <nav class="examples-nav">
          <a routerLink="parent-child" class="nav-link">
            📤 Parent → Child (@Input)
          </a>
          <a routerLink="child-parent" class="nav-link">
            📥 Child → Parent (@Output)
          </a>
          <a routerLink="siblings" class="nav-link">
            👥 Sibling Communication
          </a>
          <a routerLink="global-state" class="nav-link">
            🌍 Client → Client (Store)
          </a>
          <a routerLink="observables" class="nav-link">
            ⚡ Observable Patterns
          </a>
        </nav>
      </aside>

      <main class="examples-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .examples-container {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 20px;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .examples-sidebar {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .examples-sidebar h2 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
    }

    .examples-nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nav-link {
      padding: 12px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      color: #0066cc;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-link:hover {
      background: #e8f0fe;
      border-color: #0066cc;
    }

    .nav-link.active {
      background: #0066cc;
      color: white;
      border-color: #0066cc;
    }

    .examples-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    @media (max-width: 768px) {
      .examples-container {
        grid-template-columns: 1fr;
      }

      .examples-sidebar {
        position: static;
      }

      .examples-nav {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .nav-link {
        flex: 1;
        min-width: 120px;
      }
    }
  `]
})
export class ExamplesComponent {}
