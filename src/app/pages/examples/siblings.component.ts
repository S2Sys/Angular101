import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SiblingMessageService {
  private messageSubject = new Subject<{
    from: string;
    text: string;
    timestamp: string;
  }>();

  message$ = this.messageSubject.asObservable();

  sendMessage(from: string, text: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.messageSubject.next({ from, text, timestamp });
  }
}

@Component({
  selector: 'app-siblings-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example">
      <h1>👥 Sibling to Sibling Communication</h1>

      <div class="explanation">
        <h3>How It Works</h3>
        <p>
          Siblings communicate through a <strong>shared service</strong>. One sibling sends
          messages via the service, and other siblings listen to those messages.
        </p>
        <code>this.service.message\$.subscribe(...) // Listen</code>
        <code>this.service.sendMessage(...) // Send</code>
      </div>

      <div class="example-content">
        <app-sibling-one [service]="service"></app-sibling-one>
        <app-sibling-two [service]="service"></app-sibling-two>
        <app-sibling-three [service]="service"></app-sibling-three>
      </div>

      <div class="code-example">
        <h3>Code Example</h3>
        <div class="code-block">
          <p><strong>Shared Service:</strong></p>
          <pre><code>{{ serviceCode }}</code></pre>
        </div>
        <div class="code-block">
          <p><strong>Sibling 1 (Sender):</strong></p>
          <pre><code>{{ sibling1Code }}</code></pre>
        </div>
        <div class="code-block">
          <p><strong>Sibling 2 (Receiver):</strong></p>
          <pre><code>{{ sibling2Code }}</code></pre>
        </div>
      </div>

      <div class="key-points">
        <h3>Key Points</h3>
        <ul>
          <li>✅ Service mediates communication between siblings</li>
          <li>✅ Uses RxJS Subject or BehaviorSubject</li>
          <li>✅ One sibling emits, others listen</li>
          <li>✅ Siblings don't know about each other directly</li>
          <li>✅ Scales to many components</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .example {
      max-width: 1200px;
    }

    .explanation {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .explanation code {
      display: block;
      background: #fff;
      padding: 8px;
      margin: 8px 0;
      border-radius: 3px;
      font-family: monospace;
      color: #d73a49;
    }

    .example-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
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
      font-size: 11px;
      line-height: 1.4;
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

    @media (max-width: 1024px) {
      .example-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SiblingsComponent {
  service = new SiblingMessageService();

  serviceCode = `@Injectable({ providedIn: 'root' })
export class SiblingMessageService {
  private messageSubject = new Subject<Message>();
  message\$ = this.messageSubject.asObservable();

  sendMessage(from: string, text: string) {
    this.messageSubject.next({ from, text, timestamp });
  }
}`;

  sibling1Code = `// Sibling 1: Sender
export class SiblingOneComponent {
  newMessage = '';

  constructor(private service: SiblingMessageService) {}

  sendMessage() {
    this.service.sendMessage('Sibling 1', this.newMessage);
    this.newMessage = '';
  }
}`;

  sibling2Code = `// Sibling 2: Receiver
export class SiblingTwoComponent implements OnInit {
  receivedMessages: string[] = [];
  private destroy\$ = new Subject<void>();

  constructor(private service: SiblingMessageService) {}

  ngOnInit() {
    this.service.message\$
      .pipe(takeUntil(this.destroy\$))
      .subscribe(msg => {
        this.receivedMessages.push(msg);
      });
  }

  ngOnDestroy() {
    this.destroy\$.next();
  }
}`;
}

@Component({
  selector: 'app-sibling-one',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="sibling-card sender">
      <h3>📤 Sibling 1 (Sender)</h3>
      <div class="input-group">
        <input
          [(ngModel)]="newMessage"
          placeholder="Type a message..."
          (keyup.enter)="sendMessage()"
        />
        <button (click)="sendMessage()" [disabled]="!newMessage.trim()">
          Send →
        </button>
      </div>
      <div class="sent-messages">
        <h4>Sent Messages:</h4>
        <div *ngFor="let msg of sentMessages" class="message-item sent">
          <span class="time">{{ msg.timestamp }}</span>
          <span class="text">{{ msg.text }}</span>
        </div>
        <div *ngIf="sentMessages.length === 0" class="empty">
          No messages sent yet
        </div>
      </div>
    </section>
  `,
  styles: [`
    .sibling-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .sibling-card h3 {
      margin-top: 0;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-group input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
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

    .input-group button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .sent-messages {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    .sent-messages h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .message-item {
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .message-item.sent {
      background: #e8f0fe;
      border-left: 3px solid #0066cc;
    }

    .message-item.received {
      background: #e8f5e9;
      border-left: 3px solid #4caf50;
    }

    .time {
      color: #999;
      font-size: 12px;
      white-space: nowrap;
    }

    .text {
      flex: 1;
      color: #333;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 20px 0;
      font-size: 12px;
    }
  `]
})
export class SiblingOneComponent {
  newMessage = '';
  sentMessages: any[] = [];

  constructor(private service: SiblingMessageService) {}

  sendMessage() {
    if (this.newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      this.sentMessages.push({
        text: this.newMessage,
        timestamp
      });
      this.service.sendMessage('Sibling 1', this.newMessage);
      this.newMessage = '';
    }
  }
}

@Component({
  selector: 'app-sibling-two',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="sibling-card receiver">
      <h3>📥 Sibling 2 (Receiver)</h3>
      <p class="description">Listens to messages from other siblings</p>
      <div class="received-messages">
        <h4>Received Messages:</h4>
        <div *ngFor="let msg of receivedMessages" class="message-item received">
          <span class="from">{{ msg.from }}</span>
          <span class="time">{{ msg.timestamp }}</span>
          <span class="text">{{ msg.text }}</span>
        </div>
        <div *ngIf="receivedMessages.length === 0" class="empty">
          Waiting for messages...
        </div>
      </div>
      <button (click)="clearMessages()" *ngIf="receivedMessages.length > 0">
        Clear
      </button>
    </section>
  `,
  styles: [`
    .sibling-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .sibling-card h3 {
      margin-top: 0;
    }

    .description {
      color: #999;
      font-size: 14px;
      margin: 0 0 15px;
    }

    .received-messages {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #ddd;
      margin-bottom: 15px;
    }

    .received-messages h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .message-item {
      padding: 10px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .message-item.received {
      background: #e8f5e9;
      border-left: 3px solid #4caf50;
    }

    .from {
      font-weight: bold;
      color: #4caf50;
      white-space: nowrap;
    }

    .time {
      color: #999;
      font-size: 12px;
      white-space: nowrap;
    }

    .text {
      color: #333;
      flex: 1;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 30px 0;
      font-size: 14px;
    }

    button {
      padding: 8px 16px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    button:hover {
      background: #45a049;
    }
  `]
})
export class SiblingTwoComponent {
  receivedMessages: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(private service: SiblingMessageService) {
    this.service.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.receivedMessages.push(msg);
      });
  }

  clearMessages() {
    this.receivedMessages = [];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Component({
  selector: 'app-sibling-three',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="sibling-card receiver">
      <h3>📨 Sibling 3 (Also Receiver)</h3>
      <p class="description">Also listens and can send messages</p>
      <div class="input-group">
        <input
          [(ngModel)]="newMessage"
          placeholder="Type a message..."
          (keyup.enter)="sendMessage()"
        />
        <button (click)="sendMessage()" [disabled]="!newMessage.trim()">
          Send →
        </button>
      </div>
      <div class="all-messages">
        <h4>All Messages:</h4>
        <div *ngFor="let msg of allMessages" class="message-item" [class.own]="msg.from === 'Sibling 3'">
          <span class="from">{{ msg.from }}</span>
          <span class="time">{{ msg.timestamp }}</span>
          <span class="text">{{ msg.text }}</span>
        </div>
        <div *ngIf="allMessages.length === 0" class="empty">
          No messages yet
        </div>
      </div>
    </section>
  `,
  styles: [`
    .sibling-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .sibling-card h3 {
      margin-top: 0;
    }

    .description {
      color: #999;
      font-size: 14px;
      margin: 0 0 15px;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .input-group input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .input-group button {
      padding: 10px 20px;
      background: #ff9800;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .input-group button:hover {
      background: #e68900;
    }

    .input-group button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .all-messages {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    .all-messages h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .message-item {
      padding: 10px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      gap: 10px;
      align-items: center;
      background: #e3f2fd;
      border-left: 3px solid #2196f3;
    }

    .message-item.own {
      background: #fff3e0;
      border-left-color: #ff9800;
    }

    .from {
      font-weight: bold;
      color: #2196f3;
      white-space: nowrap;
    }

    .message-item.own .from {
      color: #ff9800;
    }

    .time {
      color: #999;
      font-size: 12px;
      white-space: nowrap;
    }

    .text {
      color: #333;
      flex: 1;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 30px 0;
      font-size: 14px;
    }
  `]
})
export class SiblingThreeComponent {
  newMessage = '';
  allMessages: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(private service: SiblingMessageService) {
    this.service.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.allMessages.push(msg);
      });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.service.sendMessage('Sibling 3', this.newMessage);
      this.newMessage = '';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
