# Angular101 - Comprehensive Angular Learning Application

A complete, production-ready Angular 19+ learning application demonstrating all core Angular concepts with a practical Notes management app.

**Status**: 🚀 Core infrastructure complete, pages implemented

## Features

✅ **Authentication System**
- User login and signup with JWT tokens
- Protected routes with guards
- Session persistence with localStorage
- Mock API backend

✅ **Complete CRUD Operations**
- Create, read, update, and delete notes
- Real-time search and filtering
- Debounced search with RxJS operators

✅ **State Management**
- BehaviorSubject + Reducer pattern for auth
- RxJS Subject + Reducer pattern for notes
- Reactive Forms with validation

✅ **Advanced Angular Patterns**
- Dependency Injection and services
- HTTP interceptors (auth, error, mock)
- Route guards (CanActivate, CanDeactivate)
- Standalone components
- RxJS operators (map, scan, combineLatest, debounceTime, etc.)

✅ **Reusable Components**
- Smart/container components
- Presentational components with @Input/@Output
- Error handling and loading states
- Responsive design

## Project Structure

```
Angular101/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services, guards, interceptors
│   │   │   ├── services/            # Auth, Notes, Storage services
│   │   │   ├── guards/              # Route guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── mock-api/            # Mock backend
│   │   ├── shared/                  # Reusable components
│   │   │   └── components/          # Navbar, LoadingSpinner, NoteCard, etc.
│   │   ├── pages/                   # Route-level pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── dashboard/
│   │   │   ├── note-detail/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── models/                  # TypeScript interfaces
│   │   ├── app.routes.ts            # Route configuration
│   │   ├── app.config.ts            # DI configuration
│   │   └── app.component.ts         # Root component
│   ├── styles/                      # Global styles
│   └── main.ts                      # Entry point
├── wiki/                            # Learning guides (to be created)
├── angular.json                     # Angular CLI config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
└── README.md                        # This file
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200/
```

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password`

The demo account comes with sample notes to explore the app.

## What is Angular? (High-Level Overview)

Angular is a **complete, opinionated framework** for building web applications. It provides everything you need out of the box:

### Core Pillars

1. **Components** - Reusable UI building blocks with templates, logic, and styles
2. **Services** - Shared business logic and data management
3. **Dependency Injection** - Loosely coupled, testable code
4. **RxJS** - Powerful reactive programming for async operations
5. **Forms** - Built-in form validation and reactive forms
6. **Routing** - Client-side navigation
7. **HTTP Client** - API communication with interceptors
8. **TypeScript** - Type-safe development

### Why Choose Angular?

✅ **Full-featured** - Everything included (not like React which is just a view layer)
✅ **Enterprise-ready** - Used by Google, Microsoft, and major corporations
✅ **Strong opinions** - Best practices built-in, less decision fatigue
✅ **Scalable** - Structure for large teams and complex apps
✅ **TypeScript-first** - Full type support by default

---

## Key Concepts Covered

### 1. **Services & Dependency Injection**
- Creating services with `@Injectable({ providedIn: 'root' })`
- Constructor-based dependency injection
- Service composition and layering

### 2. **State Management**
- **AuthStoreService**: BehaviorSubject + Reducer pattern
- **NotesStoreService**: Subject + Reducer + RxJS operators
- Observable streams for reactive updates
- Client-to-client communication across the app

### 3. **Reactive Forms**
- FormBuilder and FormGroup
- Form validation (built-in and custom validators)
- Form error handling and display

### 4. **RxJS Observables & Async Programming**
- **Observable vs Promise** - Understand the key differences
- Creating observables with Subject and BehaviorSubject
- **Combining observables** - combineLatest, forkJoin, merge, zip
- Using operators: `map`, `scan`, `debounceTime`, `distinctUntilChanged`, `shareReplay`, `switchMap`, `catchError`, etc.
- Subscription management with `takeUntil`
- See **[RxJS & Reactive Programming Guide](./wiki/04-rxjs-guide.md)** for comprehensive examples

### 5. **Component Communication Patterns**
- **Parent → Child** with `@Input`
- **Child → Parent** with `@Output` and EventEmitter
- **Sibling → Sibling** through services
- **Client → Client** global state management
- Template reference variables with `@ViewChild`
- See **[Component Communication Guide](./wiki/05-component-communication.md)** for detailed patterns

### 6. **Route Guards**
- `CanActivate` guard for authentication
- `CanDeactivate` guard for unsaved changes warning
- Protecting routes with AuthGuard

### 7. **HTTP Interceptors**
- AuthInterceptor: Automatically inject JWT tokens
- ErrorInterceptor: Centralized error handling
- MockInterceptor: Simulate backend API in development

### 8. **Standalone Components**
- Modern Angular standalone API
- No NgModule required
- Simplified component configuration

## Architecture Patterns

### Smart/Presentational Component Pattern

**Smart Components (Containers)**
- Manage state and data
- Subscribe to observables
- Handle user interactions
- Example: DashboardComponent, NoteDetailComponent

**Presentational Components (Dumb)**
- Display data via @Input
- Emit events via @Output
- No service dependencies
- Example: NoteCardComponent, NavbarComponent

### Service Layer Pattern

```
Components → Store Services → API Services → HTTP Interceptors → Mock API
```

**Benefits:**
- Clear separation of concerns
- Easy to test and mock
- Reusable business logic
- Single responsibility principle

## State Management Flow

### Authentication Flow

```
LoginComponent
    ↓
AuthStoreService.login()
    ↓ [Dispatch AUTH_START]
AuthService.login() [HTTP call]
    ↓ [Success/Error response]
AuthStoreService [Dispatch AUTH_SUCCESS or AUTH_ERROR]
    ↓ [Update BehaviorSubjects]
LoginComponent subscribes to isAuthenticated$
    ↓ [Navigate to /dashboard]
```

### Notes CRUD Flow

```
DashboardComponent
    ↓
NotesStoreService.createNote()
    ↓ [Dispatch CREATE_START]
NotesService.createNote() [HTTP call]
    ↓ [Success response with new Note]
NotesStoreService [Dispatch CREATE_SUCCESS]
    ↓ [Apply reducer, prepend note to array]
DashboardComponent [notesStore.filteredNotes$ emits new array]
    ↓ [Template renders updated list]
```

## Form Validation Example

```typescript
// Reactive form with validators
const form = fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', [Validators.required]]
}, { validators: passwordMatchValidator });

// Custom validator
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password?.value === confirmPassword?.value ? null : { passwordMismatch: true };
}
```

## RxJS Observable Examples

### Observable vs Promise

```typescript
// Promise: One-time operation
const promise = fetch('/api/notes').then(r => r.json());
// Executes immediately, returns once

// Observable: Stream of values
const observable = fromEvent(inputElement, 'input');
// Lazy, can emit multiple times, can be cancelled

// Use combineLatest to merge streams
combineLatest([
  this.authStore.currentUser$,      // User stream
  this.notesStore.filteredNotes$    // Notes stream
]).pipe(
  map(([user, notes]) => ({
    userName: user?.name,
    noteCount: notes.length
  }))
).subscribe(data => console.log(data));

// Use forkJoin to wait for all requests
forkJoin({
  user: this.http.get('/api/user'),
  notes: this.http.get('/api/notes'),
  settings: this.http.get('/api/settings')
}).subscribe(({ user, notes, settings }) => {
  // All three loaded - initialize dashboard
});
```

### Combining Observables for Filtered Data

```typescript
// Create search term stream
private searchTermSubject = new BehaviorSubject<string>('');

// Combine with notes to create filtered results
filteredNotes$ = combineLatest([
  this.notes$,
  this.searchTermSubject.pipe(
    debounceTime(300),           // Wait 300ms after typing
    distinctUntilChanged(),       // Only if value changed
    startWith('')
  )
]).pipe(
  map(([notes, searchTerm]) => {
    // Filter logic - only updates when notes OR search term changes
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }),
  shareReplay(1)  // Cache the result for multiple subscribers
);
```

### Handling Loading and Error States

```typescript
// Load notes with loading/error states
notes$ = this.notesService.getNotes().pipe(
  // Show loading state immediately
  startWith(null),
  // Map success response
  map(notes => ({ data: notes, loading: false, error: null })),
  // Map error response
  catchError(err => of({ data: null, loading: false, error: err.message })),
  // Show loading state while request in progress
  startWith({ data: null, loading: true, error: null }),
  shareReplay(1)
);

// In component:
<ng-container *ngIf="notes$ | async as state">
  <div *ngIf="state.loading">Loading...</div>
  <div *ngIf="state.error" class="error">{{ state.error }}</div>
  <div *ngFor="let note of state.data">{{ note.title }}</div>
</ng-container>
```

### Auto-Complete Search Example

```typescript
// Search that debounces input and switches to new searches
searchResults$ = this.searchInput$.pipe(
  debounceTime(300),                    // Wait for user to stop typing
  distinctUntilChanged(),                // Only search if term changed
  switchMap(term => 
    term.length > 0
      ? this.notesService.search(term)
      : of([])                           // Return empty if cleared
  ),
  shareReplay(1)                         // Share result with all subscribers
);
```

---

## Component Communication Examples

### Parent to Child (@Input)

```typescript
// Parent passes data down
<app-note-card [note]="note" (delete)="onDelete($event)"></app-note-card>

// Child receives via @Input
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() delete = new EventEmitter<string>();
}
```

### Child to Parent (@Output & EventEmitter)

```typescript
// Child emits events up
export class SearchBoxComponent {
  @Output() search = new EventEmitter<string>();
  
  onSearch(term: string) {
    this.search.emit(term);
  }
}

// Parent listens
<app-search-box (search)="onSearch($event)"></app-search-box>
```

### Sibling to Sibling (Shared Service)

```typescript
// Service acts as mediator
@Injectable({ providedIn: 'root' })
export class SearchService {
  private searchSubject = new Subject<string>();
  search$ = this.searchSubject.asObservable();
  
  performSearch(term: string) {
    this.searchSubject.next(term);
  }
}

// Sibling 1 sends
constructor(private searchService: SearchService) {}
this.searchService.performSearch('angular');

// Sibling 2 receives
constructor(private searchService: SearchService) {}
this.searchService.search$.subscribe(term => {
  // React to search
});
```

### Client to Client (Global State)

```typescript
// All components access shared store
@Injectable({ providedIn: 'root' })
export class NotesStoreService {
  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();
  
  // Anyone can create, update, delete
  createNote(note: Note) { /* ... */ }
  updateNote(id: string, updates: Partial<Note>) { /* ... */ }
  deleteNote(id: string) { /* ... */ }
}

// Access from any component
constructor(public notesStore: NotesStoreService) {}

// Template or component
<app-note-list [notes]="notesStore.notes$ | async"></app-note-list>
```

---

## Real-World Implementation

In this project, you'll see all these patterns in action:

**Dashboard Component** (Smart/Container)
- Fetches notes from NotesStoreService
- Manages filtered list with RxJS
- Communicates with child NoteCardComponent via @Input/@Output

**NoteCardComponent** (Presentational/Dumb)
- Receives note via @Input
- Emits delete event via @Output
- No service dependencies

**NotesStoreService** (Global State)
- Manages all notes state (BehaviorSubject)
- Provides filteredNotes$ combining notes + search term
- Available to entire app via dependency injection

---

## Testing Strategy

### Unit Tests (Ready to add)
- **Services**: Test pure reducer functions, action dispatching
- **Components**: Test @Input/@Output, lifecycle hooks
- **Guards**: Test authorization logic

### Integration Tests (Ready to add)
- Test component + service interaction
- Test store patterns with mock services

### E2E Tests (Ready to add)
- Test complete user flows
- Login → Create Note → Update → Delete

## Performance Considerations

✅ **Implemented**
- RxJS `shareReplay()` prevents duplicate subscriptions
- `takeUntil()` manages subscription cleanup
- Debounced search prevents excessive filtering
- Smart change detection with OnPush (ready)

⚡ **Future Optimizations**
- Implement `ChangeDetectionStrategy.OnPush` for components
- Add virtual scrolling for large note lists
- Lazy load route components
- Implement NgRx for complex state if needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📋 Quick Reference Cheat Sheets

### RxJS Operators Quick Lookup

| Operator | What It Does | When to Use | Example |
|----------|-------------|------------|---------|
| **map** | Transform each value | Change shape of data | `map(x => x * 2)` |
| **filter** | Keep matching values | Remove unwanted data | `filter(x => x > 5)` |
| **debounceTime** | Wait for silence | Search input, auto-save | `debounceTime(300)` |
| **distinctUntilChanged** | Skip duplicates | Avoid redundant calls | `distinctUntilChanged()` |
| **switchMap** | Cancel previous, switch to new | Search, route params | `switchMap(id => getUser(id))` |
| **takeUntil** | Stop on signal | Clean up subscriptions | `takeUntil(destroy$)` |
| **shareReplay(1)** | Share & cache result | Avoid duplicate requests | `shareReplay(1)` |
| **combineLatest** | All emit, then sync | Form with multiple inputs | `combineLatest([obs1, obs2])` |
| **forkJoin** | Wait for all to complete | Load multiple resources | `forkJoin({a: obs1, b: obs2})` |
| **catchError** | Handle errors | Error recovery | `catchError(err => of([]))` |

### Component Communication Decision Tree

```
Which pattern should you use?

├─ Direct parent-child? (Same component tree)
│  └─ Use @Input/@Output
│     • Parent passes data via [prop]="value"
│     • Child emits via (event)="handler($event)"
│
├─ Siblings or distant components?
│  └─ Use Shared Service + Subject
│     • Create service with Subject
│     • One component emits: service.sendData(value)
│     • Other component listens: service.data$.subscribe()
│
└─ App-wide state? (Many components, complex)
   └─ Use Global Store Service
      • Create store with BehaviorSubject
      • All components inject store
      • Use: store.property$ | async
```

### Observable Patterns Quick Selection

| Pattern | What It Does | Use When | Result |
|---------|-------------|----------|--------|
| **combineLatest** | Merge multiple streams | Any stream changes → emit | Multiple values over time |
| **forkJoin** | Wait for all to finish | All HTTP calls done → emit | Single emission with all results |
| **merge** | Combine any emissions | Multiple sources emit | Any source emits → emit |
| **zip** | Pair values from streams | Both streams emit → pair | Paired values |
| **switchMap** | Cancel old, start new | User searches → new search | Cancels previous requests |
| **debounceTime** | Wait for silence | User stops typing → proceed | Single emission after quiet period |

### Best Practices Checklist

#### ✅ DO:
- Use `takeUntil(destroy$)` to clean up subscriptions
- Use `async` pipe in templates for auto-cleanup
- Use `shareReplay(1)` for shared operations
- Type your observables: `Observable<Note[]>`
- Use `debounceTime` for user input
- Use `@Input/@Output` for parent-child
- Use services for cross-component communication
- Handle errors with `catchError`

#### ❌ DON'T:
- Subscribe without unsubscribing
- Nest multiple `.subscribe()` calls
- Use `Promise` for continuous streams
- Trust user input without validation
- Leave console.logs in production
- Update `@Input` properties directly
- Store sensitive data in localStorage
- Skip error handling

### Observable vs Promise Quick Ref

| Feature | Observable | Promise |
|---------|-----------|---------|
| **Multiple Values** | ✅ Yes | ❌ No (one value) |
| **Cancellable** | ✅ Yes | ❌ No |
| **Lazy** | ✅ Yes | ❌ Executes immediately |
| **Retryable** | ✅ Easy with `retry()` | ❌ Complex |
| **Chainable** | ✅ Multiple operators | ⚠️ .then() chains |
| **Memory** | ⚠️ Manual cleanup | ✅ Auto cleanup |
| **Use For** | Streams, events, HTTP | One-time operations |

### Common Patterns & Use Cases

#### Pattern 1: Debounced Search
```typescript
// User types → wait 300ms → search
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => api.search(term))
).subscribe(results => {})
```
**Remember:** switchMap cancels previous searches

#### Pattern 2: Load Multiple Resources
```typescript
// Load user, posts, settings in parallel
forkJoin({
  user: api.getUser(),
  posts: api.getPosts(),
  settings: api.getSettings()
}).subscribe(({user, posts, settings}) => {})
```
**Remember:** Waits for ALL to complete, emits once

#### Pattern 3: Filter & Transform Data
```typescript
// Show only completed notes, sorted by date
combineLatest([notes$, filter$]).pipe(
  map(([notes, filter]) => 
    notes.filter(n => n.status === filter)
         .sort((a, b) => b.date - a.date)
  )
).subscribe(filtered => {})
```
**Remember:** Emits when either notes or filter changes

#### Pattern 4: Clean Component Unsubscribe
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* use data */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```
**Remember:** Always cleanup on component destroy

---

## Next Steps

### 📖 Deepen Your Knowledge
1. **Study the RxJS Guide** - Master observables, operators, and async patterns
2. **Master Component Communication** - Understand all communication patterns
3. **Review the Code** - Read the source files referenced above
4. **Experiment** - Try modifying components, services, and adding new features

### ✅ Hands-On Learning
1. **Modify the NotesStoreService**
   - Add sorting functionality
   - Add filtering by category
   - Use new RxJS operators

2. **Add New Communication Patterns**
   - Create a notification service that broadcasts to all components
   - Implement a theme service for dark mode toggle
   - Build a real-time sync between components

3. **Create New Features**
   - Add note tags/categories
   - Implement note sharing
   - Add note comments
   - Create a rich text editor

4. **Add Tests**
   - Test services with mock HTTP
   - Test components with TestBed
   - Test guards and interceptors
   - See [Testing Guide](./wiki/20-advanced-concepts.md#testing) for examples

5. **Deploy to Production**
   - Connect real backend API
   - Add environment configuration
   - Implement actual JWT authentication
   - Add analytics and monitoring

## Learning Resources

### 📚 Comprehensive Wiki Guides

1. **[Quick Start Guide](./wiki/01-quick-start.md)** - Get up and running in 5 minutes
2. **[Angular Fundamentals](./wiki/02-angular-fundamentals.md)** - Understanding Angular basics
3. **[Components Guide](./wiki/03-components-guide.md)** - Building smart and presentational components
4. **[RxJS & Reactive Programming Guide](./wiki/04-rxjs-guide.md)** ⭐ NEW
   - What is RxJS?
   - Observable vs Promise explained
   - Creating observables (Subject, BehaviorSubject, HTTP, custom)
   - Common operators (map, filter, scan, debounceTime, switchMap, etc.)
   - Combining observables (combineLatest, forkJoin, merge, zip)
   - Real-world patterns (auto-complete, loading states, polling)
5. **[Component Communication Guide](./wiki/05-component-communication.md)** ⭐ NEW
   - Parent to Child (@Input)
   - Child to Parent (@Output & EventEmitter)
   - Sibling to Sibling (Shared Services)
   - Client to Client (Global State Management)
   - Template reference variables
   - Comprehensive examples for each pattern

### 🔍 Key Files to Study

1. **State Management**
   - `src/app/core/services/auth-store.service.ts` - Authentication state (BehaviorSubject pattern)
   - `src/app/core/services/notes-store.service.ts` - Notes state (Observable streams)

2. **HTTP Communication & RxJS**
   - `src/app/core/services/auth.service.ts` - HTTP requests and Observables
   - `src/app/core/services/notes.service.ts` - HTTP with operators
   - `src/app/core/interceptors/` - HTTP interceptors, error handling

3. **Component Communication**
   - `src/app/pages/dashboard/dashboard.component.ts` (Smart component - manages state)
   - `src/app/shared/components/note-card/note-card.component.ts` (Presentational - @Input/@Output)

4. **Routing & Guards**
   - `src/app/app.routes.ts` - Route configuration
   - `src/app/core/guards/auth.guard.ts` - Route protection

5. **Advanced Topics**
   - [Testing Strategies](./wiki/20-advanced-concepts.md#testing)
   - [Performance Optimization](./wiki/20-advanced-concepts.md#performance-optimization)
   - [Error Handling Patterns](./wiki/20-advanced-concepts.md#error-handling-patterns)

## Troubleshooting

### Common Issues

**Q: Mock API isn't intercepting requests**
- Ensure `MockInterceptor` is registered in `app.config.ts`
- Check browser console for request logs

**Q: Form validation errors not showing**
- Ensure field is marked as touched: `field.markAsTouched()`
- Check conditional template with `field.invalid && field.touched`

**Q: Changes not reflecting in template**
- Use `shareReplay()` on observables
- Use `async` pipe to subscribe in templates
- Avoid unsubscribed manual subscriptions

## Contributing

This is a learning resource. Feel free to:
- Extend with additional features
- Add tests and documentation
- Create additional example apps
- Report issues or improvements

## License

MIT - Free to use for learning and commercial projects

---

**Happy Learning!** 📚

Start with the demo account and explore the app, then dive into the code to understand how everything works together.
