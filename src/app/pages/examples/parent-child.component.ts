import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-parent-child-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example">
      <h1>📤 Parent to Child Communication (@Input)</h1>

      <div class="explanation">
        <h3>How It Works</h3>
        <p>Parent components pass data DOWN to children using <strong>@Input</strong> property binding:</p>
        <code>&lt;app-message-card [message]="message"&gt;&lt;/app-message-card&gt;</code>
      </div>

      <div class="example-content">
        <section class="parent-section">
          <h3>Parent Component</h3>
          <div class="input-group">
            <label>
              Message Title:
              <input [(ngModel)]="newTitle" placeholder="Enter title..." />
            </label>
            <label>
              Message Content:
              <textarea [(ngModel)]="newContent" placeholder="Enter content..."></textarea>
            </label>
            <button (click)="addMessage()">Add Message</button>
          </div>

          <div class="messages-list">
            <h4>Messages to Pass to Children:</h4>
            <div *ngFor="let msg of messages" class="message-item">
              <strong>{{ msg.title }}</strong>
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </section>

        <section class="children-section">
          <h3>Child Components (receive via @Input)</h3>
          <div *ngFor="let msg of messages" class="child-wrapper">
            <app-message-card [message]="msg"></app-message-card>
          </div>
        </section>
      </div>

      <div class="code-example">
        <h3>Code Example</h3>
        <div class="code-block">
          <p><strong>Parent:</strong></p>
          <pre><code>{{ parentCode }}</code></pre>
        </div>
        <div class="code-block">
          <p><strong>Child:</strong></p>
          <pre><code>{{ childCode }}</code></pre>
        </div>
      </div>

      <div class="key-points">
        <h3>Key Points</h3>
        <ul>
          <li>✅ Data flows in one direction (parent → child)</li>
          <li>✅ Child receives via @Input decorator</li>
          <li>✅ Parent controls when data changes</li>
          <li>✅ Child is a "presentational" component</li>
          <li>⚠️ Child cannot modify @Input directly (violation of principle)</li>
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

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-group label {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .input-group input,
    .input-group textarea {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
    }

    .input-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .input-group button {
      padding: 10px 20px;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .input-group button:hover {
      background: #0052a3;
    }

    .messages-list {
      margin-top: 20px;
    }

    .message-item {
      background: white;
      padding: 10px;
      margin: 10px 0;
      border-left: 4px solid #0066cc;
      border-radius: 4px;
    }

    .message-item strong {
      display: block;
      margin-bottom: 5px;
      color: #0066cc;
    }

    .message-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .children-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .child-wrapper {
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
    }
  `]
})
export class ParentChildComponent {
  messages: Message[] = [
    {
      id: 1,
      title: 'Welcome to Angular',
      content: 'Learn about @Input for parent-to-child communication'
    }
  ];

  newTitle = '';
  newContent = '';

  parentCode = `@Component({
  selector: 'app-parent',
  template: \`
    <app-message-card
      *ngFor="let msg of messages"
      [message]="msg">
    </app-message-card>
  \`
})
export class ParentComponent {
  messages = [
    { id: 1, title: 'Hello', content: 'This is a message' }
  ];
}`;

  childCode = `@Component({
  selector: 'app-message-card',
  template: \`
    <div class="card">
      <h3>{{ message.title }}</h3>
      <p>{{ message.content }}</p>
    </div>
  \`
})
export class MessageCardComponent {
  @Input() message!: Message;  // Receives from parent
}`;

  addMessage() {
    if (this.newTitle.trim() && this.newContent.trim()) {
      const newMsg: Message = {
        id: Math.max(...this.messages.map(m => m.id), 0) + 1,
        title: this.newTitle,
        content: this.newContent
      };
      this.messages.push(newMsg);
      this.newTitle = '';
      this.newContent = '';
    }
  }
}

@Component({
  selector: 'app-message-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4 class="card-title">{{ message.title }}</h4>
      <p class="card-content">{{ message.content }}</p>
      <div class="card-id">ID: {{ message.id }}</div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .card-title {
      margin: 0 0 10px;
      color: #0066cc;
      font-size: 16px;
    }

    .card-content {
      margin: 0 0 10px;
      color: #666;
      font-size: 14px;
    }

    .card-id {
      font-size: 12px;
      color: #999;
      font-style: italic;
    }
  `]
})
export class MessageCardComponent {
  @Input() message!: Message;
}
