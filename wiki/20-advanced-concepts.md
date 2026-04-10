# Advanced Angular Concepts

Deep dive into advanced topics for production applications.

## Table of Contents
1. [Testing](#testing)
2. [Performance Optimization](#performance-optimization)
3. [State Management at Scale](#state-management-at-scale)
4. [Deployment & Environment Configuration](#deployment)
5. [Security Best Practices](#security)
6. [Error Handling Patterns](#error-handling)

---

## Testing

### Unit Testing Services

Test services with HttpClientTestingModule:

```typescript
// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login user', () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', name: 'Test' },
      token: 'jwt-token'
    };

    service.login('test@example.com', 'password').subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);  // Simulate response
  });

  afterEach(() => {
    httpMock.verify();  // Ensure no outstanding requests
  });
});
```

### Testing Components

```typescript
// login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthStoreService } from '@core/services/auth-store.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authStore: jasmine.SpyObj<AuthStoreService>;

  beforeEach(async () => {
    const authStoreSpy = jasmine.createSpyObj('AuthStoreService', ['login', 'clearError']);
    
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthStoreService, useValue: authStoreSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authStore = TestBed.inject(AuthStoreService) as jasmine.SpyObj<AuthStoreService>;
  });

  it('should call login when form is valid', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should not call login when form is invalid', () => {
    component.onSubmit();
    expect(authStore.login).not.toHaveBeenCalled();
  });

  it('should display error message when form is invalid', () => {
    const compiled = fixture.nativeElement;
    component.onSubmit();
    fixture.detectChanges();

    // After submit, email field should show error
    expect(component.isFieldInvalid('email')).toBe(true);
  });
});
```

### Testing Observables

```typescript
// notes-store.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { NotesStoreService } from './notes-store.service';
import { NotesService } from './notes.service';
import { of, throwError } from 'rxjs';

describe('NotesStoreService', () => {
  let store: NotesStoreService;
  let notesService: jasmine.SpyObj<NotesService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotesService', ['fetchNotes', 'createNote']);

    TestBed.configureTestingModule({
      providers: [
        NotesStoreService,
        { provide: NotesService, useValue: spy }
      ]
    });

    store = TestBed.inject(NotesStoreService);
    notesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
  });

  it('should emit loading and notes on successful fetch', (done) => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1' }
    ];
    notesService.fetchNotes.and.returnValue(of(mockNotes));

    let loadingStates: boolean[] = [];
    let fetchedNotes: any[] = [];

    store.loading$.subscribe(loading => loadingStates.push(loading));
    store.notes$.subscribe(notes => fetchedNotes.push(notes));

    store.loadNotes();

    setTimeout(() => {
      // Should have: START (true), then SUCCESS (false)
      expect(loadingStates).toContain(true);
      expect(fetchedNotes).toContain(mockNotes);
      done();
    }, 100);
  });

  it('should handle errors', (done) => {
    notesService.fetchNotes.and.returnValue(throwError(() => new Error('API Error')));

    store.error$.subscribe(error => {
      if (error) {
        expect(error).toContain('Error');
        done();
      }
    });

    store.loadNotes();
  });
});
```

---

## Performance Optimization

### Change Detection Strategy

Use OnPush for better performance:

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-note-card',
  template: '...',
  changeDetection: ChangeDetectionStrategy.OnPush  // Manual CD
})
export class NoteCardComponent {
  @Input() note!: Note;
  
  // Change detection only triggers when:
  // 1. @Input changes
  // 2. Event handler fires
  // 3. Async pipe emits new value
}
```

**Benefits**:
- ✅ Runs change detection only when necessary
- ✅ ~80% faster for data-heavy apps
- ✅ Requires @Input properties to be immutable

### Lazy Loading Routes

Load modules only when needed:

```typescript
// app.routes.ts
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)  // Load on demand
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./pages/note-detail/note-detail.component')
        .then(m => m.NoteDetailComponent)
  }
];
```

**Benefits**:
- ✅ Smaller initial bundle
- ✅ Faster initial load
- ✅ Better for large apps

### Unsubscribe Patterns

Prevent memory leaks:

```typescript
// Pattern 1: takeUntil (Recommended)
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Pattern 2: take(1) for single emissions
this.route.params.pipe(take(1)).subscribe(params => {
  // Only one emission needed
});

// Pattern 3: Async pipe in templates
{{ data$ | async }}  // Auto unsubscribes
```

### Memoization with shareReplay

Share expensive operations:

```typescript
// Without shareReplay - HTTP call on every subscription
notes$ = this.http.get('/api/notes');  // New call each time!

// With shareReplay - one HTTP call, cached result
notes$ = this.http.get('/api/notes').pipe(
  shareReplay(1)  // Cache and share one value
);

// First subscription - triggers HTTP call
this.notes$.subscribe(...);

// Second subscription - uses cached value
this.notes$.subscribe(...);
```

### Debouncing & Throttling

Prevent excessive operations:

```typescript
// Debounce: Wait for user to stop typing
searchTerm$ = new Subject<string>();
filteredNotes$ = this.searchTerm$.pipe(
  debounceTime(300),        // Wait 300ms
  distinctUntilChanged(),     // Only if value changed
  switchMap(term =>           // New search cancels old one
    this.notesService.search(term)
  )
);

// Throttle: Limit operations to once per interval
handleScroll$ = new Subject<Event>();
throttledScroll$ = this.handleScroll$.pipe(
  throttleTime(100)  // Max once per 100ms
);
```

---

## State Management at Scale

### Multiple Stores

For larger apps, split stores by domain:

```typescript
// auth-store.service.ts
@Injectable({ providedIn: 'root' })
export class AuthStore {
  // Only authentication state
}

// notes-store.service.ts
@Injectable({ providedIn: 'root' })
export class NotesStore {
  // Only notes state
}

// products-store.service.ts
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  // Only products state
}

// In component, inject what you need
constructor(
  private auth: AuthStore,
  private notes: NotesStore
) {}
```

**Benefits**:
- ✅ Clear separation of concerns
- ✅ Each store manages one domain
- ✅ Easier to maintain
- ✅ Reusable stores in multiple components

### Complex Derived State

Calculate state from multiple sources:

```typescript
// Combine multiple sources for derived state
allData$ = combineLatest([
  this.authStore.currentUser$,    // Get current user
  this.notesStore.notes$,          // Get all notes
  this.notesStore.loading$         // Get loading state
]).pipe(
  map(([user, notes, loading]) => ({
    // Calculate derived values
    userNoteCount: notes.length,
    userFullName: user?.name || 'Guest',
    isLoadingUserNotes: loading,
    recentNotes: notes.slice(0, 5)
  })),
  shareReplay(1)
);
```

### Filtering & Sorting Observables

```typescript
// Sort notes by date (newest first)
sortedNotes$ = this.notes$.pipe(
  map(notes =>
    [...notes].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )
);

// Filter by category
selectedCategory$ = new BehaviorSubject<string>('all');
filteredNotes$ = combineLatest([
  this.notes$,
  this.selectedCategory$
]).pipe(
  map(([notes, category]) =>
    category === 'all'
      ? notes
      : notes.filter(n => n.category === category)
  )
);
```

---

## Deployment & Environment Configuration

### Environment Files

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  logLevel: 'debug',
  enableMockApi: true
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  logLevel: 'error',
  enableMockApi: false
};
```

### Conditional Imports

```typescript
// services/api.service.ts
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getApiUrl(): string {
    if (environment.production) {
      return environment.apiUrl;
    }
    return environment.apiUrl;
  }

  // In prod, real API; in dev, mock API
}
```

### Build for Production

```bash
# Development build (larger, with source maps)
npm start

# Production build (minified, optimized)
npm run build

# Analyze bundle size
ng build --stats-json
webpack-bundle-analyzer dist/Angular101/stats.json
```

### Deployment Options

**Azure App Service**:
```bash
az webapp up --name my-app --resource-group my-group
```

**Azure Static Web Apps** (Recommended for SPAs):
```bash
# Deploy via GitHub Actions
# Automatically builds and deploys on push
```

**Docker**:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/Angular101 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Security Best Practices

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### HTTPS Only

```typescript
// Enforce HTTPS in production
if (environment.production) {
  // Force HTTPS
  if (document.location.protocol !== 'https:') {
    document.location.href = 'https:' + window.location.href.substring(5);
  }
}
```

### Token Security

```typescript
// Store tokens securely
@Injectable()
export class TokenService {
  setToken(token: string): void {
    // Use httpOnly cookie in production (better than localStorage)
    // localStorage is used in this example for simplicity
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }
}
```

### Input Sanitization

```typescript
// Always sanitize user input
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  template: `<div [innerHTML]="safeHtml"></div>`
})
export class MyComponent {
  safeHtml: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  setHtml(html: string): void {
    // Sanitize before displaying
    this.safeHtml = this.sanitizer.sanitize(
      SecurityContext.HTML,
      html
    ) as SafeHtml;
  }
}
```

---

## Error Handling Patterns

### Global Error Handler

```typescript
// Create error handler service
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: Error | HttpErrorResponse): void {
    let errorMessage = '';

    if (error instanceof HttpErrorResponse) {
      // Backend-returned error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    } else {
      // Client-side error
      errorMessage = error.message;
    }

    this.logger.error(errorMessage);
    console.error('Error:', errorMessage);
  }
}

// Register in app config
export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

### Retry Logic

```typescript
// Retry failed requests
this.http.get('/api/data').pipe(
  retry({
    count: 3,
    delay: 1000  // Wait 1s between retries
  }),
  catchError(error => {
    // After 3 retries fail, handle error
    return throwError(() => new Error('Failed after 3 retries'));
  })
).subscribe(
  data => console.log(data),
  error => console.error(error)
);
```

### Circuit Breaker Pattern

```typescript
// Prevent cascading failures
let failureCount = 0;
const threshold = 5;
const timeout = 60000; // 1 minute

export function withCircuitBreaker<T>(
  request: Observable<T>
): Observable<T> {
  if (failureCount >= threshold) {
    return throwError(() =>
      new Error('Circuit breaker: Service unavailable')
    );
  }

  return request.pipe(
    catchError(error => {
      failureCount++;

      if (failureCount >= threshold) {
        // Reset after timeout
        setTimeout(() => { failureCount = 0; }, timeout);
      }

      return throwError(() => error);
    })
  );
}
```

---

## Monitoring & Analytics

### Performance Monitoring

```typescript
// Track route changes
@Injectable()
export class PerformanceMonitor {
  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    this.trackRouting();
  }

  private trackRouting(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd)
      )
      .subscribe(event => {
        // Track page view
        console.log('Navigation to:', event.urlAfterRedirects);
        // Send to analytics service
      });
  }
}
```

### Logging Service

```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(private http: HttpClient) {}

  log(message: string, data?: any): void {
    console.log(message, data);
    // Send to logging service in production
  }

  error(message: string, error?: Error): void {
    console.error(message, error);
    // Send to error tracking service
  }

  warn(message: string): void {
    console.warn(message);
  }
}
```

---

## Best Practices Summary

### ✅ DO:
- Use OnPush change detection strategy
- Lazy load routes and components
- Unsubscribe from observables (takeUntil, async pipe)
- Use shareReplay for shared operations
- Implement global error handling
- Test services and components
- Use environment configuration
- Sanitize user input
- Monitor performance

### ❌ DON'T:
- Manually subscribe without unsubscribing
- Use default change detection for large lists
- Store sensitive data in localStorage
- Trust user input without validation
- Leave console.logs in production
- Skip error handling
- Deploy without testing
- Use inline styles for dynamic content

---

## Next Steps

1. Implement testing in your components
2. Profile app performance with DevTools
3. Set up deployment pipeline
4. Add monitoring and analytics
5. Implement security measures

---

**Master these concepts to build production-quality Angular applications!** 🚀
