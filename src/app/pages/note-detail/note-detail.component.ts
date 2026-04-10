import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '@shared/components/error-display/error-display.component';
import { NotesStoreService } from '@core/services/notes-store.service';
import { NotesService } from '@core/services/notes.service';
import { Note, UpdateNoteRequest } from '@models/note.model';
import { CanComponentDeactivate } from '@core/guards/unsaved-changes.guard';
import { Observable } from 'rxjs';

/**
 * NoteDetailComponent - View/Edit Single Note Page
 *
 * Smart component that:
 * - Loads a single note by ID
 * - Allows editing the note
 * - Saves changes
 * - Warns before leaving with unsaved changes
 *
 * Implements CanComponentDeactivate for the unsaved changes guard.
 */
@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    LoadingSpinnerComponent,
    ErrorDisplayComponent
  ],
  template: `
    <!-- Navigation -->
    <app-navbar></app-navbar>

    <!-- Main Content -->
    <div class="note-detail-container">
      <div class="note-detail-header">
        <button class="btn-back" (click)="onBack()">← Back</button>
        <h1>Edit Note</h1>
        <button
          class="btn-delete"
          (click)="onDelete()"
          [disabled]="notesStore.loading$ | async">
          Delete Note
        </button>
      </div>

      <!-- Error Display -->
      <app-error-display
        [error]="notesStore.error$ | async"
        (dismiss)="notesStore.clearError()">
      </app-error-display>

      <!-- Loading Spinner -->
      <app-loading-spinner
        [isLoading]="notesStore.loading$ | async"
        message="Saving note...">
      </app-loading-spinner>

      <!-- Note Form -->
      <form [formGroup]="noteForm" (ngSubmit)="onSave()" *ngIf="!isLoading; else loadingSpinner">
        <!-- Title Field -->
        <div class="form-group">
          <label for="title">Note Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Enter note title"
            class="form-input">
        </div>

        <!-- Content Field -->
        <div class="form-group">
          <label for="content">Content</label>
          <textarea
            id="content"
            formControlName="content"
            placeholder="Write your note content here..."
            rows="15"
            class="form-textarea">
          </textarea>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="btn-save" [disabled]="noteForm.invalid || (notesStore.loading$ | async)">
            Save Changes
          </button>
          <button type="button" class="btn-cancel" (click)="onCancel()">
            Cancel
          </button>
        </div>
      </form>

      <!-- Loading Template -->
      <ng-template #loadingSpinner>
        <div class="empty-state">
          <div class="spinner"></div>
          <p>Loading note...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .note-detail-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 30px 20px;
      }

      .note-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        gap: 15px;
        flex-wrap: wrap;
      }

      .btn-back {
        padding: 10px 15px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .btn-back:hover {
        background: #eee;
      }

      h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
        flex: 1;
      }

      .btn-delete {
        padding: 10px 20px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .btn-delete:hover:not(:disabled) {
        background: #c0392b;
      }

      .btn-delete:disabled {
        background: #bbb;
        cursor: not-allowed;
      }

      form {
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 25px;
      }

      .form-group {
        margin-bottom: 25px;
      }

      label {
        display: block;
        margin-bottom: 10px;
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.3s;
      }

      .form-input:focus,
      .form-textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-textarea {
        resize: vertical;
        min-height: 300px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 30px;
      }

      .btn-save,
      .btn-cancel {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-save {
        background: #667eea;
        color: white;
        flex: 1;
      }

      .btn-save:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-save:disabled {
        background: #bbb;
        cursor: not-allowed;
      }

      .btn-cancel {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        flex: 1;
      }

      .btn-cancel:hover {
        background: #eee;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 768px) {
        .note-detail-container {
          padding: 20px 15px;
        }

        .note-detail-header {
          flex-direction: column;
          align-items: stretch;
        }

        .btn-back,
        .btn-delete {
          width: 100%;
        }

        h1 {
          font-size: 22px;
        }

        form {
          padding: 20px;
        }

        .form-actions {
          flex-direction: column;
        }
      }
    `
  ]
})
export class NoteDetailComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  /**
   * Form for editing note
   */
  noteForm: FormGroup;

  /**
   * Whether note is still loading
   */
  isLoading = true;

  /**
   * The current note being edited
   */
  currentNote: Note | null = null;

  /**
   * Subject for cleanup
   */
  private destroy$ = new Subject<void>();

  /**
   * Note ID from route params
   */
  private noteId: string | null = null;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public notesStore: NotesStoreService,
    private notesService: NotesService
  ) {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]]
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // Get note ID from route params
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.noteId = params['id'];
        if (this.noteId) {
          this.loadNote(this.noteId);
        }
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
   * Implementation of CanComponentDeactivate
   * Warns user if they try to leave with unsaved changes
   */
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.noteForm.dirty && !this.noteForm.pristine) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  /**
   * Load note from backend
   */
  private loadNote(noteId: string): void {
    this.isLoading = true;
    this.notesService.fetchNoteById(noteId).subscribe({
      next: (note) => {
        this.currentNote = note;
        this.noteForm.patchValue({
          title: note.title,
          content: note.content
        });
        this.noteForm.markAsPristine();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load note:', error);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  /**
   * Save note changes
   */
  onSave(): void {
    if (this.noteForm.invalid || !this.noteId) return;

    const { title, content } = this.noteForm.value;
    const request: UpdateNoteRequest = {
      title,
      content,
      tags: this.currentNote?.tags || []
    };

    this.notesStore.updateNote(this.noteId, request);
    this.noteForm.markAsPristine();
  }

  /**
   * Handle cancel button
   */
  onCancel(): void {
    if (this.noteForm.dirty) {
      if (!confirm('Discard changes?')) return;
    }
    this.router.navigate(['/dashboard']);
  }

  /**
   * Handle back button
   */
  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Handle delete button
   */
  onDelete(): void {
    if (!this.noteId) return;

    if (confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      this.notesStore.deleteNote(this.noteId);
      // Navigate back after a short delay to allow deletion to complete
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 300);
    }
  }
}
