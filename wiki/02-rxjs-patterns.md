# RxJS & Component Communication Patterns

Master reactive programming and all component communication patterns in Angular.

## Table of Contents
1. [RxJS Fundamentals](#rxjs-fundamentals)
2. [Observables vs Promises](#observables-vs-promises)
3. [Creating Observables](#creating-observables)
4. [RxJS Operators](#rxjs-operators)
5. [Combining Observables](#combining-observables)
6. [Component Communication](#component-communication)
7. [Real-World Patterns](#real-world-patterns)
8. [Common Pitfalls](#common-pitfalls)

---

## RxJS Fundamentals

### What is RxJS?

RxJS is a library for reactive programming using **Observables**. It makes dealing with asynchronous data easy and elegant.

**Key Concepts:**
- **Observable**: A stream of values over time (events, HTTP responses, user input)
- **Operator**: A function that transforms an observable's values
- **Subject**: An observable that can emit values and be subscribed to
- **Subscription**: A request to receive values from an observable
- **Unsubscribe**: Stop listening to an observable (cleanup)

**Why Use RxJS?**
- ✅ **Composable** - Chain operators to transform data
- ✅ **Cancellable** - Easily stop subscriptions
- ✅ **Lazy** - Observables only execute when subscribed
- ✅ **Powerful** - Handle complex async flows naturally

---

## Observables vs Promises

### The Difference

| Feature | Observable | Promise |
|---------|-----------|---------|
| **Values** | Multiple | One |
| **Cancelable** | ✅ Yes | ❌ No |
| **Lazy** | ✅ Yes | ❌ No (executes immediately) |
| **Retry** | ✅ Easy with retry() | ❌ No |
| **Memory** | Needs cleanup | Auto cleanup |
| **Use Case** | Streams, events | One-time operations |

### Promise Example

```typescript
// A Promise is a one-time async operation
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Data arrived'), 1000);
});

promise
  .then(data => console.log(data))  // Prints after 1 second
  .catch(error => console.error(error));

// Can't cancel, can't retry, only ONE value
```

### Observable Example

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

---

## Creating Observables

### Subject & BehaviorSubject

```typescript
import { Subject, BehaviorSubject } from 'rxjs';

// Subject - no initial value
const subject = new Subject<string>();
subject.subscribe(val => console.log(val));
subject.next('Hello');  // Only current subscribers see this

// BehaviorSubject - has initial value
const bs = new BehaviorSubject<string>('Initial');
bs.subscribe(val => console.log(val));  // Logs 'Initial' immediately
bs.next('Updated');
bs.value;  // Get current value
```

### From Promises

```typescript
import { from } from 'rxjs';

const promise = fetch('/api/data').then(r => r.json());
const observable = from(promise);

observable.subscribe(data => console.log(data));
```

### From Events

```typescript
import { fromEvent } from 'rxjs';

const button = document.querySelector('button');
const clicks$ = fromEvent(button, 'click');

clicks$.subscribe(event => console.log('Button clicked!'));
```

### From Arrays

```typescript
import { from } from 'rxjs';

from([1, 2, 3, 4, 5]).subscribe(num => console.log(num));
// Logs: 1, 2, 3, 4, 5
```

### HTTP Requests

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotesService {
  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>('/api/notes');
  }

  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>('/api/notes', note);
  }
}
```

### Custom Observables

```typescript
const custom$ = new Observable(subscriber => {
  subscriber.next('Value 1');
  subscriber.next('Value 2');
  
  setTimeout(() => subscriber.next('Delayed value'), 1000);
  
  // Emit error
  // subscriber.error(new Error('Something went wrong'));
  
  // Complete the observable
  subscriber.complete();
});

custom$.subscribe({
  next: val => console.log(val),
  error: err => console.error(err),
  complete: () => console.log('Done!')
});
```

---

## RxJS Operators

### Transformation Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `map()` | Transform each value | `map(x => x * 2)` |
| `filter()` | Keep matching values | `filter(x => x > 5)` |
| `switchMap()` | Cancel previous, switch to new | `switchMap(id => getUser(id))` |
| `mergeMap()` | Keep all concurrent | `mergeMap(file => upload(file))` |
| `concatMap()` | Queue in order | `concatMap(item => process(item))` |

**Example:**
```typescript
// Transform and filter data
numbers$.pipe(
  map(n => n * 2),           // 1 -> 2, 2 -> 4, 3 -> 6
  filter(n => n > 4)         // Keep only 6
).subscribe(n => console.log(n));  // Logs: 6
```

### Filtering Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `filter()` | Keep matching | `filter(x => x > 5)` |
| `debounceTime()` | Wait for silence | `debounceTime(300)` |
| `distinctUntilChanged()` | Skip duplicates | `distinctUntilChanged()` |
| `take()` | First N values | `take(5)` |
| `takeUntil()` | Stop when signal emits | `takeUntil(destroy$)` |

**Example - Debounce Search:**
```typescript
// User types -> wait 300ms -> search
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => api.search(term))
).subscribe(results => {});
```

### Combining Operators

| Operator | Purpose | When to Use |
|----------|---------|------------|
| `combineLatest` | All emit, then sync | Multiple reactive inputs |
| `forkJoin` | Wait for all to complete | Parallel requests |
| `merge` | Any source emits | Multiple event streams |
| `zip` | Pair values | Coordinate two streams |
| `withLatestFrom` | Add other values | Triggered by one |

**Example - combineLatest:**
```typescript
// Form inputs - emit when ANY changes
combineLatest([
  email$.valueChanges,
  password$.valueChanges
]).subscribe(([email, password]) => {
  console.log('Form changed:', email, password);
});
```

**Example - forkJoin:**
```typescript
// Load all data in parallel
forkJoin({
  user: api.getUser(id),
  posts: api.getPosts(id),
  comments: api.getComments(id)
}).subscribe(({user, posts, comments}) => {
  console.log('All loaded!');
});
```

---

## Component Communication

### Pattern 1: Parent → Child (@Input)

Pass data DOWN from parent to child.

```typescript
// Parent Component
@Component({
  template: `<app-child [message]="greeting"></app-child>`
})
export class ParentComponent {
  greeting = 'Hello from parent';
}

// Child Component
@Component({
  selector: 'app-child',
  template: '{{ message }}'
})
export class ChildComponent {
  @Input() message: string;
}
```

### Pattern 2: Child → Parent (@Output)

Send data UP from child to parent.

```typescript
// Child Component
@Component({
  selector: 'app-child',
  template: '<button (click)="sendMessage()">Send</button>'
})
export class ChildComponent {
  @Output() messageEvent = new EventEmitter<string>();
  
  sendMessage() {
    this.messageEvent.emit('Hello from child');
  }
}

// Parent Component
@Component({
  template: '<app-child (messageEvent)="receiveMessage($event)"></app-child>'
})
export class ParentComponent {
  receiveMessage(message: string) {
    console.log(message);
  }
}
```

### Pattern 3: Sibling Communication (Service)

Use a shared service with Subject.

```typescript
// Service
@Injectable({providedIn: 'root'})
export class MessagingService {
  private messageSubject = new Subject<string>();
  message$ = this.messageSubject.asObservable();
  
  sendMessage(msg: string) {
    this.messageSubject.next(msg);
  }
}

// Sender Component
export class SenderComponent {
  constructor(private messaging: MessagingService) {}
  
  send() {
    this.messaging.sendMessage('Hello siblings');
  }
}

// Receiver Component
export class ReceiverComponent {
  message$ = this.messaging.message$;
  
  constructor(private messaging: MessagingService) {}
}
```

### Pattern 4: Two-Way Binding

Sync data in both directions.

```typescript
// Component
export class FormComponent {
  name = 'John';
}

// Template
<input [(ngModel)]="name">
<p>{{ name }}</p>  <!-- Updates as you type -->

// Equivalent to:
<input [ngModel]="name" (ngModelChange)="name = $event">
```

### Pattern 5: Global State Management

Use BehaviorSubject for app-wide state.

```typescript
// Store Service
@Injectable({providedIn: 'root'})
export class AppStore {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  
  setUser(user: User) {
    this.userSubject.next(user);
  }
  
  getUser(): User | null {
    return this.userSubject.value;
  }
}

// Component 1 - Set user
export class LoginComponent {
  constructor(private store: AppStore) {}
  
  login(user: User) {
    this.store.setUser(user);
  }
}

// Component 2 - Use user
export class ProfileComponent {
  user$ = this.store.user$;
  
  constructor(private store: AppStore) {}
}

// Template
{{ user$ | async | json }}
```

---

## Real-World Patterns

### Pattern 1: Search with Debounce & switchMap

```typescript
searchTerm$ = new Subject<string>();

results$ = this.searchTerm$.pipe(
  debounceTime(300),           // Wait 300ms
  distinctUntilChanged(),       // Only if different
  switchMap(term =>             // Switch to new search
    term.length > 0
      ? this.api.search(term)
      : of([])
  ),
  shareReplay(1)               // Share result
);

onSearch(term: string) {
  this.searchTerm$.next(term);
}
```

**Key Points:**
- switchMap cancels previous requests
- debounceTime reduces API calls
- shareReplay prevents duplicate requests

### Pattern 2: Load Multiple Resources

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

**Key Points:**
- forkJoin waits for ALL to complete
- Emits ONCE with all results
- Perfect for parallel requests

### Pattern 3: Filter & Transform with combineLatest

```typescript
// Show filtered notes
filtered$ = combineLatest([notes$, selectedCategory$]).pipe(
  map(([notes, category]) =>
    notes.filter(n => n.category === category)
         .sort((a, b) => b.date - a.date)
  )
);
```

**Key Points:**
- combineLatest emits when ANY changes
- Perfect for dependent streams
- Waits for all to emit at least once

### Pattern 4: Cleanup with takeUntil

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

**Key Points:**
- takeUntil prevents memory leaks
- destroy$ is the cleanup signal
- Must complete and next before destroy

---

## Common Pitfalls

### 1. Nested Subscriptions (Callback Hell)

❌ **DON'T:**
```typescript
this.service.get(id).subscribe(item => {
  this.api.fetch(item.id).subscribe(data => {
    this.process(data).subscribe(result => {
      // Callback hell!
    });
  });
});
```

✅ **DO:**
```typescript
this.service.get(id).pipe(
  switchMap(item => this.api.fetch(item.id)),
  switchMap(data => this.process(data))
).subscribe(result => {});
```

### 2. Not Unsubscribing

❌ **DON'T:**
```typescript
ngOnInit() {
  this.interval$ = interval(1000).subscribe(n => {
    console.log(n);
    // Memory leak! Runs forever
  });
}
```

✅ **DO:**
```typescript
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

### 3. Multiple Subscriptions in Template

❌ **DON'T:**
```html
<p>{{ data$ | async }}</p>
<p>{{ data$ | async }}</p>  <!-- Separate subscription! -->
```

✅ **DO:**
```html
<ng-container *ngIf="data$ | async as data">
  <p>{{ data }}</p>
  <p>{{ data }}</p>  <!-- Same subscription -->
</ng-container>
```

### 4. Not Handling Errors

❌ **DON'T:**
```typescript
this.api.getData().subscribe(data => {
  this.data = data;
  // What if error? App breaks!
});
```

✅ **DO:**
```typescript
this.api.getData().pipe(
  catchError(err => {
    console.error(err);
    return of(defaultData);
  })
).subscribe(data => { this.data = data; });
```

---

## Best Practices

### ✅ DO:
- Use `takeUntil(destroy$)` for cleanup
- Use `async` pipe in templates
- Use `shareReplay(1)` for shared operations
- Use `switchMap` for search/route changes
- Use `combineLatest` for multiple inputs
- Use `forkJoin` for parallel requests
- Handle errors with `catchError`
- Type your observables: `Observable<Type>`

### ❌ DON'T:
- Subscribe without unsubscribing
- Nest multiple `.subscribe()` calls
- Use Promises for continuous streams
- Leave errors unhandled
- Modify @Input properties
- Use `async` pipe multiple times for same observable
- Create memory leaks with infinite subscriptions

---

**Master these patterns and you'll write elegant, reactive Angular code!** 🚀
