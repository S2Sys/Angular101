# Angular Fundamentals

## What is Angular?

Angular is a complete framework for building web applications with:
- **TypeScript**: Type-safe development
- **Components**: Reusable UI building blocks
- **Services**: Shared business logic
- **Routing**: Client-side navigation
- **Forms**: Reactive form handling
- **HTTP Client**: API communication
- **Dependency Injection**: Loose coupling and testability

## Components

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
  template: '<h1>{{title}}</h1>',  // Or separate .html file
  styles: ['h1 { color: blue; }']  // Or separate .css file
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

### Structural Directives

#### `*ngIf` - Conditional Rendering
```html
<div *ngIf="isAuthenticated">
  You are logged in
</div>

<div *ngIf="user; else notLoggedIn">
  Welcome {{ user.name }}
</div>
<ng-template #notLoggedIn>
  <p>Please log in</p>
</ng-template>
```

#### `*ngFor` - List Rendering
```html
<!-- Loop through items -->
<div *ngFor="let note of notes">
  <h3>{{ note.title }}</h3>
</div>

<!-- With index and first/last -->
<div *ngFor="let note of notes; let i = index">
  #{{ i + 1 }}: {{ note.title }}
</div>
```

#### `*ngSwitch` - Multi-way Conditional
```html
<div [ngSwitch]="status">
  <p *ngSwitchCase="'loading'">Loading...</p>
  <p *ngSwitchCase="'error'">Error occurred</p>
  <p *ngSwitchDefault>Ready</p>
</div>
```

## Component Lifecycle

Angular creates and destroys components with predictable lifecycle hooks:

```typescript
export class MyComponent implements OnInit, OnDestroy {
  
  // Called when component is created
  constructor() {
    console.log('Constructor');
  }
  
  // Called after view is initialized
  ngOnInit(): void {
    console.log('ngOnInit - Load data here');
  }
  
  // Called when properties change
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges');
  }
  
  // Called when component is destroyed
  ngOnDestroy(): void {
    console.log('ngOnDestroy - Cleanup here');
  }
}
```

**Common Pattern:**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.myService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Process data
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Directives

### Built-in Directives

```html
<!-- Attribute directives (modify element) -->
<div [ngClass]="{'active': isActive, 'disabled': isDisabled}">
  Dynamic classes
</div>

<div [ngStyle]="{'color': textColor, 'fontSize.px': fontSize}">
  Dynamic styles
</div>

<!-- Structural directives (modify DOM) -->
<div *ngIf="showContent">...</div>
<div *ngFor="let item of items">...</div>
<div [ngSwitch]="value">...</div>
```

### Custom Directive Example

From the app (ready to implement):
```typescript
// A custom directive that auto-focuses an input
@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective {
  constructor(private el: ElementRef) {
    this.el.nativeElement.focus();
  }
}

// Usage:
// <input appAutoFocus>
```

## Forms

### Template-Driven Forms (Simpler)
```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  <input name="email" ngModel required>
  <button>Submit</button>
</form>
```

### Reactive Forms (Recommended)
```typescript
// In component
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', Validators.minLength(6))
});

// In template
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email">
  <input formControlName="password">
  <button [disabled]="form.invalid">Submit</button>
</form>
```

**Real Example from the app** (`src/app/pages/login/login.component.ts`):
```typescript
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});

onSubmit(): void {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    this.authStore.login(email, password);
  }
}
```

## Services & Dependency Injection

### What is a Service?

A class that provides shared functionality to components:
```typescript
// services/my-service.ts
@Injectable({ providedIn: 'root' })  // Available app-wide
export class MyService {
  getData(): string {
    return 'shared data';
  }
}
```

### Using Services (Dependency Injection)
```typescript
// In component
export class MyComponent {
  constructor(private myService: MyService) {
    // Service is injected automatically
  }
  
  ngOnInit(): void {
    const data = this.myService.getData();
  }
}
```

**Real Example from the app:**
- `AuthStoreService`: Manages authentication state
- `NotesStoreService`: Manages notes state
- `AuthService`: Makes auth API calls
- `NotesService`: Makes notes API calls

## Pipes

Pipes transform data in templates:

```html
<!-- Built-in pipes -->
<p>{{ date | date:'short' }}</p>
<p>{{ price | currency }}</p>
<p>{{ text | uppercase }}</p>
<p>{{ text | lowercase }}</p>
<p>{{ value | number:'1.2-2' }}</p>

<!-- Async pipe - subscribes to observables -->
<p>{{ data$ | async }}</p>
<div *ngIf="loading$ | async">Loading...</div>
```

**Custom Pipe Example** (ready to implement):
```typescript
@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(value).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  }
}

// Usage in template:
// <p>{{ note.createdAt | timeAgo }}</p>
```

## Standalone Components

Angular 14+ allows components without NgModules:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,  // No NgModule needed!
  imports: [CommonModule, ReactiveFormsModule, OtherComponent],
  template: '...'
})
export class MyComponent {}
```

**Benefits:**
- No NgModule boilerplate
- Clearer dependencies
- Better tree-shaking
- Modern Angular approach

**This entire Angular101 app uses standalone components!**

## Async Pipe

One of the most useful features:

```typescript
// In component
notes$ = this.notesStore.notes$;

// In template
<div *ngFor="let note of (notes$ | async)">
  {{ note.title }}
</div>

<!-- No need for subscription! -->
<!-- The pipe unsubscribes automatically -->
```

## Key Takeaways

1. **Components** are the building blocks of Angular apps
2. **Templates** use Angular-specific syntax (bindings, directives)
3. **Services** provide shared logic via dependency injection
4. **Reactive Forms** are the modern approach to form handling
5. **Pipes** transform data in templates
6. **Standalone Components** are the future of Angular
7. **Async Pipe** handles observable subscriptions automatically

## Next Steps

- Read the [Dependency Injection guide](03-dependency-injection.md)
- Explore [Routing & Guards](07-routing-guards.md)
- Learn about [RxJS & Observables](05-rxjs-observables.md)

## Practice

Try modifying:
1. Add a new field to the note form
2. Create a new component for displaying note stats
3. Add a custom pipe to format note dates
4. Implement a custom directive to highlight text

---

Happy learning! 📚
