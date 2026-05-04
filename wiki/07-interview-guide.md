# Angular & RxJS Interview Guide

Top 25+ interview questions with detailed model answers. Perfect for preparation!

## Table of Contents
1. [Beginner Questions](#beginner-questions)
2. [Intermediate Questions](#intermediate-questions)
3. [Advanced Questions](#advanced-questions)
4. [Scenario-Based Questions](#scenario-based-questions)

---

## Beginner Questions

### Q1: What is Angular?
**Answer:**
Angular is a front-end JavaScript framework built by Google for building dynamic, single-page applications (SPAs). It uses TypeScript and follows the Model-View-Controller (MVC) pattern.

**Key Points:**
- TypeScript-based framework
- Component-based architecture
- Dependency injection (DI)
- Two-way data binding with @Component
- Strong CLI tooling

**Example:**
```typescript
@Component({
  selector: 'app-root',
  template: '<h1>{{ title }}</h1>',
  styles: ['h1 { color: blue; }']
})
export class AppComponent {
  title = 'My Angular App';
}
```

---

### Q2: What is RxJS?
**Answer:**
RxJS is a library for reactive programming using Observables. It helps manage asynchronous data streams and events in a functional way.

**Key Points:**
- Functional reactive programming library
- Core concept: Observable pattern
- Operators for data transformation
- Powerful for async handling
- Works great with Angular

**Example:**
```typescript
// Create observable from array
const numbers$ = of(1, 2, 3, 4, 5);

// Transform and filter
numbers$.pipe(
  map(n => n * 2),
  filter(n => n > 4)
).subscribe(n => console.log(n));
// Output: 6, 8, 10
```

---

### Q3: What is the difference between Observable and Promise?

**Answer:**
| Feature | Observable | Promise |
|---------|-----------|---------|
| **Values** | Multiple | Single |
| **Lazy** | Yes (on subscribe) | No (executes immediately) |
| **Cancellable** | Yes (unsubscribe) | No |
| **Retry** | Easy with retry() | Complex |
| **Operators** | 100+ operators | .then() chains |
| **Cleanup** | Manual with takeUntil | Auto cleanup |
| **Use For** | Streams, events, HTTP | One-time operations |

**Best Practice:**
```typescript
// Observable - for multiple values
this.service.getData().pipe(
  map(data => data * 2)
).subscribe(result => {});

// Promise - for one-time operation
async function getData() {
  const result = await fetch(url);
  return result.json();
}
```

---

### Q4: What is @Input and @Output?

**Answer:**
- **@Input**: Pass data FROM parent TO child
- **@Output**: Send data FROM child TO parent

**Example:**
```typescript
// Child Component
@Component({
  selector: 'app-child',
  template: '<button (click)="sendData()">Send</button>'
})
export class ChildComponent {
  @Input() message: string;
  @Output() childEvent = new EventEmitter<string>();
  
  sendData() {
    this.childEvent.emit('Hello Parent');
  }
}

// Parent Component
@Component({
  template: `
    <app-child [message]="'Hi'" (childEvent)="onChildEvent($event)">
    </app-child>
  `
})
export class ParentComponent {
  onChildEvent(data: string) {
    console.log(data); // 'Hello Parent'
  }
}
```

---

### Q5: What is the async pipe?

**Answer:**
The async pipe automatically subscribes to observables in templates and unsubscribes when the component is destroyed, preventing memory leaks.

**Key Benefits:**
- ✅ Auto-subscribes to observable
- ✅ Auto-unsubscribes on destroy (no memory leak)
- ✅ Cleaner code (no manual subscribe)
- ✅ Works with OnPush change detection

**Example:**
```typescript
// Component
users$ = this.http.get<User[]>('/api/users');

// Template - AUTO SUBSCRIBE & UNSUBSCRIBE
<div *ngFor="let user of users$ | async">
  {{ user.name }}
</div>
```

---

## Intermediate Questions

### Q6: What's the difference between Subject and Observable?

**Answer:**
| Feature | Observable | Subject |
|---------|-----------|---------|
| **Source** | Data source (http, events) | Both source AND observer |
| **Subscribe** | Can create multiple | Shares single emission |
| **Emit** | Internal only | `.next()` to emit |
| **Observer** | No, passive | Yes, actively emits |
| **Use Case** | Data streams | Inter-component communication |

**Example:**
```typescript
// Observable - passive
const obs$ = new Observable(observer => {
  observer.next(1);
});
obs$.subscribe(x => console.log(x));

// Subject - active (both observer & observable)
const subject = new Subject<number>();
subject.next(1);  // Emit value
subject.subscribe(x => console.log(x));  // Listen
```

---

### Q7: When should I use switchMap vs mergeMap?

**Answer:**
- **switchMap**: Cancel previous, start new (search, route changes)
- **mergeMap**: Keep all concurrent (bulk operations, parallel requests)

**Example - switchMap (Cancel Previous):**
```typescript
// User types in search
searchTerm$.pipe(
  switchMap(term => this.api.search(term))
).subscribe(results => { /* results */ });
// If user types again, previous request is cancelled
```

**Example - mergeMap (Keep All):**
```typescript
// Upload multiple files
files$.pipe(
  mergeMap(file => this.upload(file), 3)  // Max 3 concurrent
).subscribe(result => { /* all results */ });
```

---

### Q8: What is takeUntil and why do we need it?

**Answer:**
`takeUntil` unsubscribes from an observable when another observable emits, typically used for cleanup on component destroy.

**Why needed:**
- ✅ Prevent memory leaks
- ✅ Clean up subscriptions automatically
- ✅ Works with RxJS pattern

**Pattern:**
```typescript
export class MyComponent implements OnInit, OnDestroy {
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
}
```

---

### Q9: What is a Guard and how do it work?

**Answer:**
Guards prevent unauthorized access to routes. Types: CanActivate, CanDeactivate, CanActivateChild, CanLoad.

**CanActivate Example (prevent unauthorized access):**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

// Use in routing
const routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] }
];
```

**CanDeactivate Example (prevent losing unsaved changes):**
```typescript
@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<any> {
  canDeactivate(component: any): boolean {
    if (component.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
}
```

---

### Q10: What's the difference between BehaviorSubject and Subject?

**Answer:**
| Feature | Subject | BehaviorSubject |
|---------|---------|-----------------|
| **Initial Value** | No | Yes, required |
| **Last Value** | No | Yes, always has one |
| **Immediate Emit** | No | Yes, on subscribe |
| **Use Case** | Events | State/data |

**Example:**
```typescript
// Subject - no initial value
const subject = new Subject<string>();
subject.subscribe(x => console.log(x));  // Nothing logged
subject.next('hello');  // Now logs 'hello'

// BehaviorSubject - has initial value
const bs = new BehaviorSubject<string>('initial');
bs.subscribe(x => console.log(x));  // Logs 'initial' immediately
bs.next('updated');  // Logs 'updated'
bs.value;  // Get current value: 'updated'
```

---

### Q11: What is an Interceptor?

**Answer:**
Interceptors intercept HTTP requests/responses to modify them (auth headers, error handling, logging).

**Example - Add Auth Token:**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(cloned);
  }
}

// Register in app config
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

---

### Q12: What is two-way binding and how does it work?

**Answer:**
Two-way binding syncs data between component and template (both directions). Uses `[(ngModel)]`.

**Example:**
```typescript
// Component
export class MyComponent {
  name = 'John';
}

// Template - Two-way binding
<input [(ngModel)]="name">
<p>{{ name }}</p>  <!-- Updates as you type -->
```

**How it works internally:**
```typescript
// [(ngModel)] is shorthand for:
<input [ngModel]="name" (ngModelChange)="name = $event">
```

---

## Advanced Questions

### Q13: What's the difference between hot and cold observables?

**Answer:**
- **Cold**: Creates new instance for each subscriber (like function)
- **Hot**: Shares single instance between subscribers (like event)

**Cold Observable Example:**
```typescript
// Cold - each subscribe creates NEW request
const cold$ = this.http.get('/api/data');
cold$.subscribe(data => console.log('Sub1:', data));  // Request 1
cold$.subscribe(data => console.log('Sub2:', data));  // Request 2 (SEPARATE!)
```

**Hot Observable Example:**
```typescript
// Hot - shares SINGLE request between subscribers
const hot$ = this.http.get('/api/data').pipe(shareReplay(1));
hot$.subscribe(data => console.log('Sub1:', data));   // Request 1
hot$.subscribe(data => console.log('Sub2:', data));   // Same request!
```

---

### Q14: What are ReplaySubject and AsyncSubject?

**Answer:**

**ReplaySubject**: Replays last N emissions to new subscribers
```typescript
const replay$ = new ReplaySubject<number>(2);  // Remember last 2
replay$.next(1);
replay$.next(2);
replay$.next(3);
replay$.subscribe(x => console.log(x));  // Logs: 2, 3
```

**AsyncSubject**: Only emits last value when complete
```typescript
const async$ = new AsyncSubject<number>();
async$.next(1);
async$.next(2);
async$.next(3);
async$.subscribe(x => console.log(x));  // Nothing yet
async$.complete();  // Now logs: 3 (only last value!)
```

---

### Q15: What is OnPush change detection and why use it?

**Answer:**
`OnPush` only runs change detection when @Input changes or events fire, improving performance.

**Example:**
```typescript
// ❌ Default - checks every time
@Component({
  selector: 'app-card',
  template: '{{ item.name }}'
})
export class CardComponent {
  @Input() item: any;
}

// ✅ OnPush - only when @Input changes
@Component({
  selector: 'app-card',
  template: '{{ item.name }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() item: any;  // MUST be immutable
}
```

**Benefits:**
- ✅ Better performance (less change detection)
- ✅ Forces immutable patterns
- ✅ Works great with async pipe

---

### Q16: What's the difference between ngOnInit and constructor?

**Answer:**
| Feature | constructor | ngOnInit |
|---------|-------------|----------|
| **When** | Instance created | After inputs initialized |
| **@Input** | Not available | Available |
| **DOM** | Not rendered | Already rendered |
| **Use For** | DI, initialization | Setup with @Input |

**Example:**
```typescript
export class MyComponent implements OnInit {
  @Input() data: any;

  constructor() {
    console.log(this.data);  // undefined - @Input not ready
  }

  ngOnInit() {
    console.log(this.data);  // Available now!
  }
}
```

---

### Q17: What's the difference between ngIf and ngShow?

**Answer:**
| Feature | *ngIf | [ngShow] |
|---------|-------|----------|
| **DOM** | Removed | Hidden with CSS |
| **Rendered** | No | Yes |
| **Performance** | Better for hidden | Better for toggle |
| **Use For** | Conditional features | Show/hide toggles |

**Example:**
```typescript
// *ngIf - removes from DOM
<div *ngIf="isAdmin">Admin Panel</div>

// [ngShow] - hides with CSS (display: none)
<div [ngShow]="isAdmin">Admin Panel</div>
```

---

### Q18: How do you handle errors in RxJS?

**Answer:**
Use `catchError` to handle and recover from errors.

**Example:**
```typescript
this.http.get('/api/data').pipe(
  catchError(error => {
    console.error('Error:', error);
    // Return default or retry
    return of(defaultData);
  })
).subscribe(data => {});

// Retry then catch
this.http.get('/api/data').pipe(
  retry(3),  // Retry 3 times
  catchError(error => {
    // After 3 retries fail
    return throwError(() => new Error('Failed'));
  })
).subscribe();
```

---

### Q19: What's forkJoin and how is it different from combineLatest?

**Answer:**
| Feature | forkJoin | combineLatest |
|---------|----------|---------------|
| **Waits For** | All complete | Any emits |
| **Emits** | Once (all results) | Multiple times |
| **Use Case** | Load multiple resources | Sync multiple streams |
| **Example** | Load user + posts + comments | Form inputs syncing |

**forkJoin Example:**
```typescript
// Load all data in parallel, emit once
forkJoin({
  user: this.api.getUser(id),
  posts: this.api.getPosts(id),
  comments: this.api.getComments(id)
}).subscribe(({user, posts, comments}) => {
  // All loaded at once!
});
```

**combineLatest Example:**
```typescript
// Form inputs - emit when ANY changes
combineLatest([
  this.form.get('email')!.valueChanges.pipe(startWith('')),
  this.form.get('password')!.valueChanges.pipe(startWith(''))
]).subscribe(([email, password]) => {
  // Called every time either field changes
});
```

---

## Scenario-Based Questions

### Q20: How would you implement a search feature with debounce?

**Answer:**
```typescript
export class SearchComponent {
  private searchTerm$ = new Subject<string>();
  results$: Observable<Result[]>;

  constructor(private api: ApiService) {
    this.results$ = this.searchTerm$.pipe(
      debounceTime(300),           // Wait 300ms
      distinctUntilChanged(),       // Skip duplicates
      switchMap(term =>             // Switch to new search
        term.length > 0
          ? this.api.search(term)
          : of([])
      ),
      shareReplay(1)               // Share result
    );
  }

  onSearch(term: string) {
    this.searchTerm$.next(term);
  }
}
```

---

### Q21: How would you implement authentication with JWT tokens?

**Answer:**
```typescript
// 1. AuthService - manages token
@Injectable()
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  isLoggedIn$ = this.token$.pipe(map(token => !!token));

  login(email: string, password: string) {
    return this.http.post<{token: string}>('/login', {email, password})
      .pipe(
        tap(response => {
          this.token$.next(response.token);
          localStorage.setItem('token', response.token);
        })
      );
  }

  logout() {
    this.token$.next(null);
    localStorage.removeItem('token');
  }

  getToken() {
    return this.token$.value;
  }
}

// 2. AuthInterceptor - add token to requests
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      });
    }
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.auth.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

// 3. AuthGuard - protect routes
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn$.pipe(
      take(1),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
```

---

### Q22: How would you implement a global loading state?

**Answer:**
```typescript
// LoadingService
@Injectable()
export class LoadingService {
  private loadingCount = 0;
  private loading$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading$.asObservable();

  show() {
    this.loadingCount++;
    this.loading$.next(true);
  }

  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loading$.next(false);
    }
  }
}

// LoadingInterceptor
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.loading.show();
    return next.handle(req).pipe(
      finalize(() => this.loading.hide())
    );
  }
}

// Component
export class AppComponent {
  isLoading$ = this.loading.isLoading$;
  constructor(private loading: LoadingService) {}
}

// Template
<div class="spinner" *ngIf="isLoading$ | async"></div>
```

---

### Q23: How would you implement error handling globally?

**Answer:**
```typescript
// GlobalErrorHandler
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private notifications: NotificationService,
    private logger: LoggerService
  ) {}

  handleError(error: Error | HttpErrorResponse) {
    let message = 'An error occurred';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        message = 'Resource not found';
      } else if (error.status === 401) {
        message = 'Unauthorized. Please login.';
      } else if (error.status === 500) {
        message = 'Server error. Please try again.';
      }
    }

    this.logger.error(error);
    this.notifications.showError(message);
  }
}

// Register in app config
providers: [
  {provide: ErrorHandler, useClass: GlobalErrorHandler}
]
```

---

## Quick Tips for Interviews

### Before the Interview
- ✅ Know your project inside out
- ✅ Prepare 2-3 examples from your code
- ✅ Understand RxJS operators (map, filter, switchMap)
- ✅ Know the component communication patterns
- ✅ Practice explaining code out loud

### During the Interview
- ✅ Ask clarifying questions
- ✅ Think out loud (they want to see your process)
- ✅ Give real examples from your experience
- ✅ Discuss trade-offs
- ✅ Handle wrong answers gracefully

### Common Mistakes to Avoid
- ❌ Not explaining WHY (just WHAT)
- ❌ Forgetting error handling
- ❌ Not mentioning memory leaks
- ❌ Ignoring performance implications
- ❌ No mention of testing

### Interview Scenario Example
**Q: How would you implement a feature that loads data when a user types in a search box?**

**Good Answer:**
"I would use RxJS with debounceTime and switchMap. The debounceTime waits 300ms after the user stops typing, preventing excessive API calls. The switchMap cancels previous requests if the user types again. I'd use the async pipe in the template to manage subscriptions automatically and prevent memory leaks. I'd also add error handling with catchError and use shareReplay to avoid duplicate requests."

**Why it's good:**
- ✅ Shows knowledge of RxJS
- ✅ Addresses performance
- ✅ Mentions memory leak prevention
- ✅ Real-world thinking

---

**Good luck with your interviews!** 🚀
