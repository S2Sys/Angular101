import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { scan, shareReplay, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Note, NotesState, NotesAction, CreateNoteRequest, UpdateNoteRequest } from '@models/note.model';
import { NotesService } from './notes.service';

/**
 * NotesStoreService - Notes State Management
 *
 * This service manages all notes-related state using RxJS Subjects and Observables.
 * It's equivalent to React101's NotesContext with useReducer.
 *
 * Key concepts:
 * - Subject: Event emitter that we dispatch actions to (like dispatch in useReducer)
 * - scan operator: Applies reducer function to create derived state
 * - combineLatest: Combines multiple observables into one
 * - shareReplay: Multicasts the same value to multiple subscribers
 *
 * Usage:
 *   constructor(private notesStore: NotesStoreService) {}
 *   notes$ = this.notesStore.notes$;
 *   filteredNotes$ = this.notesStore.filteredNotes$;
 *   loading$ = this.notesStore.loading$;
 */
@Injectable({
  providedIn: 'root'
})
export class NotesStoreService {
  // ============================================================================
  // STATE STREAMS (Observables - similar to useState/useContext in React)
  // ============================================================================

  /**
   * All notes for the current user
   * Emits Note[]
   */
  notes$: Observable<Note[]>;

  /**
   * Notes filtered by search term
   * Auto-calculated by combining notes$ and searchTerm$
   * Emits Note[]
   */
  filteredNotes$: Observable<Note[]>;

  /**
   * Loading state during note operations
   * Emits boolean: true while fetching/creating/updating/deleting
   */
  loading$: Observable<boolean>;

  /**
   * Error message from note operations
   * Emits string | null
   */
  error$: Observable<string | null>;

  // ============================================================================
  // ACTION SUBJECTS (similar to dispatch in useReducer)
  // ============================================================================

  /**
   * Subject that receives all notes reducer actions
   * Components never subscribe to this directly - it's internal
   */
  private actionsSubject = new Subject<NotesAction>();

  /**
   * Subject for search term changes
   * Components can call setSearchTerm(term) to update search
   */
  private searchTermSubject = new BehaviorSubject<string>('');

  // ============================================================================
  // CONSTRUCTOR & INITIALIZATION
  // ============================================================================

  constructor(private notesService: NotesService) {
    // Create initial state
    const initialState: NotesState = {
      notes: [],
      loading: false,
      error: null,
      searchTerm: ''
    };

    // Create notes$ by applying reducer to action stream
    // scan operator applies the reducer function like useReducer does
    const notesState$ = this.actionsSubject.pipe(
      scan((state: NotesState, action: NotesAction) => this.notesReducer(state, action), initialState),
      shareReplay(1) // Share the same state to all subscribers
    );

    // Extract individual streams from the combined state
    this.notes$ = notesState$.pipe(
      map((state) => state.notes),
      shareReplay(1)
    );

    this.loading$ = notesState$.pipe(
      map((state) => state.loading),
      shareReplay(1)
    );

    this.error$ = notesState$.pipe(
      map((state) => state.error),
      shareReplay(1)
    );

    // Create filtered notes by combining notes$ and search term$
    // Similar to useMemo in React
    this.filteredNotes$ = combineLatest([
      this.notes$,
      this.searchTermSubject.pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        startWith('') // Start with empty search
      )
    ]).pipe(
      map(([notes, searchTerm]) => {
        // Filter notes by title and content matching search term
        if (!searchTerm.trim()) {
          return notes; // Return all notes if no search term
        }

        const term = searchTerm.toLowerCase();
        return notes.filter(
          (note) =>
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term) ||
            note.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      }),
      shareReplay(1)
    );
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Load all notes for the current user
   * Called on DashboardComponent init
   */
  loadNotes(): void {
    // Dispatch FETCH_START to set loading=true
    this.actionsSubject.next({ type: 'FETCH_START' });

    // Make HTTP call to fetch notes
    this.notesService.fetchNotes().subscribe({
      // On success, dispatch FETCH_SUCCESS with the notes array
      next: (notes) => {
        this.actionsSubject.next({
          type: 'FETCH_SUCCESS',
          payload: notes
        });
      },

      // On error, dispatch FETCH_ERROR with error message
      error: (err) => {
        const errorMessage = err?.error?.message || 'Failed to load notes';
        this.actionsSubject.next({
          type: 'FETCH_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Create a new note
   * Called from DashboardComponent when user creates a note
   *
   * @param request - CreateNoteRequest with title, content, and optional tags
   */
  createNote(request: CreateNoteRequest): void {
    this.actionsSubject.next({ type: 'CREATE_START' });

    this.notesService.createNote(request).subscribe({
      next: (newNote) => {
        this.actionsSubject.next({
          type: 'CREATE_SUCCESS',
          payload: newNote
        });
      },

      error: (err) => {
        const errorMessage = err?.error?.message || 'Failed to create note';
        this.actionsSubject.next({
          type: 'CREATE_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Update an existing note
   * Called from NoteDetailComponent when user saves changes
   *
   * @param id - Note ID
   * @param request - UpdateNoteRequest with updated title and content
   */
  updateNote(id: string, request: UpdateNoteRequest): void {
    this.actionsSubject.next({ type: 'UPDATE_START' });

    this.notesService.updateNote(id, request).subscribe({
      next: (updatedNote) => {
        this.actionsSubject.next({
          type: 'UPDATE_SUCCESS',
          payload: updatedNote
        });
      },

      error: (err) => {
        const errorMessage = err?.error?.message || 'Failed to update note';
        this.actionsSubject.next({
          type: 'UPDATE_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Delete a note
   * Called from NoteCardComponent or NoteDetailComponent
   *
   * @param id - Note ID to delete
   */
  deleteNote(id: string): void {
    this.actionsSubject.next({ type: 'DELETE_START' });

    this.notesService.deleteNote(id).subscribe({
      next: () => {
        this.actionsSubject.next({
          type: 'DELETE_SUCCESS',
          payload: id
        });
      },

      error: (err) => {
        const errorMessage = err?.error?.message || 'Failed to delete note';
        this.actionsSubject.next({
          type: 'DELETE_ERROR',
          payload: errorMessage
        });
      }
    });
  }

  /**
   * Update search term to filter notes
   * Called from DashboardComponent search input
   *
   * @param searchTerm - The search term to filter by
   */
  setSearchTerm(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
    this.actionsSubject.next({
      type: 'SET_SEARCH_TERM',
      payload: searchTerm
    });
  }

  /**
   * Clear any error messages
   */
  clearError(): void {
    this.actionsSubject.next({ type: 'CLEAR_ERROR' });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Reducer function - Pure function that takes current state and action,
   * returns new state (same pattern as useReducer in React)
   *
   * @param state - Current notes state
   * @param action - Action to apply
   * @returns New state
   */
  private notesReducer(state: NotesState, action: NotesAction): NotesState {
    switch (action.type) {
      // FETCH_START: User initiated fetch
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null
        };

      // FETCH_SUCCESS: Fetch completed successfully
      case 'FETCH_SUCCESS':
        return {
          ...state,
          loading: false,
          notes: action.payload,
          error: null
        };

      // FETCH_ERROR: Fetch failed
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      // CREATE_START: Creation started
      case 'CREATE_START':
        return {
          ...state,
          loading: true,
          error: null
        };

      // CREATE_SUCCESS: Note created successfully
      // Prepend new note to beginning of array (newer notes first)
      case 'CREATE_SUCCESS':
        return {
          ...state,
          loading: false,
          notes: [action.payload, ...state.notes],
          error: null
        };

      // CREATE_ERROR: Creation failed
      case 'CREATE_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      // UPDATE_START: Update started
      case 'UPDATE_START':
        return {
          ...state,
          loading: true,
          error: null
        };

      // UPDATE_SUCCESS: Note updated successfully
      // Replace the note with the same ID
      case 'UPDATE_SUCCESS':
        return {
          ...state,
          loading: false,
          notes: state.notes.map((note) =>
            note.id === action.payload.id ? action.payload : note
          ),
          error: null
        };

      // UPDATE_ERROR: Update failed
      case 'UPDATE_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      // DELETE_START: Deletion started
      case 'DELETE_START':
        return {
          ...state,
          loading: true,
          error: null
        };

      // DELETE_SUCCESS: Note deleted successfully
      // Remove the note with the given ID
      case 'DELETE_SUCCESS':
        return {
          ...state,
          loading: false,
          notes: state.notes.filter((note) => note.id !== action.payload),
          error: null
        };

      // DELETE_ERROR: Deletion failed
      case 'DELETE_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      // SET_SEARCH_TERM: Update search term (mainly for tracking in state)
      case 'SET_SEARCH_TERM':
        return {
          ...state,
          searchTerm: action.payload
        };

      // CLEAR_ERROR: Clear error message
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: null
        };

      // Default case: return state unchanged
      default:
        return state;
    }
  }
}
