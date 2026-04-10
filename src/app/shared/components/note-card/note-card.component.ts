import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '@models/note.model';

/**
 * NoteCardComponent - Reusable Note Display Component
 *
 * Presentational component that displays a single note in card format.
 * Parent components communicate via @Input and @Output.
 *
 * Features:
 * - Display note title and preview of content
 * - Show note creation/update dates
 * - Display tags
 * - Emit events for edit and delete actions
 *
 * Usage:
 *   <app-note-card
 *     [note]="note"
 *     (edit)="onEditNote($event)"
 *     (delete)="onDeleteNote($event)">
 *   </app-note-card>
 */
@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="note-card" *ngIf="note">
      <!-- Title -->
      <h3 class="note-title">
        <a [routerLink]="['/notes', note.id]">{{ note.title }}</a>
      </h3>

      <!-- Content Preview -->
      <p class="note-content">{{ getContentPreview() }}</p>

      <!-- Tags -->
      <div class="note-tags" *ngIf="note.tags && note.tags.length > 0">
        <span class="tag" *ngFor="let tag of note.tags">#{{ tag }}</span>
      </div>

      <!-- Metadata -->
      <div class="note-meta">
        <span class="meta-item">📅 {{ formatDate(note.updatedAt) }}</span>
      </div>

      <!-- Actions -->
      <div class="note-actions">
        <a [routerLink]="['/notes', note.id]" class="btn-edit">Edit</a>
        <button class="btn-delete" (click)="onDelete()">Delete</button>
      </div>
    </div>
  `,
  styles: [
    `
      .note-card {
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .note-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #667eea;
        transform: translateY(-2px);
      }

      .note-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .note-title a {
        color: #667eea;
        text-decoration: none;
        transition: color 0.3s;
      }

      .note-title a:hover {
        color: #5568d3;
        text-decoration: underline;
      }

      .note-content {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .note-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        display: inline-block;
        background: #f5f5f5;
        color: #667eea;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .note-meta {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #999;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid #f5f5f5;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .note-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      .btn-edit {
        flex: 1;
        padding: 8px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .btn-edit:hover {
        background: #5568d3;
      }

      .btn-delete {
        flex: 1;
        padding: 8px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .btn-delete:hover {
        background: #c0392b;
      }

      @media (max-width: 768px) {
        .note-card {
          padding: 15px;
        }

        .note-title {
          font-size: 16px;
        }

        .note-content {
          -webkit-line-clamp: 2;
        }
      }
    `
  ]
})
export class NoteCardComponent {
  /**
   * The note to display
   */
  @Input() note!: Note;

  /**
   * Emitted when user clicks edit button
   */
  @Output() edit = new EventEmitter<Note>();

  /**
   * Emitted when user clicks delete button
   */
  @Output() delete = new EventEmitter<string>();

  /**
   * Get a preview of the note content (first 150 characters)
   */
  getContentPreview(): string {
    if (!this.note.content) return '';
    const maxLength = 150;
    return this.note.content.length > maxLength
      ? this.note.content.substring(0, maxLength) + '...'
      : this.note.content;
  }

  /**
   * Format date as "X days ago" or full date
   */
  formatDate(date: Date | string): string {
    const noteDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return noteDate.toLocaleDateString();
  }

  /**
   * Handle delete button click
   */
  onDelete(): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.delete.emit(this.note.id);
    }
  }
}
