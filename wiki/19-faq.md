# Frequently Asked Questions (FAQ)

Common questions from Angular101 learners and detailed answers.

## Getting Started

### Q: How do I run the application?

**A:**
```bash
cd Angular101
npm install
npm start
```

The app opens at `http://localhost:4200/`. Use demo credentials:
- Email: `demo@example.com`
- Password: `password`

### Q: What Node.js version do I need?

**A:** Node.js 18+ (LTS recommended). Check your version:
```bash
node --version
```

Upgrade if needed: https://nodejs.org/

### Q: Why is my application slow on first load?

**A:** First load builds Angular in memory. Subsequent loads are faster. In production, use:
```bash
npm run build
```

This creates an optimized build in `dist/` folder.

### Q: Can I use Angular101 with a real backend?

**A:** Yes! The app uses HTTP services. To connect to a real backend:

1. Modify `AuthService.login()` endpoint
2. Modify `NotesService` endpoints
3. Replace MockInterceptor with real API calls
4. Keep the same service interfaces

**Example**:
```typescript
// Instead of mock
login(email: string, password: string): Observable<AuthResponse> {
  // Change to: return this.http.post<AuthResponse>('https://your-api.com/login', ...)
}
```

---

## Understanding the Architecture

### Q: What's the difference between AuthService and AuthStoreService?

**A:**

- **AuthService**: Makes HTTP API calls
  - `login(email, password): Observable<AuthResponse>`
  - `signup(...): Observable<AuthResponse>`
  - Handles HTTP communication only

- **AuthStoreService**: Manages authentication state
  - Stores user, token, loading, error states
  - Uses BehaviorSubject for reactive updates
  - Orchestrates AuthService calls with state management

**Analogy**: AuthService is like a translator, AuthStoreService is like a manager.

### Q: Why use BehaviorSubject instead of normal Subject?

**A:**

- **BehaviorSubject**: Stores current value, emits immediately to new subscribers
- **Subject**: Only emits future values to subscribers

```typescript
// BehaviorSubject example
const auth$ = new BehaviorSubject<User | null>(null);
auth$.subscribe(user => console.log(user));  // Immediately logs: null

// Subject example
const auth$ = new Subject<User | null>();
auth$.subscribe(user => console.log(user));  // Logs nothing until value emitted
```

Use BehaviorSubject for state management (auth status, user info), Subject for events.

### Q: How does the reducer pattern work?

**A:** The reducer is a pure function that takes state and action, returns new state:

```typescript
private authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
}
```

**Benefits**:
- ✅ Predictable state transitions
- ✅ Easy to debug (see action → state change)
- ✅ Testable (pure function)
- ✅ Similar to Redux pattern

### Q: What's the difference between `push()` and `next()`?

**A:**

- **push()**: Does not exist on Subject/BehaviorSubject (you might be thinking of arrays)
- **next()**: Emits new value to all subscribers

```typescript
// Emit new value
authSubject.next(newUser);  // Sends to all subscribers

// Subscribe
authSubject.subscribe(user => console.log(user));
```

---

## Reactive Programming & RxJS

### Q: What's the difference between `subscribe()` and `async` pipe?

**A:**

**Manual `subscribe()`**:
```typescript
// In component
subscription: Subscription;

ngOnInit(): void {
  this.subscription = this.notes$.subscribe(notes => {
    this.displayedNotes = notes;
  });
}

ngOnDestroy(): void {
  this.subscription.unsubscribe();  // Must unsubscribe manually
}

// In template
{{ displayedNotes }}
```

**Async Pipe** (Recommended):
```typescript
// In component - no subscription needed
notes$ = this.notesStore.notes$;

// In template
{{ notes$ | async }}  // Pipe handles subscribe/unsubscribe
```

**Advantages of async pipe**:
- ✅ Automatic cleanup on destroy
- ✅ Less boilerplate
- ✅ Triggers change detection
- ✅ Prevents memory leaks

### Q: When should I use `switchMap` vs `mergeMap`?

**A:**

- **switchMap**: Cancels previous observable when new one arrives
  - Best for: Search, auto-complete, rapid requests
  - Example: User typing in search box

- **mergeMap**: Runs multiple observables in parallel
  - Best for: Independent async operations
  - Example: Loading multiple resources simultaneously

```typescript
// Search - use switchMap (cancel old searches)
searchTerm$.pipe(
  switchMap(term => this.searchService.search(term))
).subscribe(results => {
  // Only latest search results shown
});

// Load multiple - use mergeMap (run all)
noteIds$.pipe(
  mergeMap(id => this.loadNote(id))
).subscribe(note => {
  // Process each note as it loads
});
```

### Q: What's `takeUntil` doing in the code?

**A:** `takeUntil` automatically unsubscribes when a signal emits:

```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  // Subscribe until destroy$ emits
  this.notesStore.notes$
    .pipe(takeUntil(this.destroy$))
    .subscribe(notes => { /* ... */ });
}

ngOnDestroy(): void {
  // Emit signal to unsubscribe all
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Why use this pattern?**
- ✅ Prevents memory leaks
- ✅ Single cleanup point
- ✅ Handles all subscriptions automatically
- ✅ Clean, readable code

---

## Forms & Validation

### Q: What's the difference between `pristine` and `valid`?

**A:**

- **valid**: Form meets all validation rules (all validators pass)
- **pristine**: User hasn't modified the form since initialization
- **dirty**: User has modified the form

```typescript
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email])
});

// Initially
form.valid;      // false (email empty, required validator)
form.pristine;   // true (user hasn't typed)

// User enters invalid email
form.valid;      // false (email validator)
form.pristine;   // false (user typed)
form.dirty;      // true

// User enters valid email
form.valid;      // true (all validators pass)
form.pristine;   // false (still modified)
form.dirty;      // true
```

### Q: How do I show validation errors only when user touches a field?

**A:**

```typescript
// Check both invalid AND touched/dirty
isFieldInvalid(fieldName: string): boolean {
  const field = this.form.get(fieldName);
  return field ? field.invalid && (field.dirty || field.touched) : false;
}

// In template
<div *ngIf="isFieldInvalid('email')">
  Email is invalid
</div>
```

This way errors don't show until user interacts with the field.

### Q: Can I validate that two fields match (like password confirmation)?

**A:** Yes, use a group-level validator:

```typescript
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) return null;
  
  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

// In component
form = this.fb.group(
  { password: [''], confirmPassword: [''] },
  { validators: passwordMatchValidator }  // Apply to group
);

// In template
<div *ngIf="form.errors?.['passwordMismatch']">
  Passwords don't match
</div>
```

---

## Components & Templates

### Q: What's the difference between `*ngIf` and `[ngIf]`?

**A:**

- **`*ngIf`**: Structural directive (modifies DOM - adds/removes element)
- **`[ngIf]`**: Property binding (doesn't exist, will cause error)

```html
<!-- Correct - structural directive -->
<div *ngIf="isVisible">Shows or hides element</div>

<!-- Wrong - this doesn't work -->
<div [ngIf]="isVisible">Error!</div>
```

### Q: How do I pass multiple values from child to parent?

**A:** Use an object in @Output EventEmitter:

```typescript
// Child component
@Output() noteAction = new EventEmitter<NoteAction>();

onEdit(): void {
  this.noteAction.emit({
    type: 'edit',
    note: this.note,
    timestamp: new Date()
  });
}

// Parent template
<app-note-card
  (noteAction)="handleAction($event)">
</app-note-card>

// Parent component
handleAction(action: NoteAction): void {
  if (action.type === 'edit') {
    this.router.navigate(['/notes', action.note.id]);
  }
}
```

### Q: What's the async pipe doing?

**A:** The async pipe subscribes to observables/promises in templates:

```typescript
// Component
notes$ = this.notesStore.notes$;
loading$ = this.notesStore.loading$;

// Template
<!-- Without async pipe (manual subscription needed) -->
<div *ngIf="isLoading">Loading...</div>
<div>{{ manualData }}</div>

<!-- With async pipe (auto subscription) -->
<div *ngIf="loading$ | async">Loading...</div>
<div>{{ notes$ | async }}</div>
```

**The async pipe**:
- ✅ Automatically subscribes to observable
- ✅ Returns the emitted value
- ✅ Automatically unsubscribes when component destroys
- ✅ Triggers change detection

---

## Routing & Guards

### Q: How does the AuthGuard prevent unauthorized access?

**A:** The guard checks authentication before allowing route access:

```typescript
// In guard
canActivate(...): Observable<boolean> {
  return this.authStore.isAuthenticated$.pipe(
    take(1),  // Only check once
    tap(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);  // Redirect if not auth
      }
    })
  );
}

// In route
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]  // Check before entering
}
```

If user is not authenticated, they're redirected to login.

### Q: What's the difference between `canActivate` and `canDeactivate`?

**A:**

- **canActivate**: Checks BEFORE entering a route
  - Example: Check if user is logged in before showing dashboard
  
- **canDeactivate**: Checks BEFORE leaving a route
  - Example: Warn if user has unsaved changes

```typescript
// Entering
{
  path: 'dashboard',
  canActivate: [AuthGuard]  // ← Check here
}

// Leaving
{
  path: 'notes/:id',
  canDeactivate: [UnsavedChangesGuard]  // ← Check here
}
```

### Q: How do I get route parameters?

**A:** Use `ActivatedRoute`:

```typescript
constructor(private route: ActivatedRoute) {}

ngOnInit(): void {
  // Get :id parameter from URL
  this.route.params.subscribe(params => {
    const id = params['id'];
    this.loadNote(id);
  });
  
  // Or as observable
  const id$ = this.route.params.pipe(
    map(params => params['id'])
  );
}
```

---

## HTTP & API

### Q: Why do we need interceptors?

**A:** Interceptors modify all HTTP requests/responses globally:

```typescript
// Add JWT token to every request
@Injectable()
export class AuthInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authStore.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

**Benefits**:
- ✅ DRY (Don't Repeat Yourself) - add token once, used everywhere
- ✅ Centralized error handling
- ✅ Consistent logging across API calls

### Q: What's the difference between `throwError` and `throw new Error()`?

**A:**

- **`throwError()`**: Returns an Observable that errors (for RxJS chains)
- **`throw new Error()`**: Throws JavaScript error (breaks RxJS chain)

```typescript
// ✅ Correct - keep in Observable chain
catchError(error => throwError(() => error))

// ❌ Avoid - breaks RxJS chain
catchError(error => { throw error; })
```

---

## Performance & Optimization

### Q: Why does the search have a delay (debounce)?

**A:** Debouncing prevents filtering on every keystroke:

```typescript
searchTerm$.pipe(
  debounceTime(300)  // Wait 300ms after typing stops
).subscribe(term => {
  this.filterNotes(term);  // Only filter when user stops typing
});
```

**Benefits**:
- ✅ Fewer filter operations (better performance)
- ✅ Better UX (no jittery results)
- ✅ Reduces server load (if searching server)

### Q: What's the difference between `shareReplay` and regular observable?

**A:**

```typescript
// Without shareReplay (creates new subscription each time)
notes$ = this.http.get('/api/notes');

// Multiple subscriptions = multiple HTTP calls
this.notes$.subscribe(...);
this.notes$.subscribe(...);  // Causes another HTTP call!

// With shareReplay (shares same subscription)
notes$ = this.http.get('/api/notes').pipe(shareReplay(1));

// Multiple subscriptions = one HTTP call
this.notes$.subscribe(...);
this.notes$.subscribe(...);  // Uses cached result
```

---

## Deployment

### Q: How do I deploy Angular101 to production?

**A:**

```bash
# Build optimized version
npm run build

# This creates dist/Angular101 with minified code
# Deploy this folder to your server (Azure, AWS, etc.)

# For Azure App Service:
az webapp up --name my-angular-app --runtime "node|18"
```

### Q: What environment variables do I need?

**A:** Create `environment.ts` and `environment.prod.ts`:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200/api'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

Use in services:
```typescript
import { environment } from '../environments/environment';

login(email: string, password: string) {
  return this.http.post(`${environment.apiUrl}/login`, {...});
}
```

---

## Troubleshooting

### Q: I'm getting a "Cannot read property of undefined" error

**A:** Usually means you're accessing a property before data loads. Use safe navigation:

```html
<!-- ❌ Will error if user is undefined -->
<p>{{ user.name }}</p>

<!-- ✅ Safe - handles undefined -->
<p>{{ user?.name }}</p>

<!-- ✅ Or use *ngIf -->
<p *ngIf="user">{{ user.name }}</p>
```

### Q: My form values aren't updating

**A:** Check you're using the right method:

```typescript
// For entire form
this.form.patchValue({
  title: 'New title',
  content: 'New content'
});

// For single field
this.form.get('title').setValue('New title');
```

### Q: Observable subscription not working

**A:** Common issues:

1. **Not subscribing**: Remember you need `.subscribe()`
2. **Unsubscribed**: Used `unsubscribe()` before data arrives
3. **Error in stream**: Observable errored, no more emissions

```typescript
// Debug: add error handler
this.notesStore.notes$.subscribe({
  next: notes => console.log(notes),
  error: err => console.error('Error:', err),
  complete: () => console.log('Completed')
});
```

### Q: Form isn't disabling when loading

**A:** Check loading observable:

```html
<!-- Make sure observable completes correctly -->
<button [disabled]="(loading$ | async) === true">
  {{ (loading$ | async) ? 'Loading...' : 'Submit' }}
</button>
```

---

## Learning Paths

### Beginner (Days 1-3)
1. Run the app and use demo account
2. Read Quick Start guide
3. Study Angular Fundamentals
4. Understand components and templates

### Intermediate (Days 4-7)
1. Learn about services and DI
2. Study state management (AuthStoreService, NotesStoreService)
3. Understand RxJS basics
4. Learn routing and guards

### Advanced (Week 2+)
1. Study advanced RxJS patterns
2. Performance optimization
3. Testing strategies
4. Deployment

---

## Still Have Questions?

1. Check the [Advanced Concepts guide](20-advanced-concepts.md)
2. Review code comments in source files
3. Search Angular documentation: https://angular.io/docs
4. Read RxJS guide: https://rxjs.dev/

---

**Happy learning!** 📚
