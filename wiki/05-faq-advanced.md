# FAQ & Advanced Concepts

Common questions, troubleshooting, and advanced topics for production applications.

## Table of Contents
1. [Getting Started FAQ](#getting-started-faq)
2. [Architecture & Design FAQ](#architecture--design-faq)
3. [RxJS & Observables FAQ](#rxjs--observables-faq)
4. [Components & Forms FAQ](#components--forms-faq)
5. [Routing & Guards FAQ](#routing--guards-faq)
6. [Advanced Concepts](#advanced-concepts)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started FAQ

### Q: How do I run the application?

**A:**
```bash
cd Angular101
npm install
npm start
```

The app opens at `http://localhost:4200/`. Demo credentials:
- Email: `demo@example.com`
- Password: `password`

### Q: What Node.js version do I need?

**A:** Node.js 18+ (LTS recommended).
```bash
node --version
```

### Q: Why is my application slow on first load?

**A:** First load builds Angular in memory. Subsequent loads are faster. In production:
```bash
npm run build
```

### Q: Can I use Angular101 with a real backend?

**A:** Yes! Replace mock API endpoints in `src/app/core/services/`. The service interfaces stay the same.

---

## Architecture & Design FAQ

### Q: What's the difference between AuthService and AuthStoreService?

**A:**
- **AuthService**: Makes HTTP API calls
- **AuthStoreService**: Manages authentication state with BehaviorSubject

Think of AuthService as a translator, AuthStoreService as a manager.

### Q: Why use BehaviorSubject instead of normal Subject?

**A:**
| Feature | Subject | BehaviorSubject |
|---------|---------|-----------------|
| Initial value | No | Yes, required |
| Emit on subscribe | No | Yes, immediately |
| Use for | Events | State |

```typescript
// BehaviorSubject - state management
const auth$ = new BehaviorSubject<User | null>(null);
auth$.subscribe(user => console.log(user));  // Logs: null immediately

// Subject - events
const auth$ = new Subject<User | null>();
auth$.subscribe(user => console.log(user));  // Logs nothing until emitted
```

### Q: How does the reducer pattern work?

**A:** Pure function that takes state and action, returns new state:

```typescript
private authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false };
    default:
      return state;
  }
}
```

---

## RxJS & Observables FAQ

### Q: What's the difference between `subscribe()` and `async` pipe?

**A:**
| Feature | subscribe() | async pipe |
|---------|-------------|-----------|
| Manual | ✅ Yes | ❌ No (auto) |
| Cleanup | ❌ Manual needed | ✅ Auto on destroy |
| Memory leak risk | ❌ High | ✅ None |
| Code | ⚠️ More verbose | ✅ Cleaner |

```typescript
// ❌ Manual - need cleanup
ngOnInit() {
  this.service.data$.subscribe(data => this.data = data);
}

// ✅ Async pipe - auto cleanup
data$ = this.service.data$;
// {{ data$ | async }}
```

### Q: When should I use `switchMap` vs `mergeMap`?

**A:**
- **switchMap**: Cancel previous, start new (search, route changes)
- **mergeMap**: Keep all concurrent (bulk operations)

```typescript
// switchMap - cancel previous search
searchTerm$.pipe(
  switchMap(term => api.search(term))
).subscribe();

// mergeMap - upload all files concurrently
files$.pipe(
  mergeMap(file => upload(file), 3)  // Max 3 concurrent
).subscribe();
```

### Q: What's `takeUntil` doing in the code?

**A:** Unsubscribes when another observable emits, used for cleanup on component destroy.

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* use data */ });
}

ngOnDestroy() {
  this.destroy$.next();
}
```

### Q: What's the difference between `shareReplay` and regular observable?

**A:**
- **Regular**: Creates new HTTP call per subscriber
- **shareReplay**: Shares single HTTP call with all subscribers

```typescript
// ❌ Regular - 2 HTTP calls
const data$ = this.http.get('/api/data');
data$.subscribe();  // HTTP call 1
data$.subscribe();  // HTTP call 2

// ✅ shareReplay - 1 HTTP call shared
const data$ = this.http.get('/api/data').pipe(shareReplay(1));
data$.subscribe();  // HTTP call
data$.subscribe();  // Same data
```

---

## Components & Forms FAQ

### Q: What's the difference between `pristine` and `valid`?

**A:**
- **pristine**: Form hasn't been touched/modified by user
- **valid**: All validators pass

```typescript
form.valid;    // true if all validators pass
form.pristine; // true if user hasn't changed anything
```

### Q: How do I show validation errors only when user touches a field?

**A:**
```html
<input formControlName="email">
<div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
  Required field
</div>
```

### Q: Can I validate that two fields match (like password confirmation)?

**A:** Use a group-level validator:

```typescript
function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  
  return password?.value === confirm?.value ? null : {passwordMatch: true};
}

form = new FormGroup({
  password: new FormControl(''),
  confirmPassword: new FormControl('')
}, { validators: passwordMatch });
```

### Q: What's the difference between `*ngIf` and `[ngIf]`?

**A:**
- **\*ngIf**: Structural directive, removes/adds element from DOM
- **[ngIf]**: Doesn't exist (you meant `[hidden]`)

```html
<!-- Remove from DOM -->
<div *ngIf="isVisible">Hidden</div>

<!-- Hide with CSS (stays in DOM) -->
<div [hidden]="!isVisible">Hidden</div>
```

---

## Routing & Guards FAQ

### Q: How do I get route parameters?

**A:**
```typescript
export class DetailComponent {
  id$ = this.route.params.pipe(map(p => p['id']));

  constructor(private route: ActivatedRoute) {}
}
```

### Q: What's the difference between `canActivate` and `canDeactivate`?

**A:**
- **canActivate**: Prevent entering a route (e.g., auth check)
- **canDeactivate**: Prevent leaving a route (e.g., unsaved changes)

```typescript
// Prevent unauthorized access
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.auth.isLoggedIn();
  }
}

// Prevent losing unsaved changes
@Injectable()
export class UnsavedGuard implements CanDeactivate<any> {
  canDeactivate(component: any): boolean {
    if (component.hasUnsavedChanges()) {
      return confirm('Leave without saving?');
    }
    return true;
  }
}
```

### Q: Why do we need interceptors?

**A:** To intercept HTTP requests/responses and:
- Add auth headers
- Handle errors globally
- Log requests
- Transform responses

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.getToken();
    const cloned = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
    return next.handle(cloned);
  }
}
```

---

## Advanced Concepts

### Why does the search have a delay (debounce)?

**A:** To reduce API calls as user types:

```typescript
searchTerm$.pipe(
  debounceTime(300),  // Wait 300ms after user stops typing
  switchMap(term => api.search(term))  // Then search
).subscribe();
```

Without debounce:
- User types "react" = 5 API calls
- With debounce: 1 API call after user stops

### What's the difference between `throwError` and `throw new Error()`?

**A:**
- **throwError()**: Returns an observable that errors (for RxJS chains)
- **throw new Error()**: Throws synchronous error (breaks code)

```typescript
// ✅ RxJS error
return throwError(() => new Error('Failed'));

// ❌ Synchronous error (breaks code)
throw new Error('Failed');
```

---

## Troubleshooting

### I'm getting a "Cannot read property of undefined" error

**Cause**: Using property before it's initialized.

**Solution**: Use optional chaining or safe navigation:

```typescript
// ❌ Error if data is undefined
{{ data.name }}

// ✅ Safe
{{ data?.name }}
{{ (data$ | async)?.name }}
```

### My form values aren't updating

**Check**:
1. Form control is marked as touched: `field.markAsTouched()`
2. Template shows error when `field.invalid && field.touched`
3. Using `[formControl]` or `formControlName`

### Observable subscription not working

**Check**:
1. Observable actually emits (use tap for debugging)
2. Subscribe actually happens (not just creating)
3. Error doesn't silently fail (add error handler)

```typescript
// ✅ Debug with tap
obs$.pipe(
  tap(val => console.log('Value:', val))
).subscribe({
  next: val => {},
  error: err => console.error(err)
});
```

### Form isn't disabling when loading

**Solution**: Disable all controls in form:

```typescript
onSubmit() {
  this.form.disable();
  this.api.save(this.form.value).subscribe({
    next: () => this.form.enable(),
    error: () => this.form.enable()
  });
}
```

---

## Performance Tips

### 1. Use OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  @Input() data!: Data;  // Must be immutable
  data$ = this.service.data$;
}
```

### 2. Use async Pipe in Templates

```html
<!-- Cleaner and auto-unsubscribes -->
{{ user$ | async | json }}
```

### 3. Use shareReplay for HTTP Calls

```typescript
data$ = this.http.get(url).pipe(shareReplay(1));
```

### 4. Lazy Load Features

```typescript
const routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component')
      .then(m => m.AdminComponent)
  }
];
```

---

**Keep this guide handy for reference!** 📚
