# Component Communication Patterns

Master all patterns for passing data between Angular components.

## Table of Contents
1. [Parent to Child (@Input)](#parent-to-child)
2. [Child to Parent (@Output & EventEmitter)](#child-to-parent)
3. [Sibling to Sibling (Services & Observables)](#sibling-to-sibling)
4. [Client to Client (Global State Management)](#client-to-client)
5. [Using Template Reference Variables](#template-reference-variables)
6. [Service-Based Communication](#service-based-communication)

---

## Parent to Child (@Input)

### What is @Input?

`@Input` allows parent components to pass data DOWN to child components.

```typescript
// parent.component.ts
@Component({
  selector: 'app-parent',
  template: `
    <h1>Parent Component</h1>
    <app-child [name]="'John'" [age]="25"></app-child>
  `
})
export class ParentComponent {}

// child.component.ts
@Component({
  selector: 'app-child',
  template: `
    <div>
      <p>Name: {{ name }}</p>
      <p>Age: {{ age }}</p>
    </div>
  `
})
export class ChildComponent {
  @Input() name!: string;
  @Input() age!: number;
}
```

### Real-World Example: NoteCard

```typescript
// dashboard.component.ts (Parent)
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="notes-list">
      <app-note-card
        *ngFor="let note of notes"
        [note]="note"
        (delete)="onDeleteNote($event)"
      ></app-note-card>
    </div>
  `
})
export class DashboardComponent {
  notes: Note[] = [];

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    this.notesService.getNotes().subscribe(notes => {
      this.notes = notes;
    });
  }

  onDeleteNote(noteId: string) {
    this.notesService.deleteNote(noteId).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== noteId);
    });
  }
}

// note-card.component.ts (Child)
@Component({
  selector: 'app-note-card',
  template: `
    <div class="note-card">
      <h3>{{ note.title }}</h3>
      <p>{{ note.content }}</p>
      <button (click)="onDelete()">Delete</button>
    </div>
  `
})
export class NoteCardComponent {
  @Input() note!: Note;  // Parent passes note down
  @Output() delete = new EventEmitter<string>();

  onDelete() {
    this.delete.emit(this.note.id);  // Tell parent to delete
  }
}
```

### Optional @Input with Default Value

```typescript
@Component({
  selector: 'app-button',
  template: `<button [disabled]="disabled">{{ label }}</button>`
})
export class ButtonComponent {
  @Input() label = 'Click me';          // Default value
  @Input() disabled = false;             // Default value
  @Input() color?: string;               // Optional
}
```

### Two-Way Binding with @Input/@Output

```typescript
// Shorthand for two-way binding
// Parent:
<app-counter [(value)]="count"></app-counter>

// Is equivalent to:
<app-counter [value]="count" (valueChange)="count = $event"></app-counter>

// Child component:
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="increment()">+</button>
    <span>{{ value }}</span>
  `
})
export class CounterComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  increment() {
    this.value++;
    this.valueChange.emit(this.value);
  }
}
```

---

## Child to Parent (@Output & EventEmitter)

### What is @Output?

`@Output` allows child components to send events UP to parent components.

### Simple Example

```typescript
// parent.component.ts
@Component({
  selector: 'app-parent',
  template: `
    <h1>Parent</h1>
    <p>Message from child: {{ message }}</p>
    <app-child (sendMessage)="onMessageReceived($event)"></app-child>
  `
})
export class ParentComponent {
  message = '';

  onMessageReceived(msg: string) {
    this.message = msg;
  }
}

// child.component.ts
@Component({
  selector: 'app-child',
  template: `
    <button (click)="sendToParent()">Send Message</button>
  `
})
export class ChildComponent {
  @Output() sendMessage = new EventEmitter<string>();

  sendToParent() {
    this.sendMessage.emit('Hello from child!');
  }
}
```

### Real-World Example: Form Validation

```typescript
// form.component.ts (Parent)
@Component({
  selector: 'app-form',
  template: `
    <form>
      <app-email-input
        [value]="email"
        (valueChange)="email = $event"
        (invalidEmail)="onInvalidEmail($event)"
      ></app-email-input>
      <button [disabled]="!isFormValid">Submit</button>
    </form>
  `
})
export class FormComponent {
  email = '';
  isFormValid = false;

  onInvalidEmail(errorMsg: string) {
    console.error('Email validation error:', errorMsg);
    this.isFormValid = false;
  }
}

// email-input.component.ts (Child)
@Component({
  selector: 'app-email-input',
  template: `
    <input
      [value]="value"
      (input)="onValueChange($event)"
      type="email"
    />
    <p *ngIf="error" class="error">{{ error }}</p>
  `
})
export class EmailInputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() invalidEmail = new EventEmitter<string>();

  error = '';

  onValueChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const email = input.value;

    this.value = email;
    this.valueChange.emit(email);

    // Validate
    if (!this.isValidEmail(email)) {
      this.error = 'Invalid email address';
      this.invalidEmail.emit(this.error);
    } else {
      this.error = '';
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

---

## Sibling to Sibling (Services & Observables)

### What is Sibling Communication?

Siblings are components that share the same parent. They can communicate through a service.

```
      Parent
      /    \
   Child1  Child2  <- Siblings
```

### Pattern: Shared Service

```typescript
// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  // Subject for sibling communication
  private messageSubject = new Subject<string>();
  message$ = this.messageSubject.asObservable();

  sendMessage(msg: string) {
    this.messageSubject.next(msg);
  }
}

// sibling1.component.ts
@Component({
  selector: 'app-sibling1',
  template: `
    <input
      type="text"
      #inputBox
      placeholder="Type and send..."
    />
    <button (click)="sendToSibling(inputBox.value)">
      Send to Sibling
    </button>
  `
})
export class Sibling1Component {
  constructor(private shared: SharedService) {}

  sendToSibling(message: string) {
    this.shared.sendMessage(message);
  }
}

// sibling2.component.ts
@Component({
  selector: 'app-sibling2',
  template: `
    <h3>Message from Sibling 1:</h3>
    <p>{{ receivedMessage }}</p>
  `
})
export class Sibling2Component implements OnInit, OnDestroy {
  receivedMessage = '';
  private destroy$ = new Subject<void>();

  constructor(private shared: SharedService) {}

  ngOnInit() {
    this.shared.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.receivedMessage = msg;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Real-World Example: Search and Results

```typescript
// search.service.ts
@Injectable({ providedIn: 'root' })
export class SearchService {
  private searchSubject = new Subject<string>();
  search$ = this.searchSubject.asObservable();

  performSearch(term: string) {
    this.searchSubject.next(term);
  }
}

// search-box.component.ts (Sibling 1)
@Component({
  selector: 'app-search-box',
  template: `
    <input
      type="text"
      (input)="onSearch($event)"
      placeholder="Search..."
    />
  `
})
export class SearchBoxComponent {
  constructor(private searchService: SearchService) {}

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.performSearch(term);
  }
}

// search-results.component.ts (Sibling 2)
@Component({
  selector: 'app-search-results',
  template: `
    <div *ngIf="results$ | async as results">
      <p *ngIf="!results.length">No results found</p>
      <ul>
        <li *ngFor="let result of results">{{ result }}</li>
      </ul>
    </div>
  `
})
export class SearchResultsComponent {
  results$: Observable<string[]>;

  constructor(
    private searchService: SearchService,
    private searchApi: SearchApiService
  ) {
    this.results$ = this.searchService.search$.pipe(
      switchMap(term => this.searchApi.search(term)),
      startWith([]),
      shareReplay(1)
    );
  }
}
```

---

## Client to Client (Global State Management)

### What is Client-to-Client Communication?

Communication between any components anywhere in the app through a centralized store.

### Pattern: Store Service with BehaviorSubject

```typescript
// auth-store.service.ts
@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  // Private state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Public observable
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private authService: AuthService) {}

  // Public method to update state
  login(email: string, password: string) {
    return this.authService.login(email, password).pipe(
      tap(response => {
        // Update state after successful login
        this.currentUserSubject.next(response.user);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
  }

  // Getter for current value
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

// anywhere in the app:
@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="currentUser$ | async as user">
      <h1>Welcome, {{ user.name }}</h1>
    </div>
  `
})
export class ProfileComponent {
  currentUser$: Observable<User | null>;

  constructor(private authStore: AuthStoreService) {
    this.currentUser$ = this.authStore.currentUser$;
  }

  logout() {
    this.authStore.logout();
  }
}

// navbar.component.ts
@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <div *ngIf="(currentUser$ | async) as user">
        <span>{{ user.name }}</span>
        <button (click)="logout()">Logout</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;

  constructor(private authStore: AuthStoreService) {
    this.currentUser$ = this.authStore.currentUser$;
  }

  logout() {
    this.authStore.logout();
  }
}
```

### Example: Notes Store (like in Angular101)

```typescript
// notes-store.service.ts
@Injectable({ providedIn: 'root' })
export class NotesStoreService {
  // Private state
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private filterSubject = new BehaviorSubject<string>('');

  // Public observables
  notes$ = this.notesSubject.asObservable();
  filter$ = this.filterSubject.asObservable();

  // Derived state: filtered notes
  filteredNotes$ = combineLatest([
    this.notes$,
    this.filter$
  ]).pipe(
    map(([notes, filter]) =>
      notes.filter(n =>
        n.title.toLowerCase().includes(filter.toLowerCase())
      )
    ),
    shareReplay(1)
  );

  constructor(private notesService: NotesService) {
    this.loadNotes();
  }

  // Actions
  loadNotes() {
    this.notesService.getNotes().subscribe(notes => {
      this.notesSubject.next(notes);
    });
  }

  createNote(note: Note) {
    this.notesService.createNote(note).subscribe(newNote => {
      // Add to store
      const current = this.notesSubject.value;
      this.notesSubject.next([newNote, ...current]);
    });
  }

  updateNote(id: string, updates: Partial<Note>) {
    this.notesService.updateNote(id, updates).subscribe(updated => {
      // Update in store
      const current = this.notesSubject.value;
      const index = current.findIndex(n => n.id === id);
      if (index !== -1) {
        current[index] = { ...current[index], ...updates };
        this.notesSubject.next([...current]);
      }
    });
  }

  deleteNote(id: string) {
    this.notesService.deleteNote(id).subscribe(() => {
      // Remove from store
      const current = this.notesSubject.value;
      this.notesSubject.next(current.filter(n => n.id !== id));
    });
  }

  setFilter(filter: string) {
    this.filterSubject.next(filter);
  }
}

// dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  template: `
    <input
      type="text"
      (input)="onFilterChange($event)"
      placeholder="Filter notes..."
    />
    <div *ngFor="let note of (notesStore.filteredNotes$ | async)">
      {{ note.title }}
    </div>
  `
})
export class DashboardComponent {
  constructor(public notesStore: NotesStoreService) {}

  onFilterChange(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.notesStore.setFilter(term);
  }
}

// note-detail.component.ts
@Component({
  selector: 'app-note-detail',
  template: `
    <form (ngSubmit)="onSave()">
      <input [(ngModel)]="noteTitle" name="title" />
      <textarea [(ngModel)]="noteContent" name="content"></textarea>
      <button type="submit">Save</button>
    </form>
  `
})
export class NoteDetailComponent {
  noteTitle = '';
  noteContent = '';

  constructor(
    private notesStore: NotesStoreService,
    private route: ActivatedRoute
  ) {
    // Get the note from store by ID
    this.route.params.subscribe(params => {
      // Find note in store
      this.notesStore.notes$.subscribe(notes => {
        const note = notes.find(n => n.id === params['id']);
        if (note) {
          this.noteTitle = note.title;
          this.noteContent = note.content;
        }
      });
    });
  }

  onSave() {
    this.notesStore.updateNote(
      this.route.snapshot.params['id'],
      {
        title: this.noteTitle,
        content: this.noteContent
      }
    );
  }
}
```

---

## Template Reference Variables

### What are Template Reference Variables?

Use `#variableName` to reference elements and components in templates.

### Accessing Child Methods

```typescript
// parent.component.ts
@Component({
  selector: 'app-parent',
  template: `
    <input #nameInput type="text" />
    <app-child #childComponent [name]="nameInput.value"></app-child>
    <button (click)="callChildMethod()">Call Child</button>
  `
})
export class ParentComponent {
  @ViewChild('childComponent') childComponent!: ChildComponent;

  callChildMethod() {
    // Call a method on the child component
    this.childComponent.doSomething();
  }
}

// child.component.ts
@Component({
  selector: 'app-child'
})
export class ChildComponent {
  @Input() name!: string;

  doSomething() {
    console.log('Child method called!');
  }
}
```

### Accessing Multiple Child Components

```typescript
@Component({
  template: `
    <app-tab *ngFor="let tab of tabs" #tabComponents>
      {{ tab.title }}
    </app-tab>
  `
})
export class TabsComponent {
  tabs = [
    { title: 'Tab 1' },
    { title: 'Tab 2' },
    { title: 'Tab 3' }
  ];

  @ViewChildren('tabComponents') tabComponents!: QueryList<TabComponent>;

  ngAfterViewInit() {
    // Access all children
    this.tabComponents.forEach(tab => {
      console.log(tab);
    });
  }
}
```

---

## Service-Based Communication

### Pattern: Subject for Events

```typescript
// event.service.ts
@Injectable({ providedIn: 'root' })
export class EventService {
  // Different subjects for different events
  private noteCreatedSubject = new Subject<Note>();
  private noteDeletedSubject = new Subject<string>();

  noteCreated$ = this.noteCreatedSubject.asObservable();
  noteDeleted$ = this.noteDeletedSubject.asObservable();

  emitNoteCreated(note: Note) {
    this.noteCreatedSubject.next(note);
  }

  emitNoteDeleted(noteId: string) {
    this.noteDeletedSubject.next(noteId);
  }
}

// Any component can listen:
constructor(private eventService: EventService) {
  this.eventService.noteCreated$.subscribe(note => {
    console.log('New note created:', note);
  });

  this.eventService.noteDeleted$.subscribe(noteId => {
    console.log('Note deleted:', noteId);
  });
}

// Any component can emit:
constructor(private eventService: EventService) {
  // When something happens
  this.eventService.emitNoteCreated(newNote);
}
```

---

## Communication Patterns Comparison

| Pattern | Use Case | Complexity |
|---------|----------|-----------|
| **@Input** | Pass data down | Simple |
| **@Output** | Send events up | Simple |
| **Sibling Service** | Siblings communication | Medium |
| **Global Store** | Any-to-any communication | Medium |
| **Template Reference** | Direct component access | Simple |
| **Service Events** | Cross-cutting concerns | Medium |

---

## Best Practices

### ✅ DO:
- Use `@Input`/`@Output` for parent-child
- Use services for sibling/global communication
- Use `BehaviorSubject` when you need the last value
- Use `Subject` for one-time events
- Clean up subscriptions with `takeUntil` or `async` pipe
- Use `shareReplay(1)` for shared operations
- Keep stores focused on one domain
- Type your observables: `Observable<Note[]>`

### ❌ DON'T:
- Drill props through many levels (use service instead)
- Use services for parent-child communication
- Store sensitive data in BehaviorSubject (it's publicly readable)
- Create multiple stores for the same domain
- Leave subscriptions without cleanup
- Use `@ViewChild` to manipulate child DOM
- Emit from child to parent through multiple levels

---

**Master component communication to build scalable Angular apps!** 🚀
