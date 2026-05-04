import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

interface Theme {
  name: string;
  primary: string;
  secondary: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeStoreService {
  private themeSubject = new BehaviorSubject<Theme>({
    name: 'Light',
    primary: '#0066cc',
    secondary: '#00cc66'
  });

  theme$ = this.themeSubject.asObservable();

  setTheme(theme: Theme) {
    this.themeSubject.next(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }
}

@Component({
  selector: 'app-global-state-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example">
      <h1>🌍 Client to Client Communication (Global State)</h1>

      <div class="explanation">
        <h3>How It Works</h3>
        <p>
          Components communicate through a <strong>centralized store service</strong>.
          Any component can read and update state. All subscribers see the changes immediately.
        </p>
        <code>this.store.property\$ = observable of state</code>
        <code>this.store.updateProperty() = dispatch action</code>
      </div>

      <div class="example-content">
        <app-theme-selector [store]="store"></app-theme-selector>
        <app-theme-preview [store]="store"></app-theme-preview>
        <app-theme-display [store]="store"></app-theme-display>
      </div>

      <div class="code-example">
        <h3>Code Example</h3>
        <div class="code-block">
          <p><strong>Global Store Service:</strong></p>
          <pre><code>{{ storeCode }}</code></pre>
        </div>
        <div class="code-block">
          <p><strong>Component Using Store:</strong></p>
          <pre><code>{{ componentCode }}</code></pre>
        </div>
      </div>

      <div class="key-points">
        <h3>Key Points</h3>
        <ul>
          <li>✅ Centralized state management</li>
          <li>✅ Any component can read/update state</li>
          <li>✅ All subscribers notified of changes instantly</li>
          <li>✅ Use BehaviorSubject for state that needs initial value</li>
          <li>✅ Scales to large apps with NgRx or Akita</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example {
      max-width: 1000px;
    }

    .explanation {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .explanation code {
      display: block;
      background: #fff;
      padding: 8px;
      margin: 8px 0;
      border-radius: 3px;
      font-family: monospace;
      color: #d73a49;
    }

    .example-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }

    .code-example {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      overflow-x: auto;
    }

    .code-block {
      margin-bottom: 20px;
    }

    .code-block p {
      color: #4fc3f7;
      font-weight: bold;
      margin: 0 0 10px;
    }

    .code-example pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.4;
    }

    .key-points {
      background: #fff3cd;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .key-points ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .key-points li {
      margin: 8px 0;
    }

    @media (max-width: 1024px) {
      .example-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GlobalStateComponent {
  store = new ThemeStoreService();

  storeCode = `@Injectable({ providedIn: 'root' })
export class ThemeStoreService {
  private themeSubject =
    new BehaviorSubject<Theme>({ ... });

  theme\$ = this.themeSubject.asObservable();

  setTheme(theme: Theme) {
    this.themeSubject.next(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }
}`;

  componentCode = `// Any component in app
@Component({...})
export class MyComponent {
  theme\$: Observable<Theme>;

  constructor(private store: ThemeStoreService) {
    this.theme\$ = this.store.theme\$;
  }

  changeTheme(newTheme: Theme) {
    this.store.setTheme(newTheme);
  }
}`;
}

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <h3>🎨 Theme Selector (Dispatcher)</h3>
      <div class="theme-buttons">
        <button
          *ngFor="let t of themes"
          (click)="selectTheme(t)"
          [style.background]="t.primary"
          [style.color]="getContrastColor(t.primary)"
        >
          {{ t.name }}
        </button>
      </div>
      <p class="current">
        Current: <strong>{{ (store.theme\$ | async)?.name }}</strong>
      </p>
    </section>
  `,
  styles: [`
    .card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .card h3 {
      margin-top: 0;
    }

    .theme-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
    }

    .theme-buttons button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }

    .theme-buttons button:hover {
      transform: scale(1.02);
    }

    .current {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class ThemeSelectorComponent {
  themes: Theme[] = [
    { name: 'Light', primary: '#0066cc', secondary: '#00cc66' },
    { name: 'Dark', primary: '#1e1e1e', secondary: '#00ff00' },
    { name: 'Sunset', primary: '#ff6b35', secondary: '#f7931e' },
    { name: 'Ocean', primary: '#0077b6', secondary: '#00b4d8' }
  ];

  constructor(public store: ThemeStoreService) {}

  selectTheme(theme: Theme) {
    this.store.setTheme(theme);
  }

  getContrastColor(hex: string): string {
    return ['#0066cc', '#0077b6'].includes(hex) ? 'white' : 'black';
  }
}

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card" [ngStyle]="getStyles()">
      <h3>👁️ Theme Preview</h3>
      <div class="preview-content">
        <div class="preview-box">
          <h4>Primary Color</h4>
          <div class="color-swatch" [style.background]="(store.theme\$ | async)?.primary"></div>
        </div>
        <div class="preview-box">
          <h4>Secondary Color</h4>
          <div class="color-swatch" [style.background]="(store.theme\$ | async)?.secondary"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
      transition: all 0.3s ease;
    }

    .card h3 {
      margin-top: 0;
    }

    .preview-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .preview-box {
      text-align: center;
    }

    .preview-box h4 {
      margin: 0 0 10px;
      font-size: 12px;
      color: #666;
    }

    .color-swatch {
      width: 100%;
      height: 80px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
  `]
})
export class ThemePreviewComponent {
  constructor(public store: ThemeStoreService) {}

  getStyles() {
    const theme = this.store.getCurrentTheme();
    return {
      'background-color': theme.primary + '20',
      'border-color': theme.primary
    };
  }
}

@Component({
  selector: 'app-theme-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card" [ngStyle]="getStyles()">
      <h3>📊 Theme Display</h3>
      <ng-container *ngIf="store.theme\$ | async as theme">
        <div class="theme-info">
          <p><strong>Name:</strong> {{ theme.name }}</p>
          <p><strong>Primary:</strong> {{ theme.primary }}</p>
          <p><strong>Secondary:</strong> {{ theme.secondary }}</p>
        </div>
      </ng-container>
      <div class="component-grid">
        <button [style.background]="(store.theme\$ | async)?.primary" [style.color]="getTextColor()">
          Action Button
        </button>
        <button [style.background]="(store.theme\$ | async)?.secondary" [style.color]="getTextColor()">
          Secondary Button
        </button>
      </div>
    </section>
  `,
  styles: [`
    .card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
      transition: all 0.3s ease;
    }

    .card h3 {
      margin-top: 0;
    }

    .theme-info {
      background: white;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .theme-info p {
      margin: 6px 0;
      color: #666;
    }

    .component-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }

    button:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  `]
})
export class ThemeDisplayComponent {
  constructor(public store: ThemeStoreService) {}

  getStyles() {
    const theme = this.store.getCurrentTheme();
    return {
      'background-color': theme.secondary + '20',
      'border-color': theme.secondary
    };
  }

  getTextColor(): string {
    return 'white';
  }
}
