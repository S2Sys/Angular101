/**
 * Note Model - Represents a user's note in the application
 * Mirrors React101's Note interface
 */

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request payload for creating a new note
 */
export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Request payload for updating an existing note
 */
export interface UpdateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Internal notes state stored in NotesStoreService
 * Equivalent to React's NotesContext state with useReducer
 */
export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

/**
 * Union type for all possible notes reducer actions
 * Each action represents a state mutation in the notes store
 */
export type NotesAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Note[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: Note }
  | { type: 'CREATE_ERROR'; payload: string }
  | { type: 'UPDATE_START' }
  | { type: 'UPDATE_SUCCESS'; payload: Note }
  | { type: 'UPDATE_ERROR'; payload: string }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'DELETE_ERROR'; payload: string }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_ERROR' };
