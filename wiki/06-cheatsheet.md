# Angular & RxJS Cheat Sheet

Quick reference guide for the most common patterns and operations.

## Table of Contents
1. [RxJS Operators](#rxjs-operators)
2. [Observable Creation](#observable-creation)
3. [Component Communication](#component-communication)
4. [Common Patterns](#common-patterns)
5. [Error Handling](#error-handling)
6. [Performance Tips](#performance-tips)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

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

---

**Print this page or bookmark it!** Keep it handy while coding. 📌

