import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '@shared/components/error-display/error-display.component';
import { NoteCardComponent } from '@shared/components/note-card/note-card.component';
import { NotesStoreService } from '@core/services/notes-store.service';
import { Note, CreateNoteRequest } from '@models/note.model';

/**
 * DashboardComponent - Main Notes List Page
 *
 * Smart/container component that:
 * - Loads and displays all notes
 * - Allows creating new notes
 * - Filters notes by search term
 * - Deletes notes
 *
 * Equivalent to React101's DashboardPage component.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    LoadingSpinnerComponent,
    ErrorDisplayComponent,
    NoteCardComponent
  ],
  template: `
    <!-- Navigation -->
    <app-navbar></app-navbar>

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>My Notes</h1>
        <button class="btn-create" (click)="onCreateNote()">+ Create Note</button>
      </div>

      <!-- Error Display -->
      <app-error-display
        [error]="notesStore.error$ | async"
        (dismiss)="notesStore.clearError()">
      </app-error-display>

      <!-- Search Bar -->
      <div class="search-section">
        <input
          type="text"
          placeholder="Search notes by title, content, or tags..."
          class="search-input"
          [formControl]="searchControl"
        />
      </div>

      <!-- Loading Spinner -->
      <app-loading-spinner
        [isLoading]="notesStore.loading$ | async"
        message="Loading notes...">
      </app-loading-spinner>

      <!-- Notes List -->
      <div class="notes-list">
        <!-- Show notes if available -->
        <div *ngIf="(notesStore.filteredNotes$ | async) as notes; else noNotes">
          <div *ngIf="notes.length > 0; else emptySearch">
            <p class="notes-count">{{ notes.length }} note(s)</p>
            <div class="notes-grid">
              <app-note-card
                *ngFor="let note of notes"
                [note]="note"
                (edit)="onEditNote(note)"
                (delete)="onDeleteNote($event)">
              </app-note-card>
            </div>
          </div>

          <!-- Empty Search Results -->
          <ng-template #emptySearch>
            <div class="empty-state">
              <p>No notes found matching your search.</p>
              <button class="btn-link" (click)="searchControl.reset()">
                Clear search
              </button>
            </div>
          </ng-template>
        </div>

        <!-- No Notes at All -->
        <ng-template #noNotes>
          <div class="empty-state">
            <p>You don't have any notes yet.</p>
            <button class="btn-create" (click)="onCreateNote()">
              Create your first note
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 30px 20px;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        gap: 20px;
        flex-wrap: wrap;
      }

      h1 {
        margin: 0;
        font-size: 32px;
        color: #333;
        flex: 1;
        min-width: 200px;
      }

      .btn-create {
        padding: 12px 24px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s;
        white-space: nowrap;
      }

      .btn-create:hover {
        background: #5568d3;
      }

      .search-section {
        margin-bottom: 25px;
      }

      .search-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 15px;
        box-sizing: border-box;
      }

      .search-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .notes-list {
        min-height: 300px;
      }

      .notes-count {
        color: #666;
        font-size: 14px;
        margin-bottom: 15px;
      }

      .notes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state p {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .btn-link {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        text-decoration: underline;
        font-size: 15px;
      }

      .btn-link:hover {
        color: #5568d3;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 20px 15px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: stretch;
        }

        h1 {
          font-size: 24px;
        }

        .btn-create {
          width: 100%;
        }

        .notes-grid {
          grid-template-columns: 1fr;
          gap: 15px;
        }
      }
    `
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  /**
   * Search form control for reactive form
   */
  searchControl = this.fb.control('');

  /**
   * Subject for cleanup
   */
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    public notesStore: NotesStoreService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // Load notes from store
    this.notesStore.loadNotes();

    // Subscribe to search input changes
    // Update store's search term when user types
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.notesStore.setSearchTerm(searchTerm || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Handle create note button click
   * Opens a modal or navigates to create note page
   * For now, we'll navigate to a create note page
   */
  onCreateNote(): void {
    // Prompt for quick note creation
    const title = prompt('Note title:');
    if (!title) return;

    const content = prompt('Note content:');
    if (!content) return;

    const request: CreateNoteRequest = {
      title,
      content,
      tags: []
    };

    this.notesStore.createNote(request);
  }

  /**
   * Handle edit note
   * Navigate to note detail page for editing
   */
  onEditNote(note: Note): void {
    this.router.navigate(['/notes', note.id]);
  }

  /**
   * Handle delete note
   */
  onDeleteNote(noteId: string): void {
    this.notesStore.deleteNote(noteId);
  }
}
