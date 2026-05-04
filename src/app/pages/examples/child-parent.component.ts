import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-child-parent-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example">
      <h1>📥 Child to Parent Communication (@Output)</h1>

      <div class="explanation">
        <h3>How It Works</h3>
        <p>Child components send events UP to parents using <strong>@Output</strong> and <strong>EventEmitter</strong>:</p>
        <code>&lt;app-todo-item (complete)="onTodoComplete(\$event)"&gt;&lt;/app-todo-item&gt;</code>
      </div>

      <div class="example-content">
        <section class="parent-section">
          <h3>Parent Component</h3>
          <div class="stats">
            <div class="stat">
              <strong>{{ todos.length }}</strong>
              <span>Total Todos</span>
            </div>
            <div class="stat">
              <strong>{{ completedCount }}</strong>
              <span>Completed</span>
            </div>
            <div class="stat">
              <strong>{{ todos.length - completedCount }}</strong>
              <span>Remaining</span>
            </div>
          </div>

          <div class="log-section">
            <h4>Events from Children:</h4>
            <div class="log">
              <div *ngFor="let event of eventLog" class="log-item">
                {{ event }}
              </div>
              <div *ngIf="eventLog.length === 0" class="log-empty">
                No events yet. Interact with todos below...
              </div>
            </div>
            <button (click)="clearLog()" *ngIf="eventLog.length > 0">
              Clear Log
            </button>
          </div>
        </section>

        <section class="children-section">
          <h3>Child Components (emit via @Output)</h3>
          <div *ngFor="let todo of todos" class="todo-wrapper">
            <app-todo-item
              [todo]="todo"
              (complete)="onTodoComplete($event)"
              (delete)="onTodoDelete($event)"
              (edit)="onTodoEdit($event)"
            ></app-todo-item>
          </div>
        </section>
      </div>

      <div class="code-example">
        <h3>Code Example</h3>
        <div class="code-block">
          <p><strong>Child (emits events):</strong></p>
          <pre><code>{{ childCode }}</code></pre>
        </div>
        <div class="code-block">
          <p><strong>Parent (listens to events):</strong></p>
          <pre><code>{{ parentCode }}</code></pre>
        </div>
      </div>

      <div class="key-points">
        <h3>Key Points</h3>
        <ul>
          <li>✅ Events flow upward (child → parent)</li>
          <li>✅ Child emits via @Output EventEmitter</li>
          <li>✅ Parent listens with (eventName) binding</li>
          <li>✅ Parent handles the event callback</li>
          <li>✅ Child doesn't know who the parent is</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example {
      max-width: 1000px;
    }

    .explanation {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .explanation code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      color: #d73a49;
    }

    .example-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .parent-section,
    .children-section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .parent-section h3,
    .children-section h3 {
      margin-top: 0;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat {
      background: white;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #ddd;
    }

    .stat strong {
      display: block;
      font-size: 24px;
      color: #0066cc;
      margin-bottom: 5px;
    }

    .stat span {
      font-size: 12px;
      color: #666;
    }

    .log-section {
      margin-top: 20px;
    }

    .log-section h4 {
      margin: 0 0 10px;
    }

    .log {
      background: #1e1e1e;
      color: #4fc3f7;
      padding: 12px;
      border-radius: 4px;
      height: 200px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .log-item {
      padding: 4px 0;
      border-bottom: 1px solid #333;
    }

    .log-empty {
      text-align: center;
      color: #666;
      padding: 80px 10px;
    }

    .log-section button {
      padding: 8px 16px;
      background: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .log-section button:hover {
      background: #555;
    }

    .children-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .todo-wrapper {
      width: 100%;
    }

    .code-example {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      overflow-x: auto;
    }

    .code-block {
      margin-bottom: 20px;
    }

    .code-block p {
      color: #4fc3f7;
      font-weight: bold;
      margin: 0 0 10px;
    }

    .code-example pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
    }

    .key-points {
      background: #fff3cd;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .key-points ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .key-points li {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .example-content {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ChildParentComponent {
  todos: Todo[] = [
    { id: 1, text: 'Click the checkbox to complete', completed: false },
    { id: 2, text: 'Click the edit button to rename', completed: false },
    { id: 3, text: 'Click the delete button to remove', completed: false }
  ];

  eventLog: string[] = [];

  get completedCount() {
    return this.todos.filter(t => t.completed).length;
  }

  childCode = `@Component({
  selector: 'app-todo-item',
  template: \`
    <button (click)="onComplete()">
      {{ todo.completed ? '✓' : '' }} {{ todo.text }}
    </button>
    <button (click)="onDelete()">Delete</button>
  \`
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() complete = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  onComplete() {
    this.complete.emit(this.todo.id);
  }

  onDelete() {
    this.delete.emit(this.todo.id);
  }
}`;

  parentCode = `@Component({
  template: \`
    <app-todo-item
      *ngFor="let todo of todos"
      [todo]="todo"
      (complete)="onTodoComplete(\$event)"
      (delete)="onTodoDelete(\$event)"
    ></app-todo-item>
  \`
})
export class ParentComponent {
  todos: Todo[] = [...];

  onTodoComplete(todoId: number) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) todo.completed = !todo.completed;
  }

  onTodoDelete(todoId: number) {
    this.todos = this.todos.filter(t => t.id !== todoId);
  }
}`;

  onTodoComplete(todoId: number) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      this.logEvent(
        `✓ Todo #${todoId} marked as ${todo.completed ? 'completed' : 'incomplete'}`
      );
    }
  }

  onTodoDelete(todoId: number) {
    this.todos = this.todos.filter(t => t.id !== todoId);
    this.logEvent(`✗ Todo #${todoId} deleted`);
  }

  onTodoEdit(event: { id: number; newText: string }) {
    const todo = this.todos.find(t => t.id === event.id);
    if (todo) {
      todo.text = event.newText;
      this.logEvent(`✎ Todo #${event.id} renamed to "${event.newText}"`);
    }
  }

  private logEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.unshift(`[${timestamp}] ${message}`);
    if (this.eventLog.length > 10) {
      this.eventLog.pop();
    }
  }

  clearLog() {
    this.eventLog = [];
  }
}

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content">
        <input
          type="checkbox"
          [checked]="todo.completed"
          (change)="onComplete()"
          class="checkbox"
        />
        <span *ngIf="!editing" class="todo-text">{{ todo.text }}</span>
        <input
          *ngIf="editing"
          type="text"
          [(ngModel)]="editText"
          class="edit-input"
          (blur)="saveEdit()"
          (keyup.enter)="saveEdit()"
          autofocus
        />
      </div>
      <div class="todo-actions">
        <button (click)="toggleEdit()" class="btn-edit">
          {{ editing ? '✓' : '✎' }}
        </button>
        <button (click)="onDelete()" class="btn-delete">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      transition: all 0.2s;
    }

    .todo-item:hover {
      border-color: #0066cc;
      box-shadow: 0 2px 4px rgba(0,102,204,0.1);
    }

    .todo-item.completed {
      background: #f5f5f5;
    }

    .todo-content {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .checkbox {
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .todo-text {
      color: #333;
      font-size: 14px;
    }

    .todo-item.completed .todo-text {
      text-decoration: line-through;
      color: #999;
    }

    .edit-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #0066cc;
      border-radius: 4px;
      font-family: inherit;
    }

    .todo-actions {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #e8f0fe;
      color: #0066cc;
    }

    .btn-edit:hover {
      background: #0066cc;
      color: white;
    }

    .btn-delete {
      background: #ffe8e8;
      color: #cc0000;
    }

    .btn-delete:hover {
      background: #cc0000;
      color: white;
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() complete = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<{ id: number; newText: string }>();

  editing = false;
  editText = '';

  onComplete() {
    this.complete.emit(this.todo.id);
  }

  onDelete() {
    this.delete.emit(this.todo.id);
  }

  toggleEdit() {
    if (!this.editing) {
      this.editText = this.todo.text;
      this.editing = true;
    } else {
      this.saveEdit();
    }
  }

  saveEdit() {
    if (this.editText.trim() && this.editText !== this.todo.text) {
      this.edit.emit({ id: this.todo.id, newText: this.editText });
    }
    this.editing = false;
  }
}
