import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@models/note.model';

/**
 * NotesService - API Communication for Notes CRUD
 *
 * This service handles all HTTP calls related to notes management.
 * Separation of concerns:
 * - NotesService: HTTP API calls and data fetching
 * - NotesStoreService: State management and business logic
 *
 * CRUD Operations:
 * - Create: POST /api/notes
 * - Read: GET /api/notes and GET /api/notes/:id
 * - Update: PUT /api/notes/:id
 * - Delete: DELETE /api/notes/:id
 */
@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = '/api/notes';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all notes for the current authenticated user
   * Called on DashboardComponent init and when auth state changes
   *
   * @returns Observable<Note[]> - Array of user's notes
   */
  fetchNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  /**
   * Fetch a single note by ID
   * Called when opening a note detail page
   *
   * @param id - The note's ID
   * @returns Observable<Note> - The requested note
   */
  fetchNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new note
   * Called from DashboardComponent or note form
   *
   * @param note - CreateNoteRequest containing title, content, and optional tags
   * @returns Observable<Note> - The created note with generated id and timestamps
   */
  createNote(note: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }

  /**
   * Update an existing note
   * Called from NoteDetailComponent when saving changes
   *
   * @param id - The note's ID
   * @param note - UpdateNoteRequest with updated title, content, and tags
   * @returns Observable<Note> - The updated note
   */
  updateNote(id: string, note: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  /**
   * Delete a note
   * Called from NoteCardComponent or note detail page
   *
   * @param id - The note's ID to delete
   * @returns Observable<void> - Completes when deletion is successful
   */
  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search notes by a search term
   * Called when user types in the search box
   * This could be implemented as a query parameter or separate endpoint
   *
   * @param searchTerm - The search term to filter notes
   * @returns Observable<Note[]> - Filtered notes
   */
  searchNotes(searchTerm: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/search`, {
      params: { q: searchTerm }
    });
  }
}
