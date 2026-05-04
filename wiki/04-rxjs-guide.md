# RxJS & Reactive Programming Guide

Master the art of handling asynchronous data streams with RxJS, the reactive extensions library for JavaScript.

## Table of Contents
1. [What is RxJS?](#what-is-rxjs)
2. [Observable vs Promise](#observable-vs-promise)
3. [Creating Observables](#creating-observables)
4. [Common Operators](#common-operators)
5. [Combining Observables](#combining-observables)
6. [Real-World Patterns](#real-world-patterns)
7. [Common Pitfalls](#common-pitfalls)

---

## What is RxJS?

RxJS is a library for reactive programming using **Observables**. It makes dealing with asynchronous data easy and elegant.

### Key Concepts

- **Observable**: A stream of values over time (events, HTTP responses, user input)
- **Operator**: A function that transforms an observable's values
- **Subject**: An observable that can emit values and be subscribed to
- **Subscription**: A request to receive values from an observable
- **Unsubscribe**: Stop listening to an observable (cleanup)

### Why Use RxJS?

✅ **Composable** - Chain operators to transform data
✅ **Cancellable** - Easily stop subscriptions
✅ **Lazy** - Observables only execute when subscribed
✅ **Powerful** - Handle complex async flows naturally

---

## Observable vs Promise

### Promises

```typescript
// A Promise is a one-time async operation
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Data arrived'), 1000);
});

promise
  .then(data => console.log(data))  // Prints after 1 second
  .catch(error => console.error(error));

// Can't cancel a Promise
// Can't retry
// Only returns ONE value
```

### Observables

```typescript
// An Observable is a stream of values (can emit multiple times)
import { Subject } from 'rxjs';

const observable = new Subject<string>();

// Subscribe to stream
observable.subscribe(data => console.log(data));

// Emit multiple values over time
observable.next('First');
observable.next('Second');
observable.next('Third');

// Each subscriber gets all future emissions
observable.subscribe(data => console.log('New subscriber:', data));
observable.next('Fourth');  // Both subscribers see this
```

### Observable vs Promise Comparison

| Feature | Observable | Promise |
|---------|-----------|---------|
| **Values** | Multiple | One |
| **Cancelable** | ✅ Yes | ❌ No |
| **Lazy** | ✅ Yes | ❌ No (executes immediately) |
| **Retry** | ✅ Easy with retry() | ❌ No |
| **Memory** | Needs cleanup | Auto cleanup |
| **Use Case** | Streams, events | One-time operations |

### Observable Example

```typescript
// User types in a search box - emits new value each time
const searchTerm$ = new Subject<string>();

// Listen to the stream
searchTerm$.subscribe(term => {
  // Make API call for each search term
  this.http.get(`/api/search?q=${term}`).subscribe(results => {
    console.log('Results:', results);
  });
});

// Simulate user typing
searchTerm$.next('angular');     // -> API call 1
searchTerm$.next('angular rxjs'); // -> API call 2
searchTerm$.next('typescript');  // -> API call 3
```

---

## Creating Observables

### 1. Subject & BehaviorSubject

```typescript
import { Subject, BehaviorSubject } from 'rxjs';

// Subject - no initial value
const subject = new Subject<string>();
// New subscribers don't get old values
subject.subscribe(val => console.log(val));
subject.next('Hello');  // Only current subscribers see this

// BehaviorSubject - has initial value
const behaviorSubject = new BehaviorSubject<string>('Initial');
// New subscribers immediately get the last value
behaviorSubject.subscribe(val => console.log(val));  // Logs 'Initial'
behaviorSubject.next('Updated');
```

### 2. From Promises

```typescript
import { from } from 'rxjs';

// Convert Promise to Observable
const promise = fetch('/api/data').then(r => r.json());
const observable = from(promise);

observable.subscribe(data => console.log(data));
```

### 3. From Events

```typescript
import { fromEvent } from 'rxjs';

// Convert DOM events to Observable
const button = document.querySelector('button');
const clicks$ = fromEvent(button, 'click');

clicks$.subscribe(event => console.log('Button clicked!'));
```

### 4. From Arrays

```typescript
import { from } from 'rxjs';

// Convert array to observable of individual values
from([1, 2, 3, 4, 5]).subscribe(num => console.log(num));
// Logs: 1, 2, 3, 4, 5 (one at a time)
```

### 5. HTTP Requests

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotesService {
  constructor(private http: HttpClient) {}

  // Every HTTP method returns an Observable
  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>('/api/notes');
  }

  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>('/api/notes', note);
  }

  updateNote(id: string, note: Note): Observable<Note> {
    return this.http.put<Note>(`/api/notes/${id}`, note);
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`/api/notes/${id}`);
  }
}
```

### 6. Custom Observables

```typescript
import { Observable } from 'rxjs';

// Create custom observable
const customObservable = new Observable(subscriber => {
  // Emit values
  subscriber.next('Value 1');
  subscriber.next('Value 2');
  
  // Handle errors
  subscriber.error(new Error('Something went wrong'));
  
  // Complete the stream
  subscriber.complete();
});

customObservable.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done!')
});
```

---

## Common Operators

### Transformation Operators

#### map - Transform each value

```typescript
// Transform values: double each number
from([1, 2, 3, 4]).pipe(
  map(num => num * 2)
).subscribe(console.log);  // 2, 4, 6, 8
```

#### filter - Keep only matching values

```typescript
// Keep only even numbers
from([1, 2, 3, 4, 5, 6]).pipe(
  filter(num => num % 2 === 0)
).subscribe(console.log);  // 2, 4, 6
```

#### scan - Like reduce, but emit intermediate results

```typescript
// Sum numbers cumulatively
from([1, 2, 3, 4]).pipe(
  scan((total, num) => total + num, 0)
).subscribe(console.log);  // 1, 3, 6, 10
```

### Filtering Operators

#### debounceTime - Wait before emitting

```typescript
// Search input - wait 300ms after user stops typing
const searchTerm$ = new Subject<string>();

searchTerm$.pipe(
  debounceTime(300),  // Wait 300ms of silence
  distinctUntilChanged()  // Only if value changed
).subscribe(term => {
  this.http.get(`/api/search?q=${term}`).subscribe(results => {
    // Make API call only after user stops typing
  });
});

// Simulate typing: 'a', 'an', 'ang', 'angu', 'angul', 'angular'
// Only 'angular' triggers API call (the final value after 300ms silence)
```

#### distinctUntilChanged - Ignore duplicate values

```typescript
// Ignore consecutive same values
from([1, 1, 2, 2, 3, 3, 1]).pipe(
  distinctUntilChanged()
).subscribe(console.log);  // 1, 2, 3, 1
```

#### throttleTime - Emit at most once per interval

```typescript
// Limit scroll events to once per 100ms
fromEvent(window, 'scroll').pipe(
  throttleTime(100)
).subscribe(() => {
  // This fires at most every 100ms
});
```

### Flattening Operators

#### switchMap - Cancel previous, switch to new

```typescript
// When user selects a note, fetch its full content
// Switching to a new note cancels the previous request
this.selectedNoteId$.pipe(
  switchMap(id => this.notesService.getNoteDetail(id))
).subscribe(noteDetail => {
  // Show the note detail
});
```

#### mergeMap - Keep previous, add new

```typescript
// Handle multiple concurrent requests
const user$ = this.http.get('/api/user');
const posts$ = this.http.get('/api/posts');

merge(user$, posts$).pipe(
  mergeMap(data => this.process(data))
).subscribe(result => {
  // Process all results
});
```

#### concatMap - Queue requests in order

```typescript
// Save notes in order (wait for each to complete)
const noteToSave$ = new Subject<Note>();

noteToSave$.pipe(
  concatMap(note => this.notesService.save(note))
).subscribe(savedNote => {
  // Each note saved in order
});
```

---

## Combining Observables

### combineLatest - Wait for all, then emit when any changes

```typescript
import { combineLatest } from 'rxjs';

// Combine user and notes streams
combineLatest([
  this.authStore.currentUser$,
  this.notesStore.notes$
]).pipe(
  map(([user, notes]) => ({
    userName: user?.name,
    noteCount: notes.length,
    recentNotes: notes.slice(0, 5)
  }))
).subscribe(data => {
  console.log(data);
  // { userName: 'John', noteCount: 5, recentNotes: [...] }
});

// Real-world: Dashboard combining user info + notes + settings
```

### forkJoin - Wait for all to complete, emit final values

```typescript
import { forkJoin } from 'rxjs';

// Fetch multiple resources in parallel, then continue when all done
forkJoin({
  user: this.http.get('/api/user'),
  notes: this.http.get('/api/notes'),
  settings: this.http.get('/api/settings')
}).subscribe(({ user, notes, settings }) => {
  // All three requests completed
  console.log(user, notes, settings);
  // This runs ONCE when all are done
});

// Real-world: Load multiple resources on page load
```

**forkJoin vs combineLatest**:

| Feature | forkJoin | combineLatest |
|---------|----------|--------------|
| **Waits for** | All to complete | All to emit once |
| **Emits** | Once (final values) | Every time any changes |
| **Use case** | Load multiple resources | Reactive streams |

### merge - Combine streams, emit from any

```typescript
import { merge } from 'rxjs';

// Listen to multiple sources
merge(
  this.user$.pipe(map(u => ({ type: 'user', data: u }))),
  this.posts$.pipe(map(p => ({ type: 'post', data: p }))),
  this.comments$.pipe(map(c => ({ type: 'comment', data: c })))
).subscribe(event => {
  // Fires when ANY source emits
  console.log(event.type, event.data);
});
```

### zip - Wait for all, emit pairs

```typescript
import { zip } from 'rxjs';

// Pair values from multiple streams
zip(
  this.http.get('/api/users'),
  this.http.get('/api/roles')
).subscribe(([users, roles]) => {
  // Both completed, pair them up
});
```

---

## Real-World Patterns

### Pattern 1: Auto-Complete Search

```typescript
@Component({
  selector: 'app-search',
  template: `
    <input #searchInput type="text" placeholder="Search notes...">
    <ul>
      <li *ngFor="let result of searchResults$ | async">
        {{ result.title }}
      </li>
    </ul>
  `
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  searchResults$!: Observable<Note[]>;

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    // Listen to input changes
    this.searchResults$ = fromEvent<Event>(
      this.searchInput.nativeElement,
      'input'
    ).pipe(
      // Get the search term
      map(event => (event.target as HTMLInputElement).value),
      // Wait 300ms after typing stops
      debounceTime(300),
      // Only search if term changed
      distinctUntilChanged(),
      // Switch to search API call
      switchMap(term =>
        term.length > 0
          ? this.notesService.search(term)
          : of([])  // Empty results if term cleared
      ),
      // Share the result with multiple subscribers
      shareReplay(1)
    );
  }

  ngOnDestroy() {
    // Async pipe handles unsubscribe
  }
}
```

### Pattern 2: Load Multiple Resources

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  loadDashboard(): Observable<{
    user: User;
    notes: Note[];
    stats: Stats;
  }> {
    return forkJoin({
      user: this.http.get<User>('/api/user'),
      notes: this.http.get<Note[]>('/api/notes'),
      stats: this.http.get<Stats>('/api/stats')
    });
  }
}

@Component({
  template: `
    <ng-container *ngIf="data$ | async as data">
      <h1>Welcome, {{ data.user.name }}</h1>
      <p>You have {{ data.notes.length }} notes</p>
      <p>Total words: {{ data.stats.totalWords }}</p>
    </ng-container>
  `
})
export class DashboardComponent {
  data$: Observable<any>;

  constructor(dataService: DataService) {
    this.data$ = dataService.loadDashboard();
  }
}
```

### Pattern 3: Retry on Failure

```typescript
// Retry failed requests 3 times with 1-second delay
this.http.get('/api/notes').pipe(
  retry({
    count: 3,
    delay: 1000
  }),
  catchError(error => {
    // After 3 retries fail, handle error
    console.error('Failed after 3 retries', error);
    return throwError(() => new Error('API Error'));
  })
).subscribe(
  notes => console.log(notes),
  error => console.error(error)
);
```

### Pattern 4: Polling (Refresh data periodically)

```typescript
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Fetch notes every 5 seconds
interval(5000).pipe(
  switchMap(() => this.notesService.getNotes())
).subscribe(notes => {
  console.log('Updated notes:', notes);
});
```

### Pattern 5: Handle Loading and Error States

```typescript
@Component({
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error" class="error">
      {{ error }}
    </div>
    <div *ngIf="data$ | async as data">
      {{ data | json }}
    </div>
  `
})
export class DataComponent implements OnInit {
  data$!: Observable<any>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Start loading
    const request$ = this.dataService.getData().pipe(
      // Map success
      map(data => ({ data, loading: false, error: null })),
      // Map error
      catchError(err => of({ data: null, loading: false, error: err.message })),
      // Show loading state while request is in progress
      startWith({ data: null, loading: true, error: null }),
      // Share with all subscribers
      shareReplay(1)
    );

    // Extract individual streams
    this.data$ = request$.pipe(map(r => r.data));
    this.loading$ = request$.pipe(map(r => r.loading));
    this.error$ = request$.pipe(map(r => r.error));
  }
}
```

---

## Common Pitfalls

### ❌ Pitfall 1: Memory Leaks from Unsubscribed Observables

```typescript
// BAD - Memory leak!
ngOnInit() {
  this.service.data$.subscribe(data => {
    this.myData = data;
  });
  // Subscription never cleaned up!
}

// GOOD - Use takeUntil
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.myData = data;
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// BEST - Use async pipe (auto cleanup)
// In template:
{{ data$ | async }}
// No component subscription needed!
```

### ❌ Pitfall 2: Not Handling Errors

```typescript
// BAD - Error breaks the stream
this.http.get('/api/data').subscribe(
  data => console.log(data)
  // No error handler - stream dies on error
);

// GOOD - Handle errors
this.http.get('/api/data').subscribe(
  data => console.log(data),
  error => console.error('Error:', error),
  () => console.log('Complete')
);

// BETTER - Use catchError operator
this.http.get('/api/data').pipe(
  catchError(error => {
    console.error('Error:', error);
    return of(null);  // Return default value
  })
).subscribe(data => {
  // data is either API response or null (from catchError)
});
```

### ❌ Pitfall 3: Lost Context (this binding)

```typescript
// BAD - 'this' is undefined in the callback
observable.subscribe(function(data) {
  this.myProperty = data;  // 'this' is wrong!
});

// GOOD - Use arrow functions
observable.subscribe(data => {
  this.myProperty = data;  // 'this' is correct!
});
```

### ❌ Pitfall 4: Unnecessary Subscriptions

```typescript
// BAD - Multiple subscriptions doing the same thing
observable.subscribe(() => this.fetchRelated());
observable.subscribe(() => this.updateUI());

// GOOD - One subscription with multiple handlers
observable.subscribe({
  next: data => {
    this.fetchRelated();
    this.updateUI();
  }
});

// BETTER - Use shareReplay for shared subscriptions
const shared$ = observable.pipe(shareReplay(1));
shared$.subscribe(() => this.fetchRelated());
shared$.subscribe(() => this.updateUI());
```

---

## Best Practices

### ✅ DO:
- Use `takeUntil` or `async` pipe to prevent memory leaks
- Use `shareReplay()` for expensive operations
- Use `switchMap` when you want to cancel previous requests
- Handle errors with `catchError`
- Use type-safe observables with generics: `Observable<Note[]>`
- Use the `async` pipe in templates when possible
- Use `debounceTime` for search/input fields
- Use `distinctUntilChanged` to skip duplicate values

### ❌ DON'T:
- Leave subscriptions without cleanup
- Nest multiple subscriptions (use operators instead)
- Use `Promise` for continuous streams
- Ignore error states
- Subscribe to the same observable multiple times without `shareReplay`
- Use `debounceTime` for forms that need real-time validation
- Forget to handle the complete callback

---

## Quick Reference

```typescript
// Create
subject.next(value)           // Emit value
BehaviorSubject(initial)      // Subject with initial value
new Observable(subscriber)    // Custom observable
from(promise|array|event)     // Convert to observable
of(value1, value2, ...)       // Observable of values

// Combine
combineLatest([obs1, obs2])   // All emit, then any change
forkJoin({a: obs1, b: obs2})  // All complete once
merge(obs1, obs2)             // Any emits
zip(obs1, obs2)               // Pair values

// Transform
map(v => transform)           // Transform value
filter(v => condition)        // Keep if true
scan((acc, v) => calc)        // Accumulate
debounceTime(300)             // Wait before emitting
distinctUntilChanged()        // Skip duplicates

// Flatten
switchMap(obs)                // Cancel previous
mergeMap(obs)                 // Add to existing
concatMap(obs)                // Queue in order

// Error & Complete
catchError(err => handle)     // Handle errors
retry({count: 3})             // Retry on failure
takeUntil(destroy$)           // Cleanup

// Subscribe
subscribe(next, error, complete)
subscribe({next, error, complete})
```

---

**Master RxJS and unlock the power of reactive programming!** 🚀
