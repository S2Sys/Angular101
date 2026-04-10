# Angular101 - Quick Start Guide

Welcome to Angular101! This guide will get you up and running in 5 minutes.

## What is Angular101?

A complete, production-ready Angular 19+ learning application that demonstrates all core Angular concepts through a practical Notes management app.

**Key Features:**
- ✅ User authentication (login/signup)
- ✅ Complete CRUD operations (Create, Read, Update, Delete notes)
- ✅ Real-time search and filtering
- ✅ Responsive UI design
- ✅ Mock API backend (no server needed)
- ✅ Full TypeScript with strict mode

## Installation

### 1. Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Code editor (VS Code recommended)

### 2. Install Dependencies

```bash
cd Angular101
npm install
```

This installs all required dependencies:
- Angular 19
- RxJS 7.8+
- TypeScript 5.3+
- Other utilities

### 3. Start Development Server

```bash
npm start
```

The app will open automatically at `http://localhost:4200/`

## First Steps

### 1. Login with Demo Account

When the app loads, you'll see the login page.

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `password`

Click "Login" to enter the app.

### 2. Explore the Dashboard

After login, you'll see:
- **Navigation Bar**: Links to Dashboard, Profile, Settings
- **My Notes**: List of existing notes
- **Create Note Button**: To create a new note
- **Search Bar**: To filter notes

### 3. Create a Note

1. Click the "Create Note" button
2. Enter a title: "My First Angular Note"
3. Enter content: "I'm learning Angular!"
4. Click "Create"

Your note appears at the top of the list.

### 4. Edit a Note

1. Click "Edit" on any note card
2. You'll see the full editor with title and content
3. Make changes and click "Save Changes"
4. Use the "Delete Note" button to remove it

### 5. Search Notes

Type in the search box to filter notes by:
- Title
- Content
- Tags

Search is debounced (waits 300ms after you stop typing) for performance.

### 6. Explore Profile & Settings

- **Profile**: View your user information
- **Settings**: Configure app preferences

## Project Structure Overview

```
Angular101/
├── src/app/
│   ├── core/              # Core services, guards, interceptors
│   ├── shared/            # Reusable components
│   ├── pages/             # Page components (Login, Dashboard, etc.)
│   ├── models/            # TypeScript interfaces
│   └── app.routes.ts      # Route configuration
├── wiki/                  # Learning guides
└── README.md              # Full documentation
```

## Key Files to Explore

### 1. **Authentication Flow**
- `src/app/pages/login/login.component.ts` - Login form
- `src/app/core/services/auth-store.service.ts` - Auth state management
- `src/app/core/services/auth.service.ts` - Auth API calls

### 2. **State Management**
- `src/app/core/services/notes-store.service.ts` - Notes state with RxJS
- `src/app/core/services/notes.service.ts` - Notes API calls
- `src/app/models/note.model.ts` - Data interfaces

### 3. **Components**
- `src/app/pages/dashboard/dashboard.component.ts` - Main notes list
- `src/app/pages/note-detail/note-detail.component.ts` - Note editor
- `src/app/shared/components/note-card/note-card.component.ts` - Note display

## Running Commands

### Development Server
```bash
npm start
```
Runs the app in development mode on `http://localhost:4200/`

### Build for Production
```bash
npm run build
```
Creates optimized production build in `dist/` folder

### Run Tests
```bash
npm test
```
Runs unit tests with Karma/Jasmine

### Run Linting
```bash
npm run lint
```
Checks code quality with ESLint

## Common Questions

### Q: How do I change the demo password?
The mock API uses in-memory storage. Edit `src/app/core/mock-api/mock-data.ts` to modify credentials.

### Q: Can I use a real backend?
Yes! The app uses HTTP services. Replace mock API with real endpoints in `src/app/core/services/`.

### Q: Where are my notes stored?
In development, notes are stored in memory (cleared on refresh). In production, they'd be in a database.

### Q: How do I add new features?
Create components in `src/app/pages/` or `src/app/shared/components/`, use services for logic, and update routes in `app.routes.ts`.

## Next Steps

1. **Explore the Code**
   - Read through `auth-store.service.ts` to understand state management
   - Check `notes-store.service.ts` for RxJS patterns
   - Look at component templates for Angular syntax

2. **Read the Guides**
   - Angular Fundamentals (`02-angular-fundamentals.md`)
   - Dependency Injection (`03-dependency-injection.md`)
   - RxJS & Observables (`05-rxjs-observables.md`)

3. **Try Modifications**
   - Add a new field to notes (tags, priority, etc.)
   - Create a new page component
   - Add a custom validator to forms

4. **Build Something**
   - Create a todo app using the same patterns
   - Add a category system for notes
   - Implement note sharing between users

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Port 4200 already in use
```bash
# Start on different port
ng serve --port 4201
```

### Mock API isn't working
- Check browser DevTools Console for errors
- Verify `MockInterceptor` is registered in `app.config.ts`
- Ensure HTTP requests are to `/api/...` URLs

### Form validation not working
- Ensure form control is marked as touched: `field.markAsTouched()`
- Check template shows errors when `field.invalid && field.touched`

## Browser DevTools Tips

### 1. Redux DevTools (RxJS)
- Install Redux DevTools browser extension
- Helps visualize state changes (with additional setup)

### 2. Angular DevTools
- Install Angular DevTools browser extension
- Inspect components, services, and performance

### 3. Network Tab
- Watch HTTP requests to `/api/...` endpoints
- Verify mock API responses are correct

### 4. Console
- See `[Mock API]` logs for debugging
- Check for service initialization messages

## Learn More

- **Full README**: See `README.md` for complete documentation
- **Guides**: Check `wiki/` folder for detailed guides on each topic
- **Code Comments**: Most files have extensive inline comments explaining concepts

## Getting Help

1. Check the troubleshooting section above
2. Read related guides in `wiki/` folder
3. Review code comments in relevant files
4. Check console for error messages

---

**You're all set!** 🚀

Start exploring the app, then dive into the code to learn Angular from real-world patterns.

Have fun learning! 📚
