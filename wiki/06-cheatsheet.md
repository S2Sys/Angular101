# Angular & RxJS Cheat Sheet

Quick reference guide for the most common patterns and operations.

## Table of Contents
1. [RxJS Operators](#rxjs-operators)
2. [Observable Creation](#observable-creation)
3. [Subject Types Deep Dive](#subject-types-deep-dive)
4. [Hot vs Cold Observables](#hot-vs-cold-observables)
5. [Component Communication](#component-communication)
6. [Change Detection & OnPush](#change-detection--onpush-strategy)
7. [Reactive Forms Deep Dive](#reactive-forms-deep-dive)
8. [Common Patterns](#common-patterns)
9. [Error Handling](#error-handling)
10. [Performance Tips](#performance-tips)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [Pipes & Async Pipes](#pipes--async-pipes)

---

## RxJS Operators

### Transformation

| Operator | Purpose | Points to Remember |
|----------|---------|-------------------|
| `map(fn)` | Transform each value | Returns new observable with transformed values |
| `filter(predicate)` | Keep only matching values | Returns observable with filtered values |
| `scan(accumulator)` | Like reduce but emits intermediate results | Useful for running totals |
| `pluck('key')` | Extract property from objects | Shorthand for map(obj => obj.key) |
| `switchMap(fn)` | Map to new observable, cancel previous | Cancels old subscription when new arrives |
| `mergeMap(fn)` | Map to new observable, keep previous | Concurrent subscriptions allowed |
| `concatMap(fn)` | Map to new observable, queue in order | Waits for previous to complete |
| `exhaustMap(fn)` | Ignore new while processing | Only one subscription at a time |

### Filtering

| Operator | Purpose | Points to Remember |
|----------|---------|-------------------|
| `filter(fn)` | Keep only matching | Returns empty if no match |
| `debounceTime(ms)` | Wait before emitting | Good for search/input fields |
| `throttleTime(ms)` | Max emit frequency | Good for scroll/resize events |
| `distinctUntilChanged()` | Skip duplicate values | Compares with previous value |
| `take(n)` | Emit only first n values | Auto-completes after n emissions |
| `takeUntil(signal$)` | Stop when signal emits | Perfect for cleanup on destroy |
| `skipWhile(fn)` | Skip while predicate true | Start emitting once false |
| `startWith(value)` | Prepend initial value | Useful for defaults |

### Combining

| Operator | Purpose | When to Use | Points to Remember |
|----------|---------|------------|-------------------|
| `combineLatest([o1, o2])` | All emit, then sync | Multiple reactive inputs | Emits when ANY changes (after all emit once) |
| `forkJoin({a: o1, b: o2})` | Wait for all to complete | Parallel requests | Emits ONCE with all results |
| `merge(o1, o2)` | Any source emits | Multiple event streams | No waiting, just combine |
| `zip(o1, o2)` | Pair values | Coordinate two streams | Waits for both to emit |
| `concat(o1, o2)` | Sequential execution | Queue operations | Starts second when first completes |
| `withLatestFrom(o1, o2)` | Add other values | Triggered by one, uses latest from others | Good for form + filter |

### Utility

| Operator | Purpose | Points to Remember |
|----------|---------|-------------------|
| `tap(fn)` | Inspect without changing | Useful for debugging |
| `shareReplay(1)` | Share result, cache | Prevents duplicate HTTP calls |
| `timeout(ms)` | Fail if no emission | Good for request timeout |
| `retry(n)` | Retry on error | Configurable retry count |
| `catchError(fn)` | Handle errors | MUST return observable |
| `finalize(fn)` | Run on complete/error | Cleanup code |

---

## Observable Creation

### Create Observables

```typescript
// From Subject
const subject = new Subject<T>();
subject.next(value);
subject.subscribe(val => {});

// From BehaviorSubject (has initial value)
const bs = new BehaviorSubject<T>(initialValue);
bs.value  // Get current value
bs.next(newValue);

// From Promise
from(promise);

// From Event
fromEvent(element, 'click');

// From Array
from([1, 2, 3]);

// From HTTP
this.http.get<T>(url);

// Custom
new Observable(subscriber => {
  subscriber.next(value);
  subscriber.error(error);
  subscriber.complete();
});

// Immediate values
of(1, 2, 3);

// Delayed emission
interval(1000);  // Every second
timer(5000);     // After 5 seconds
```

---

## Component Communication

### Parent → Child (@Input)

```typescript
// Parent
<app-child [property]="value"></app-child>

// Child
@Input() property: any;
@Input() required property!: Type;  // Required input (Angular 16+)
@Input() set property(val: any) {   // With setter
  this._prop = val;
}
```

**Points to Remember:**
- ✅ Unidirectional data flow
- ✅ Parent controls updates
- ❌ Don't modify @Input directly

### Child → Parent (@Output)

```typescript
// Child
@Output() eventName = new EventEmitter<T>();
onSomething() {
  this.eventName.emit(value);
}

// Parent
<app-child (eventName)="handler($event)"></app-child>
```

**Points to Remember:**
- ✅ Child initiates, parent handles
- ✅ Loose coupling
- ✅ Child doesn't know who listens

### Two-Way Binding

```typescript
// Child
@Input() value!: T;
@Output() valueChange = new EventEmitter<T>();
onChange(newVal: T) {
  this.valueChange.emit(newVal);
}

// Parent
<app-child [(value)]="myValue"></app-child>
// Equivalent to:
<app-child [value]="myValue" (valueChange)="myValue = $event"></app-child>
```

### Sibling via Service

```typescript
// Service
private subject = new Subject<T>();
send(value: T) { this.subject.next(value); }
receive$ = this.subject.asObservable();

// Sender
constructor(private service: Service) {}
send() { this.service.send(value); }

// Receiver
constructor(private service: Service) {}
ngOnInit() {
  this.service.receive$.subscribe(val => { /* use val */ });
}
```

### Global Store

```typescript
// Store Service
@Injectable()
export class MyStore {
  private dataSubject = new BehaviorSubject<T>(initial);
  data$ = this.dataSubject.asObservable();
  
  updateData(value: T) { this.dataSubject.next(value); }
  getData(): T { return this.dataSubject.value; }
}

// Any Component
data$ = this.store.data$;  // In template: {{ data$ | async }}
this.store.updateData(newValue);
```

---

## Common Patterns

### Pattern: Search Input (debounce + switchMap)

```typescript
private searchTerm$ = new Subject<string>();

results$ = this.searchTerm$.pipe(
  debounceTime(300),        // Wait 300ms
  distinctUntilChanged(),     // Only if different
  switchMap(term =>           // Switch to new search
    term.length > 0
      ? this.api.search(term)
      : of([])
  ),
  shareReplay(1)
);

onSearch(term: string) {
  this.searchTerm$.next(term);
}
```

**Remember:** switchMap cancels previous requests

### Pattern: Form Validation (combineLatest)

```typescript
isValid$ = combineLatest([
  this.form.get('email')!.statusChanges.pipe(startWith('')),
  this.form.get('password')!.statusChanges.pipe(startWith(''))
]).pipe(
  map(() => this.form.valid),
  distinctUntilChanged()
);
```

**Remember:** Emits when ANY form field changes

### Pattern: Load Multiple Data (forkJoin)

```typescript
initialData$ = forkJoin({
  user: this.api.getUser(id),
  posts: this.api.getPosts(id),
  comments: this.api.getComments(id)
}).pipe(
  tap(data => console.log('All loaded:', data)),
  shareReplay(1)
);
```

**Remember:** Waits for ALL to complete, emits once

### Pattern: Cleanup Subscriptions (takeUntil)

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

**Remember:** Always cleanup in ngOnDestroy

### Pattern: Conditional Observable (switchMap)

```typescript
// Show user's notes based on selected user
notes$ = this.selectedUser$.pipe(
  switchMap(user =>
    user
      ? this.api.getUserNotes(user.id)
      : of([])
  )
);
```

**Remember:** switchMap is perfect for "change to new observable" scenarios

---

## Error Handling

### Catch & Continue

```typescript
this.http.get(url).pipe(
  catchError(err => {
    console.error('Error:', err);
    return of(defaultValue);  // Continue with default
  })
).subscribe(data => {});
```

### Retry on Failure

```typescript
this.http.get(url).pipe(
  retry({
    count: 3,
    delay: 1000  // Wait 1 second between retries
  }),
  catchError(err => {
    // After 3 retries fail
    return throwError(() => new Error('Failed'));
  })
).subscribe();
```

### Handle Multiple Error Types

```typescript
this.api.call().pipe(
  catchError(err => {
    if (err.status === 404) {
      return of({ empty: true });
    } else if (err.status === 401) {
      this.router.navigate(['/login']);
      return EMPTY;
    } else {
      return throwError(() => err);
    }
  })
).subscribe();
```

### Global Error Handler

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: Error | HttpErrorResponse): void {
    this.logger.error(error);
    // Show to user, track to analytics, etc.
  }
}

// In app.config.ts
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler }
]
```

---

## Performance Tips

### 1. Use ShareReplay for Expensive Operations
```typescript
// ❌ BAD - Creates new HTTP call for each subscriber
data$ = this.http.get('/api/data');

// ✅ GOOD - Shares single HTTP call
data$ = this.http.get('/api/data').pipe(shareReplay(1));
```

### 2. Debounce User Input
```typescript
// ❌ BAD - API call on every keystroke
searchTerm.subscribe(term => this.api.search(term));

// ✅ GOOD - Wait for user to stop typing
searchTerm.pipe(debounceTime(300)).subscribe(...);
```

### 3. Unsubscribe Properly
```typescript
// ❌ BAD - Memory leak
ngOnInit() {
  this.service.data$.subscribe(data => {});
}

// ✅ GOOD - Cleanup on destroy
private destroy$ = new Subject<void>();
ngOnInit() {
  this.service.data$.pipe(takeUntil(this.destroy$))
    .subscribe(data => {});
}
ngOnDestroy() {
  this.destroy$.next();
}

// ✅ BEST - Use async pipe
// {{ data$ | async }}
```

### 4. Use OnPush Change Detection
```typescript
// ✅ Better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  @Input() data!: Data;  // Must be immutable
}
```

### 5. Use Lazy Loading
```typescript
// ✅ Split bundle
{
  path: 'dashboard',
  loadComponent: () =>
    import('@pages/dashboard')
      .then(m => m.DashboardComponent)
}
```

---

## Anti-Patterns to Avoid

### ❌ Nested Subscriptions (Callback Hell)
```typescript
// DON'T DO THIS
this.service.get(id).subscribe(item => {
  this.api.fetch(item.id).subscribe(data => {
    this.process(data).subscribe(result => {
      // Callback hell!
    });
  });
});

// DO THIS INSTEAD
this.service.get(id).pipe(
  switchMap(item => this.api.fetch(item.id)),
  switchMap(data => this.process(data))
).subscribe(result => {});
```

### ❌ Not Handling Errors
```typescript
// DON'T DO THIS
this.http.get(url).subscribe(data => {
  this.data = data;
  // What if error? Observable completes, component broken!
});

// DO THIS INSTEAD
this.http.get(url).pipe(
  catchError(err => {
    console.error(err);
    return of(defaultValue);
  })
).subscribe(data => { this.data = data; });
```

### ❌ Forgetting to Unsubscribe
```typescript
// DON'T DO THIS
ngOnInit() {
  this.interval$ = interval(1000).subscribe(n => {
    console.log(n);
    // Memory leak! Never unsubscribes
  });
}

// DO THIS INSTEAD
private destroy$ = new Subject<void>();
ngOnInit() {
  interval(1000).pipe(
    takeUntil(this.destroy$)
  ).subscribe(n => console.log(n));
}
ngOnDestroy() {
  this.destroy$.next();
}
```

### ❌ Modifying @Input Properties
```typescript
// DON'T DO THIS
@Input() user!: User;
ngOnInit() {
  this.user.name = 'Changed';  // Breaks parent, hard to debug
}

// DO THIS INSTEAD
@Input() user!: User;
@Output() userChanged = new EventEmitter<User>();
onNameChange(newName: string) {
  this.userChanged.emit({ ...this.user, name: newName });
}
```

### ❌ Async Pipe in Functions
```typescript
// DON'T DO THIS
get userName() {
  this.user$ // Returns observable, not value!
}

// DO THIS INSTEAD
userName$ = this.user$.pipe(map(u => u.name));
// In template: {{ userName$ | async }}
```

---

## Quick Decision Guide

### Need to transform data?
→ `map()`

### Need to filter data?
→ `filter()` or `debounceTime()` or `distinctUntilChanged()`

### Need to wait for multiple requests?
→ `forkJoin()`

### Need continuous sync of multiple streams?
→ `combineLatest()`

### Need to cancel previous and start new?
→ `switchMap()`

### Need to combine with another operation?
→ `withLatestFrom()` or `combineLatest()`

### Need to handle errors gracefully?
→ `catchError()`

### Need to clean up subscriptions?
→ `takeUntil(destroy$)` or `async` pipe

### Need parent-child communication?
→ `@Input` / `@Output`

### Need sibling communication?
→ Shared service with `Subject`

### Need app-wide state?
→ Global store with `BehaviorSubject`

---

## One-Liners

```typescript
// Search with debounce
search$ = term$.pipe(debounceTime(300), switchMap(t => api.search(t)))

// Load multiple resources
data$ = forkJoin({user: api.user(), posts: api.posts()})

// Filter and transform
filtered$ = combineLatest([items$, filter$]).pipe(
  map(([items, f]) => items.filter(i => i.category === f))
)

// Cleanup on destroy
constructor() { this.svc.data$.pipe(takeUntil(new Subject())).subscribe() }

// Share expensive operation
cached$ = http.get(url).pipe(shareReplay(1))

// Handle errors
safe$ = obs$.pipe(catchError(e => of(null)))

// Convert promise to observable
obs$ = from(promise)

// Create from array
nums$ = from([1, 2, 3])

// Create from event
click$ = fromEvent(button, 'click')

// Retry failed requests
retry$ = http.get(url).pipe(retry({count: 3, delay: 1000}))
```

---

## Subject Types Deep Dive

### Subject vs Observable

| Feature | Observable | Subject |
|---------|-----------|---------|
| **Source** | External data source | Both source & observer |
| **Emit** | Internal only | Explicit `.next()` |
| **Subscriber** | Read-only | Can emit values |
| **Hot** | Cold (by default) | Hot (shared) |
| **Use Case** | Data streams (HTTP, events) | Inter-component communication |

### All Subject Types

```typescript
// 1. SUBJECT - Basic, no initial value
const subject = new Subject<string>();
subject.next('hello');
subject.subscribe(x => console.log(x));  // Nothing, missed it
subject.next('world');  // Logs: world

// 2. BEHAVIOR SUBJECT - Has initial value
const bs = new BehaviorSubject<string>('initial');
bs.subscribe(x => console.log(x));  // Logs: initial (immediately!)
bs.next('updated');
bs.value;  // Can get current value

// 3. REPLAY SUBJECT - Remembers last N emissions
const replay$ = new ReplaySubject<number>(2);  // Buffer size: 2
replay$.next(1);
replay$.next(2);
replay$.next(3);
replay$.subscribe(x => console.log(x));  // Logs: 2, 3 (last 2)

// 4. ASYNC SUBJECT - Emits only last value when complete
const async$ = new AsyncSubject<number>();
async$.next(1);
async$.next(2);
async$.next(3);
async$.subscribe(x => console.log(x));  // Nothing yet
async$.complete();  // Now logs: 3 (only last!)
```

### When to Use Each Subject

| Subject | When | Example |
|---------|------|---------|
| **Subject** | Event broadcasting | Button clicks, notifications |
| **BehaviorSubject** | State management | Current user, app settings |
| **ReplaySubject** | Show history | Last 10 messages in chat |
| **AsyncSubject** | Final result | Last value of operation |

---

## Hot vs Cold Observables

### Cold Observable (Unicast)

Each subscriber gets its own independent execution.

```typescript
// Cold - Creates NEW HTTP request per subscriber
const cold$ = this.http.get('/api/data');

cold$.subscribe(data => console.log('Sub1:', data));  // HTTP Call 1
cold$.subscribe(data => console.log('Sub2:', data));  // HTTP Call 2 - SEPARATE!

// Two HTTP requests! ❌ Inefficient
```

**Characteristics:**
- ✅ Fresh data for each subscriber
- ✅ Doesn't start until subscribed
- ✅ Each subscriber gets own data
- ❌ Duplicate work/requests

### Hot Observable (Multicast)

All subscribers share the same execution.

```typescript
// Hot - Shares SINGLE HTTP request with all subscribers
const hot$ = this.http.get('/api/data').pipe(shareReplay(1));

hot$.subscribe(data => console.log('Sub1:', data));   // HTTP Call 1
hot$.subscribe(data => console.log('Sub2:', data));   // Same data!

// One HTTP request shared! ✅ Efficient
```

**Characteristics:**
- ✅ Shared data for all subscribers
- ✅ Starts regardless of subscribers
- ✅ More efficient
- ❌ Late subscribers miss previous values

### How to Make Cold → Hot

```typescript
// Method 1: shareReplay(n) - Cache last n emissions
cold$ = this.http.get('/api/data');
hot$ = cold$.pipe(shareReplay(1));  // ✅ Hot now

// Method 2: share() - Share without cache
hot$ = cold$.pipe(share());

// Method 3: Subject - Explicitly hot
const subject = new Subject();
cold$.subscribe(subject);
subject.subscribe(subscriber1);
subject.subscribe(subscriber2);
```

---

## Change Detection & OnPush Strategy

### Default Change Detection

Angular checks entire component tree for changes.

```typescript
// ❌ Default - Checks every time, slower for large trees
@Component({
  selector: 'app-card',
  template: '{{ item.name }}'
})
export class CardComponent {
  @Input() item: any;
}
```

### OnPush Change Detection

Only checks when @Input changes or events fire.

```typescript
// ✅ OnPush - Faster, checks only when needed
@Component({
  selector: 'app-card',
  template: '{{ item.name }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() item: any;  // ⚠️ Must be immutable!
}
```

### OnPush Best Practices

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  // ✅ Use immutable objects
  @Input() user!: {name: string, email: string};

  // ✅ Use async pipe
  data$ = this.service.data$;

  // ✅ Keep observables, avoid properties
  // Don't do: this.data = null; then call API

  // ✅ Emit events, don't modify data
  @Output() updated = new EventEmitter<User>();

  onSave() {
    this.updated.emit(newUser);  // Don't modify, emit!
  }
}
```

### Performance Pattern

```typescript
// ✅ BEST - Optimized with OnPush + async pipe
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  // Only observables, no properties
  users$ = this.service.getUsers();
  selected$ = this.service.getSelected();
}

// Template
<div *ngFor="let user of users$ | async">
  {{ user.name }}
</div>
```

---

## Reactive Forms Deep Dive

### FormControl (Single Field)

```typescript
// Component
email = new FormControl('initial@example.com', [
  Validators.required,
  Validators.email
]);

// Template
<input [formControl]="email">
<div *ngIf="email.errors?.['required']">Required</div>
<div *ngIf="email.errors?.['email']">Invalid email</div>

// Access value
this.email.value;
this.email.valueChanges.subscribe(val => {});
this.email.statusChanges.subscribe(status => {});
```

### FormGroup (Multiple Fields)

```typescript
// Component
form = new FormGroup({
  email: new FormControl('', Validators.required),
  password: new FormControl('', Validators.minLength(8)),
  confirmPassword: new FormControl('')
});

// Template
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email">
  <input formControlName="password">
  <input formControlName="confirmPassword">
  <button [disabled]="form.invalid">Submit</button>
</form>

// Access form
this.form.value;  // {email: '', password: '', confirmPassword: ''}
this.form.valid;  // true/false
this.form.get('email')?.value;
this.form.get('email')?.errors;
```

### FormArray (Dynamic Fields)

```typescript
// Component
form = new FormGroup({
  emails: new FormArray([
    new FormControl('', Validators.email)
  ])
});

get emailsArray(): FormArray {
  return this.form.get('emails') as FormArray;
}

addEmail() {
  this.emailsArray.push(new FormControl(''));
}

removeEmail(i: number) {
  this.emailsArray.removeAt(i);
}

// Template
<div formArrayName="emails">
  <div *ngFor="let email of emailsArray.controls; let i = index">
    <input [formControlName]="i">
    <button (click)="removeEmail(i)">Remove</button>
  </div>
</div>
<button (click)="addEmail()">Add Email</button>
```

### Custom Validators

```typescript
// Validator function
function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  return password.value === confirmPassword.value ? null : { passwordMatch: true };
}

// Use in form
form = new FormGroup({
  password: new FormControl(''),
  confirmPassword: new FormControl('')
}, { validators: passwordMatch });

// Template
<div *ngIf="form.errors?.['passwordMatch']">
  Passwords don't match
</div>
```

### Form Status & Value Changes

```typescript
// Watch for changes
this.form.valueChanges.pipe(
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(value => this.api.validate(value))
).subscribe(errors => {
  // Handle validation errors
});

// Watch status (valid, invalid, pending)
this.form.statusChanges.subscribe(status => {
  console.log(status);  // VALID, INVALID, PENDING
});
```

---

## Pipes & Async Pipes

### What is a Pipe?

A pipe transforms data in templates. Uses `|` syntax.

```typescript
// Syntax: data | pipeName:arg1:arg2
{{ name | uppercase }}
{{ price | currency:'USD' }}
{{ date | date:'short' }}
```

### Built-In Pipes Quick Reference

| Pipe | Purpose | Example |
|------|---------|---------|
| `uppercase` | Convert to uppercase | `{{ text \| uppercase }}` |
| `lowercase` | Convert to lowercase | `{{ text \| lowercase }}` |
| `titlecase` | Title Case Format | `{{ text \| titlecase }}` |
| `currency` | Format as currency | `{{ price \| currency:'USD' }}` |
| `number` | Format number | `{{ value \| number:'1.2-2' }}` |
| `percent` | Format as percentage | `{{ value \| percent }}` |
| `date` | Format date | `{{ date \| date:'short' }}` |
| `slice` | Get substring/subarray | `{{ text \| slice:0:5 }}` |
| `json` | Convert to JSON | `{{ obj \| json }}` |
| `keyvalue` | Iterate object entries | `{{ obj \| keyvalue }}` |

### ⭐ Async Pipe (Most Important)

The `async` pipe subscribes to observables and unsubscribes automatically on destroy.

#### Basic Usage

```typescript
// Component
export class MyComponent {
  data$ = this.api.getData();  // Observable<Data>
}

// Template
{{ data$ | async }}  // Automatically subscribes & unsubscribes
```

#### Why Use Async Pipe?

| Feature | With Async | Without Async |
|---------|-----------|---------------|
| **Auto Subscribe** | ✅ Yes | ❌ Manual `.subscribe()` |
| **Auto Unsubscribe** | ✅ Yes (OnDestroy) | ❌ Manual cleanup needed |
| **Memory Leak Risk** | ✅ None | ❌ High risk |
| **OnPush Compatible** | ✅ Yes | ⚠️ Needs manual |
| **Code Cleaner** | ✅ Yes | ❌ More verbose |

#### Pattern: Using Async Pipe

```typescript
// ✅ GOOD - Auto cleanup
export class Component {
  data$ = this.service.getData();
}

// Template
{{ data$ | async }}

// ✅ GOOD - In *ngIf with async
<div *ngIf="data$ | async as data">
  {{ data.name }}
</div>

// ✅ GOOD - In *ngFor with async
<div *ngFor="let item of items$ | async">
  {{ item }}
</div>

// ✅ GOOD - Store in local variable
<ng-container *ngIf="data$ | async as data">
  <p>{{ data.name }}</p>
  <p>{{ data.email }}</p>
</ng-container>
```

#### ❌ Don't Do This

```typescript
// ❌ BAD - Multiple async pipes = multiple subscriptions
<p>{{ data$ | async }}</p>
<p>{{ data$ | async }}</p>  <!-- Separate subscription! -->

// ✅ GOOD - Use local variable
<ng-container *ngIf="data$ | async as data">
  <p>{{ data.property1 }}</p>
  <p>{{ data.property2 }}</p>
</ng-container>

// ❌ BAD - Function in template with async
get userName() {
  return this.user$ | async;  // ❌ Wrong! Returns observable
}

// ✅ GOOD - Use property
userName$ = this.user$.pipe(map(u => u.name));
// {{ userName$ | async }}
```

#### Advanced: Multiple Observables with Async

```typescript
// Use *ngIf with comma-separated
<div *ngIf="user$ | async as user">
  <div *ngIf="posts$ | async as posts">
    <p>{{ user.name }}</p>
    <p>Posts: {{ posts.length }}</p>
  </div>
</div>

// Better: Use tuple unpacking (Angular 18+)
<div *ngIf="(user$ | async) as user">
  <div *ngIf="(posts$ | async) as posts">
    {{ user.name }} - {{ posts.length }} posts
  </div>
</div>

// Better yet: Use combineLatest in component
combined$ = combineLatest([user$, posts$]).pipe(
  map(([user, posts]) => ({user, posts}))
);

// Template - single subscription
<div *ngIf="combined$ | async as data">
  {{ data.user.name }} - {{ data.posts.length }} posts
</div>
```

### Custom Pipes

```typescript
// Create pipe
@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  transform(value: any): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
  }
}

// Use in template
{{ htmlContent | safe }}
```

### Pipe Chaining

Chain multiple pipes together:

```typescript
// Multiple pipes
{{ price | currency:'USD' | uppercase }}

// With arguments
{{ date | date:'short' | uppercase }}

// Common pattern: format then display
{{ amount | number:'1.2-2' | currency:'USD' }}
```

### RxJS Operators That Act Like Pipes

These RxJS operators "pipe" data transformations:

```typescript
// Inside pipe() method:
observable$.pipe(
  map(x => x * 2),           // Transform
  filter(x => x > 10),       // Filter
  take(5),                   // Limit
  debounceTime(300),         // Throttle
  distinctUntilChanged()     // Deduplicate
).subscribe(result => {});
```

### Async Pipe Performance Pattern

```typescript
// ✅ BEST - Optimized with OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  // Only observables, no properties
  data$ = this.service.getData();
  loading$ = this.service.loading$;
  error$ = this.service.error$;
}

// Template
<div *ngIf="loading$ | async">Loading...</div>
<div *ngIf="error$ | async as error">{{ error }}</div>
<div *ngIf="data$ | async as data">{{ data }}</div>
```

### Common Async Pipe Patterns

#### Pattern 1: Loading State
```typescript
// Component
loading$ = this.service.loading$;
data$ = this.service.data$;

// Template
<div *ngIf="loading$ | async">Loading...</div>
<div *ngIf="!(loading$ | async)">
  {{ data$ | async | json }}
</div>
```

#### Pattern 2: Error Handling
```typescript
// Component
data$ = this.service.getData().pipe(
  catchError(err => {
    this.error = err;
    return of(null);
  })
);

// Template
<div *ngIf="data$ | async as data; else error">
  {{ data }}
</div>
<ng-template #error>
  <p>Error loading data</p>
</ng-template>
```

#### Pattern 3: Form with Async Data
```typescript
// Component
user$ = this.api.getUser(id);

// Template
<form *ngIf="user$ | async as user">
  <input [(ngModel)]="user.name">
  <input [(ngModel)]="user.email">
</form>
```

#### Pattern 4: Conditional Rendering
```typescript
// Component
admin$ = this.auth.isAdmin$;

// Template
<button *ngIf="admin$ | async">Admin Actions</button>
<div *ngIf="!(admin$ | async)">Guest View</div>
```

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| Observable not emitting | Need `.subscribe()` to activate lazy observable |
| Memory leak | Use `takeUntil()` or `async` pipe for cleanup |
| Multiple HTTP calls | Use `shareReplay(1)` to cache result |
| Stale data in form | Use `combineLatest()` to sync all inputs |
| Slow search | Use `debounceTime()` and `switchMap()` |
| Lost context (this) | Use arrow functions `=>` not `function` |
| Wrong type in observable | Use generics: `Observable<Type>` |
| BehaviorSubject not updating | Call `.next()` to emit new value |
| Multiple async subscriptions | Use local variable: `as data` |
| Async pipe not working | Observable might not emit or error |

---

**Print this page or bookmark it!** Keep it handy while coding. 📌

