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

## Key Concepts Covered

### 1. **Services & Dependency Injection**
- Creating services with `@Injectable({ providedIn: 'root' })`
- Constructor-based dependency injection
- Service composition and layering

### 2. **State Management**
- **AuthStoreService**: BehaviorSubject + Reducer pattern
- **NotesStoreService**: Subject + Reducer + RxJS operators
- Observable streams for reactive updates

### 3. **Reactive Forms**
- FormBuilder and FormGroup
- Form validation (built-in and custom validators)
- Form error handling and display

### 4. **RxJS Observables**
- Creating observables with Subject and BehaviorSubject
- Using operators: `map`, `scan`, `combineLatest`, `debounceTime`, `distinctUntilChanged`, `shareReplay`, etc.
- Subscription management with `takeUntil`

### 5. **Route Guards**
- `CanActivate` guard for authentication
- `CanDeactivate` guard for unsaved changes warning
- Protecting routes with AuthGuard

### 6. **HTTP Interceptors**
- AuthInterceptor: Automatically inject JWT tokens
- ErrorInterceptor: Centralized error handling
- MockInterceptor: Simulate backend API in development

### 7. **Component Communication**
- Parent-child communication with @Input/@Output
- Smart/Container components managing state
- Presentational components focused on display

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

## RxJS Observable Patterns

### Combining Observables for Filtered Data

```typescript
// Create search term stream
private searchTermSubject = new BehaviorSubject<string>('');

// Combine with notes to create filtered results
filteredNotes$ = combineLatest([
  this.notes$,
  this.searchTermSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    startWith('')
  )
]).pipe(
  map(([notes, searchTerm]) => {
    // Filter logic here
    return notes.filter(n => n.title.includes(searchTerm));
  }),
  shareReplay(1)
);
```

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

## Next Steps

1. **Add Unit Tests**
   - Test services with mock HTTP
   - Test components with test beds
   - Test guards and interceptors

2. **Create Wiki Documentation**
   - 20+ guides covering all Angular concepts
   - Code examples and best practices

3. **Add Additional Features**
   - Note tags and categories
   - Note sharing between users
   - Note comments
   - Rich text editor

4. **Deploy to Production**
   - Connect real backend API
   - Add environment configuration
   - Implement actual JWT authentication
   - Add analytics and monitoring

## Learning Resources

### Key Files to Study

1. **State Management**
   - `src/app/core/services/auth-store.service.ts`
   - `src/app/core/services/notes-store.service.ts`

2. **HTTP Communication**
   - `src/app/core/services/auth.service.ts`
   - `src/app/core/services/notes.service.ts`
   - `src/app/core/interceptors/` folder

3. **Components**
   - `src/app/pages/dashboard/dashboard.component.ts` (Smart component)
   - `src/app/shared/components/note-card/note-card.component.ts` (Presentational)

4. **Routing & Guards**
   - `src/app/app.routes.ts`
   - `src/app/core/guards/auth.guard.ts`

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
