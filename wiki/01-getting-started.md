# Angular101 - Complete Getting Started Guide

Master the fundamentals of Angular with this comprehensive getting-started guide covering setup, core concepts, components, and templates.

## Table of Contents
1. [Quick Setup](#quick-setup)
2. [Angular Fundamentals](#angular-fundamentals)
3. [Components Deep Dive](#components-deep-dive)
4. [Templates & Data Binding](#templates--data-binding)
5. [Services & Dependency Injection](#services--dependency-injection)
6. [Routing Basics](#routing-basics)
7. [Project Structure](#project-structure)

---

## Quick Setup

### What is Angular101?

A complete, production-ready Angular 19+ learning application demonstrating all core concepts through a practical Notes management app.

**Key Features:**
- ✅ User authentication (login/signup)
- ✅ Complete CRUD operations
- ✅ Real-time search and filtering
- ✅ Responsive UI design
- ✅ Mock API backend (no server needed)
- ✅ Full TypeScript with strict mode

### Installation

**Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm or yarn
- VS Code recommended

**Steps:**
```bash
cd Angular101
npm install
npm start
```

The app opens at `http://localhost:4200/`

**Demo Login:**
- Email: `demo@example.com`
- Password: `password`

---

## Angular Fundamentals

### What is Angular?

Angular is a complete framework for building web applications with:
- **TypeScript**: Type-safe development
- **Components**: Reusable UI building blocks
- **Services**: Shared business logic
- **Routing**: Client-side navigation
- **Forms**: Reactive form handling
- **HTTP Client**: API communication
- **Dependency Injection**: Loose coupling and testability

### Key Concepts

| Concept | What It Does | Example |
|---------|-------------|---------|
| **Component** | Self-contained UI piece | `<app-note-card>` |
| **Service** | Shared business logic | `NotesService` |
| **Directive** | Modify DOM elements | `*ngIf`, `*ngFor` |
| **Pipe** | Transform data in template | `{{ date \| date:'short' }}` |
| **Router** | Navigate between pages | `/dashboard`, `/profile` |
| **Guard** | Protect routes | `AuthGuard` |
| **Interceptor** | Transform HTTP requests | Add auth headers |
| **Module** | Group related features | (Standalone preferred now) |

---

## Components Deep Dive

### What is a Component?

A component is a self-contained piece of the UI with:
- **Template**: HTML defining the view
- **Class**: TypeScript with logic and properties
- **Styles**: CSS scoped to the component
- **Metadata**: Configuration via decorators

### Component Structure

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',           // Used like: <app-hello></app-hello>
  standalone: true,                // Modern Angular (no modules)
  imports: [CommonModule],         // Import dependencies
  template: '<h1>{{title}}</h1>',  // Or templateUrl for separate file
  styles: ['h1 { color: blue; }']  // Or styleUrls for separate file
})
export class HelloComponent {
  title = 'Hello Angular!';
}
```

### Real Example: NoteCardComponent

From `src/app/shared/components/note-card/note-card.component.ts`:

```typescript
@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="note-card" *ngIf="note">
      <h3 class="note-title">{{ note.title }}</h3>
      <p class="note-content">{{ getContentPreview() }}</p>
      <div class="note-actions">
        <button (click)="onDelete()">Delete</button>
      </div>
    </div>
  `,
  styles: [...]
})
export class NoteCardComponent {
  @Input() note!: Note;           // Input from parent
  @Output() delete = new EventEmitter<string>();  // Output to parent
  
  onDelete(): void {
    this.delete.emit(this.note.id);
  }
}
```

### Component Lifecycle

Angular calls special methods at key points in a component's lifecycle:

| Hook | When | Use Case |
|------|------|----------|
| `ngOnInit()` | After inputs initialized | Fetch data, setup |
| `ngOnChanges()` | When @Input changes | React to input changes |
| `ngOnDestroy()` | Before component destroyed | Cleanup subscriptions |
| `ngAfterViewInit()` | After view rendered | Access DOM elements |

**Example:**
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Called once when component initializes
    this.loadData();
  }

  ngOnDestroy() {
    // Called when component is destroyed
    this.destroy$.next();
  }
}
```

---

## Templates & Data Binding

### Four Types of Data Binding

#### 1. **Interpolation** (View gets data)
```html
<p>{{ message }}</p>
<p>{{ 1 + 2 }}</p>
<p>{{ getTitle() }}</p>
```

#### 2. **Property Binding** (View gets data)
```html
<img [src]="imageUrl">
<button [disabled]="isLoading">Click me</button>
<app-child [data]="parentData"></app-child>
```

#### 3. **Event Binding** (View sends event)
```html
<button (click)="onButtonClick()">Click me</button>
<input (keyup)="onKeyUp($event)">
<form (ngSubmit)="onFormSubmit()">
```

#### 4. **Two-Way Binding** (Data goes both ways)
```html
<input [(ngModel)]="name">
<!-- Equivalent to: -->
<input [ngModel]="name" (ngModelChange)="name = $event">
```

### Built-in Directives

#### Structural Directives (Change DOM structure)
```html
<!-- *ngIf - Show/hide element -->
<div *ngIf="isVisible">Visible</div>

<!-- *ngFor - Loop over array -->
<div *ngFor="let item of items">{{ item }}</div>

<!-- *ngSwitch - Conditional rendering -->
<div [ngSwitch]="status">
  <p *ngSwitchCase="'pending'">Pending...</p>
  <p *ngSwitchCase="'done'">Done!</p>
  <p *ngSwitchDefault>Unknown</p>
</div>
```

#### Attribute Directives (Modify element properties)
```html
<!-- [ngClass] - Dynamic classes -->
<div [ngClass]="{'active': isActive, 'disabled': isDisabled}">
  Text
</div>

<!-- [ngStyle] - Dynamic styles -->
<div [ngStyle]="{'color': textColor, 'font-size': fontSize + 'px'}">
  Text
</div>

<!-- [disabled] - Property binding -->
<button [disabled]="isLoading">Submit</button>
```

---

## Services & Dependency Injection

### What is a Service?

A service is a reusable class that contains business logic, can be shared across components, and is injected where needed.

**Why use services?**
- ✅ Share logic between components
- ✅ Separate concerns (UI vs Logic)
- ✅ Easy to test
- ✅ Easy to mock

### Creating a Service

```typescript
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})  // Available app-wide
export class NoteService {
  private notes: Note[] = [];

  getNotes(): Observable<Note[]> {
    return from(this.notes);
  }

  createNote(note: Note): Observable<Note> {
    this.notes.push(note);
    return of(note);
  }
}
```

### Using Services (Dependency Injection)

```typescript
export class DashboardComponent {
  notes$ = this.notesService.getNotes();

  constructor(private notesService: NoteService) {
    // NoteService automatically injected
  }
}
```

### Real Example: NotesStoreService

From `src/app/core/services/notes-store.service.ts`:

```typescript
@Injectable({providedIn: 'root'})
export class NotesStoreService {
  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();

  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>('/api/notes', note).pipe(
      tap(created => {
        const current = this.notesSubject.value;
        this.notesSubject.next([created, ...current]);
      })
    );
  }
}
```

---

## Routing Basics

### Defining Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }  // Catch-all
];
```

### Navigating Between Routes

**In Template:**
```html
<a routerLink="/dashboard">Dashboard</a>
<a [routerLink]="['/note', noteId]">Note Detail</a>
```

**In Component:**
```typescript
constructor(private router: Router) {}

goToDashboard() {
  this.router.navigate(['/dashboard']);
}
```

### Route Parameters

```typescript
// Define route with parameter
{ path: 'note/:id', component: NoteDetailComponent }

// Access parameter in component
export class NoteDetailComponent {
  noteId$ = this.route.params.pipe(map(p => p['id']));

  constructor(private route: ActivatedRoute) {}
}
```

---

## Project Structure

```
Angular101/
├── src/app/
│   ├── core/
│   │   ├── services/           # Business logic services
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── mock-api/           # Mock backend
│   │
│   ├── shared/
│   │   └── components/         # Reusable components
│   │
│   ├── pages/                  # Page/feature components
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── profile/
│   │
│   ├── models/                 # TypeScript interfaces
│   ├── app.routes.ts           # Route configuration
│   └── app.config.ts           # App configuration
│
├── wiki/                       # Learning guides
├── package.json
└── README.md
```

### Key Files to Explore

**Authentication Flow:**
- `src/app/pages/login/login.component.ts` - Login form
- `src/app/core/services/auth-store.service.ts` - Auth state
- `src/app/core/guards/auth.guard.ts` - Route protection

**State Management:**
- `src/app/core/services/notes-store.service.ts` - Notes state with RxJS
- `src/app/core/services/notes.service.ts` - Notes API calls

**Components:**
- `src/app/pages/dashboard/dashboard.component.ts` - Main notes list
- `src/app/shared/components/note-card/note-card.component.ts` - Note display

---

## Common Commands

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Build specific configuration
ng build --configuration production
```

---

## Next Steps

1. **Explore the Code**
   - Read through `auth-store.service.ts` to understand state management
   - Check `notes-store.service.ts` for RxJS patterns
   - Look at component templates for Angular syntax

2. **Study Deep Dives**
   - [RxJS & Reactive Patterns](02-rxjs-patterns.md)
   - [Quick Reference Cheatsheet](03-cheatsheet.md)

3. **Try Modifications**
   - Add a new field to notes (tags, priority)
   - Create a new page component
   - Add a custom validator to forms

4. **Practice**
   - Check /examples route for interactive demonstrations
   - Implement a new feature
   - Write tests for your code

---

## Troubleshooting

### App won't start
```bash
rm -rf node_modules
npm install
npm start
```

### Port 4200 already in use
```bash
ng serve --port 4201
```

### Mock API isn't working
- Check browser DevTools Console for errors
- Verify `MockInterceptor` is registered in `app.config.ts`
- Ensure HTTP requests are to `/api/...` URLs

---

**You're ready to code!** 🚀 Dive into the next guides to master RxJS and reactive patterns.
