# Components Guide - Deep Dive

Complete explanation of every component in Angular101 with code examples and patterns.

## Table of Contents
1. [Smart Components (Pages)](#smart-components)
2. [Shared Components](#shared-components)
3. [Component Communication](#component-communication)
4. [Best Practices](#best-practices)

---

## Smart Components (Pages)

Smart/Container components manage state, load data, and handle business logic.

### LoginComponent

**File**: `src/app/pages/login/login.component.ts`

**Purpose**: User authentication with email and password.

**Key Features**:
- Reactive Form with email and password validators
- Loading state while authenticating
- Error message display
- Demo credentials hint
- Auto-navigation on successful login

**How It Works**:

```typescript
// 1. Create form with validators
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});

// 2. On submit, call AuthStoreService
onSubmit(): void {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    this.authStore.login(email, password);  // Dispatches AUTH_START
  }
}

// 3. Subscribe to isAuthenticated$ and navigate
ngOnInit(): void {
  this.authStore.isAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);  // Navigate on success
      }
    });
}
```

**Learning Points**:
- ✅ Reactive Forms with FormBuilder
- ✅ Form validation (built-in validators)
- ✅ Observable subscriptions with takeUntil cleanup
- ✅ Integration with store services
- ✅ Async pipe in templates for loading states
- ✅ Error handling and display

**Template Highlights**:
```html
<!-- Form with validation -->
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" 
         [class.error]="isFieldInvalid('email')">
  <div *ngIf="isFieldInvalid('email')">
    <!-- Show appropriate error message -->
  </div>
</form>

<!-- Loading state from observable -->
<button [disabled]="loginForm.invalid || (loading$ | async)">
  {{ (loading$ | async) ? 'Logging in...' : 'Login' }}
</button>

<!-- Error display -->
<div class="error-alert" *ngIf="error$ | async as error">
  {{ error }}
</div>
```

---

### SignupComponent

**File**: `src/app/pages/signup/signup.component.ts`

**Purpose**: User registration with validation.

**Key Differences from LoginComponent**:
- Additional name field
- Password confirmation field
- Custom validator for password matching
- Signup instead of login flow

**Custom Validator Example**:

```typescript
// Custom validator ensures passwords match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) return null;
  
  return password.value === confirmPassword.value 
    ? null 
    : { passwordMismatch: true };
}

// Apply to form group
this.signupForm = this.fb.group(
  {
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  },
  { validators: passwordMatchValidator }  // Group-level validator
);
```

**Learning Points**:
- ✅ Custom form validators
- ✅ Group-level validators for cross-field validation
- ✅ Form array (for future dynamic fields)
- ✅ Password confirmation pattern
- ✅ Error display at form and field levels

---

### DashboardComponent

**File**: `src/app/pages/dashboard/dashboard.component.ts`

**Purpose**: Main app page - display all notes with search and create.

**Architecture Pattern**: Smart Component

```typescript
export class DashboardComponent implements OnInit, OnDestroy {
  // 1. Expose observables from store for template
  constructor(public notesStore: NotesStoreService) {}
  
  // 2. Load data on init
  ngOnInit(): void {
    this.notesStore.loadNotes();  // Dispatch FETCH_START
    
    // 3. Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((term) => {
        this.notesStore.setSearchTerm(term || '');
      });
  }
  
  // 4. Provide handlers for child components
  onDeleteNote(noteId: string): void {
    this.notesStore.deleteNote(noteId);
  }
  
  // 5. Cleanup on destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Template Pattern**:

```html
<!-- 1. Show loading spinner -->
<app-loading-spinner 
  [isLoading]="notesStore.loading$ | async">
</app-loading-spinner>

<!-- 2. Show error if present -->
<app-error-display 
  [error]="notesStore.error$ | async"
  (dismiss)="notesStore.clearError()">
</app-error-display>

<!-- 3. Handle search input -->
<input [formControl]="searchControl" 
       placeholder="Search notes...">

<!-- 4. Show filtered notes -->
<div *ngIf="(notesStore.filteredNotes$ | async) as notes">
  <app-note-card
    *ngFor="let note of notes"
    [note]="note"
    (delete)="onDeleteNote($event)">
  </app-note-card>
</div>

<!-- 5. Handle empty states -->
<div *ngIf="(notesStore.filteredNotes$ | async) as notes">
  <div *ngIf="notes.length === 0; else noNotes">
    No notes found
  </div>
</div>
```

**Learning Points**:
- ✅ Smart component pattern (orchestrates data and events)
- ✅ Using observables in templates with async pipe
- ✅ Handling loading and error states
- ✅ Child component communication via @Input/@Output
- ✅ Form control integration with services
- ✅ Empty state handling

---

### NoteDetailComponent

**File**: `src/app/pages/note-detail/note-detail.component.ts`

**Purpose**: View and edit a single note.

**Special Feature**: Implements `CanComponentDeactivate` for unsaved changes warning.

```typescript
// Implements the guard interface
export class NoteDetailComponent 
  implements OnInit, OnDestroy, CanComponentDeactivate {
  
  // Guard asks this method before navigating away
  canDeactivate(): Observable<boolean> | boolean {
    if (this.noteForm.dirty && !this.noteForm.pristine) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
  
  // Mark form as pristine after successful save
  onSave(): void {
    // ... save logic ...
    this.noteForm.markAsPristine();  // Clears dirty flag
  }
}
```

**Pattern**: Getting Route Params

```typescript
ngOnInit(): void {
  // Subscribe to route params to get note ID
  this.route.params
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.noteId = params['id'];
      if (this.noteId) {
        this.loadNote(this.noteId);
      }
    });
}

private loadNote(noteId: string): void {
  // Fetch individual note
  this.notesService.fetchNoteById(noteId).subscribe({
    next: (note) => {
      this.currentNote = note;
      this.noteForm.patchValue({  // Fill form with data
        title: note.title,
        content: note.content
      });
      this.noteForm.markAsPristine();  // Mark as unmodified
    },
    error: (error) => {
      console.error('Failed to load note:', error);
      this.router.navigate(['/dashboard']);  // Go back on error
    }
  });
}
```

**Learning Points**:
- ✅ Route parameters and ActivatedRoute
- ✅ Route guards for protecting navigation
- ✅ Form pristine/dirty state tracking
- ✅ Unsaved changes warning pattern
- ✅ Loading individual resources
- ✅ Error handling with navigation

---

### ProfileComponent & SettingsComponent

**ProfileComponent** (`src/app/pages/profile/profile.component.ts`):
- Simple read-only display of user info
- Uses `currentUser$` from AuthStoreService
- Shows basic user details and creation date

**Learning Points**:
- ✅ Displaying async data with async pipe
- ✅ Date formatting with pipes
- ✅ Read-only component pattern

**SettingsComponent** (`src/app/pages/settings/settings.component.ts`):
- User preferences (dark mode, notifications)
- Uses BrowserStorageService for persistence
- Shows how to save preferences locally

**Learning Points**:
- ✅ localStorage integration
- ✅ Form value changes
- ✅ Setting application preferences
- ✅ Success message patterns

---

## Shared Components

Presentational components focused on display and user interaction.

### NavbarComponent

**File**: `src/app/shared/components/navbar/navbar.component.ts`

**Purpose**: App-wide navigation and user menu.

```typescript
@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <!-- Logo -->
      <a routerLink="/" class="logo">Angular101</a>
      
      <!-- Nav links -->
      <ul *ngIf="currentUser$ | async as user">
        <li><a routerLink="/dashboard" routerLinkActive="active">
          Notes
        </a></li>
        <li><a routerLink="/profile" routerLinkActive="active">
          Profile
        </a></li>
      </ul>
      
      <!-- User section -->
      <div *ngIf="currentUser$ | async as user" class="user-section">
        <span>{{ user.name }}</span>
        <button (click)="onLogout()">Logout</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser$ = this.authStore.currentUser$;
  
  constructor(
    private authStore: AuthStoreService,
    private router: Router
  ) {}
  
  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
```

**Learning Points**:
- ✅ Router integration (routerLink, routerLinkActive)
- ✅ Conditional navigation based on auth state
- ✅ Presentational component with event output

---

### NoteCardComponent

**File**: `src/app/shared/components/note-card/note-card.component.ts`

**Purpose**: Display individual note in card format.

**Key Pattern**: @Input/@Output Communication

```typescript
@Component({
  selector: 'app-note-card',
  template: `
    <div class="note-card" *ngIf="note">
      <!-- Display data from @Input -->
      <h3>{{ note.title }}</h3>
      <p>{{ getContentPreview() }}</p>
      
      <!-- Tags -->
      <div class="tags">
        <span *ngFor="let tag of note.tags" class="tag">
          #{{ tag }}
        </span>
      </div>
      
      <!-- Actions - emit @Output events -->
      <button (click)="onDelete()">Delete</button>
      <a [routerLink]="['/notes', note.id]">Edit</a>
    </div>
  `
})
export class NoteCardComponent {
  // Input from parent
  @Input() note!: Note;
  
  // Outputs to parent
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Note>();
  
  // Pure methods for display logic
  getContentPreview(): string {
    return this.note.content.substring(0, 150) + '...';
  }
  
  onDelete(): void {
    if (confirm('Delete this note?')) {
      this.delete.emit(this.note.id);  // Emit to parent
    }
  }
}
```

**Parent Usage**:

```html
<!-- Parent passes data and listens for events -->
<app-note-card
  [note]="note"
  (delete)="onDeleteNote($event)"
  (edit)="onEditNote($event)">
</app-note-card>
```

**Learning Points**:
- ✅ @Input for parent-to-child data
- ✅ @Output with EventEmitter for child-to-parent events
- ✅ Presentational component with pure methods
- ✅ Router links within components

---

### LoadingSpinnerComponent & ErrorDisplayComponent

**LoadingSpinnerComponent**:
```typescript
@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" *ngIf="isLoading">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Loading...';
}
```

**ErrorDisplayComponent**:
```typescript
@Component({
  selector: 'app-error-display',
  template: `
    <div class="error-alert" *ngIf="error">
      <p>{{ error }}</p>
      <button (click)="onDismiss()">✕</button>
    </div>
  `
})
export class ErrorDisplayComponent {
  @Input() error: string | null = null;
  @Output() dismiss = new EventEmitter<void>();
  
  onDismiss(): void {
    this.dismiss.emit();
  }
}
```

---

## Component Communication

### Pattern 1: Parent → Child via @Input

```typescript
// Parent
<app-note-card [note]="myNote"></app-note-card>

// Child
@Input() note!: Note;
```

### Pattern 2: Child → Parent via @Output

```typescript
// Child emits
@Output() delete = new EventEmitter<string>();
this.delete.emit(noteId);

// Parent listens
<app-note-card (delete)="onDelete($event)"></app-note-card>
```

### Pattern 3: Via Shared Service (Store)

```typescript
// Child subscribes to store
this.notesStore.notes$.subscribe(notes => {
  // Update view
});

// Parent dispatches to store
this.notesStore.createNote(data);
```

---

## Best Practices

### 1. **OnDestroy Cleanup**
Always unsubscribe from observables:
```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.dataService.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. **Async Pipe in Templates**
Prefer async pipe over manual subscriptions:
```html
<!-- ✅ Good -->
<div>{{ data$ | async }}</div>

<!-- ❌ Avoid -->
<div>{{ manuallySubscribedData }}</div>
```

### 3. **Form Validation**
Check form state before submission:
```typescript
onSubmit(): void {
  if (this.form.invalid) {
    // Mark all fields as touched to show errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
    return;
  }
  // Submit
}
```

### 4. **Error Handling**
Provide user feedback for all operations:
```html
<app-error-display
  [error]="store.error$ | async"
  (dismiss)="store.clearError()">
</app-error-display>
```

### 5. **Loading States**
Show feedback during async operations:
```html
<app-loading-spinner
  [isLoading]="store.loading$ | async"
  message="Saving note...">
</app-loading-spinner>
```

---

## Component Interaction Flow

```
DashboardComponent (Smart)
├── Subscribes to: notesStore.notes$, notesStore.loading$, notesStore.error$
├── Emits to store: setSearchTerm(), createNote(), deleteNote()
│
├── LoadingSpinnerComponent (Presentational)
│   └── Input: loading$
│
├── ErrorDisplayComponent (Presentational)
│   └── Input: error$ | Output: dismiss
│
└── NoteCardComponent (Presentational) [*ngFor loop]
    ├── Input: note
    └── Output: delete, edit
    
NoteDetailComponent (Smart)
├── Subscribes to: route.params, notesStore.loading$
├── Emits to store: updateNote(), deleteNote()
└── Implements: CanComponentDeactivate
```

---

## Next Steps

1. Study each component's source code
2. Modify components to add new features
3. Create new components following the patterns
4. Practice component communication patterns

---

**Key Takeaway**: Angular uses a hierarchical component architecture where smart components manage state and presentational components focus on display. Components communicate via @Input/@Output or shared services.
