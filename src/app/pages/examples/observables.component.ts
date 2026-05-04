import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, combineLatest, forkJoin, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';

interface DataResult {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-observables-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example">
      <h1>⚡ Observable Patterns</h1>

      <div class="explanation">
        <h3>How It Works</h3>
        <p>
          Learn powerful patterns for combining and filtering observables:
          <strong>combineLatest</strong> (all emit, then sync), <strong>forkJoin</strong> (wait
          for all), <strong>switchMap</strong> (cancel previous), and more.
        </p>
      </div>

      <div class="example-grid">
        <app-combine-latest-demo></app-combine-latest-demo>
        <app-fork-join-demo></app-fork-join-demo>
        <app-search-demo></app-search-demo>
      </div>

      <div class="key-points">
        <h3>Common Observable Patterns</h3>
        <div class="patterns-grid">
          <div class="pattern">
            <h4>combineLatest</h4>
            <p>✅ All streams emit, then emit when ANY change</p>
            <p>📌 Use for: Reactive forms, filters + data</p>
          </div>
          <div class="pattern">
            <h4>forkJoin</h4>
            <p>✅ Wait for ALL streams to complete</p>
            <p>📌 Use for: Parallel data loading</p>
          </div>
          <div class="pattern">
            <h4>switchMap</h4>
            <p>✅ Cancel previous, switch to new</p>
            <p>📌 Use for: Search, route params</p>
          </div>
          <div class="pattern">
            <h4>debounceTime</h4>
            <p>✅ Wait for silence before emitting</p>
            <p>📌 Use for: Search input, auto-save</p>
          </div>
        </div>
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

    .example-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }

    .key-points {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .patterns-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .pattern {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #0066cc;
    }

    .pattern h4 {
      margin: 0 0 10px;
      color: #0066cc;
    }

    .pattern p {
      margin: 5px 0;
      font-size: 13px;
      color: #666;
    }

    @media (max-width: 1024px) {
      .example-grid {
        grid-template-columns: 1fr;
      }

      .patterns-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ObservablesComponent {}

@Component({
  selector: 'app-combine-latest-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="demo-card">
      <h3>combineLatest Example</h3>
      <div class="controls">
        <label>
          First Value:
          <input type="number" [(ngModel)]="firstValue" />
        </label>
        <label>
          Second Value:
          <input type="number" [(ngModel)]="secondValue" />
        </label>
      </div>
      <div class="result">
        <h4>Combined Result:</h4>
        <div class="result-box">
          <p *ngIf="combined\$ | async as result">
            First: <strong>{{ result[0] }}</strong>
            Second: <strong>{{ result[1] }}</strong>
            Sum: <strong>{{ result[0] + result[1] }}</strong>
          </p>
        </div>
        <p class="description">
          ✓ Both values must emit first
          <br />
          ✓ Then emits when EITHER changes
        </p>
      </div>
    </section>
  `,
  styles: [`
    .demo-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .demo-card h3 {
      margin-top: 0;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
    }

    .controls label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }

    .controls input {
      width: 80px;
      padding: 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .result {
      background: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .result h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .result-box {
      background: #e8f0fe;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .result-box p {
      margin: 0;
      color: #0066cc;
      font-size: 14px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }
  `]
})
export class CombineLatestDemoComponent implements OnInit {
  firstValue = 5;
  secondValue = 10;
  combined$!: Observable<[number, number]>;

  private firstSubject = new Subject<number>();
  private secondSubject = new Subject<number>();

  ngOnInit() {
    this.combined$ = combineLatest([
      this.firstSubject.asObservable(),
      this.secondSubject.asObservable()
    ]).pipe(
      startWith([this.firstValue, this.secondValue])
    );

    this.firstSubject.next(this.firstValue);
    this.secondSubject.next(this.secondValue);
  }

  ngOnChanges() {
    if (this.firstValue !== undefined) {
      this.firstSubject.next(this.firstValue);
    }
    if (this.secondValue !== undefined) {
      this.secondSubject.next(this.secondValue);
    }
  }
}

import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-fork-join-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="demo-card">
      <h3>forkJoin Example</h3>
      <button (click)="loadMultiple()">Load Multiple Data</button>
      <div class="result" *ngIf="loading">
        <p>⏳ Loading...</p>
      </div>
      <div class="result" *ngIf="!loading && result">
        <h4>All Data Loaded:</h4>
        <div class="result-box">
          <p><strong>User:</strong> {{ result.user.name }}</p>
          <p><strong>Posts:</strong> {{ result.posts }}</p>
          <p><strong>Settings:</strong> {{ result.settings }}</p>
        </div>
        <p class="description">
          ✓ Waits for ALL to complete
          <br />
          ✓ Emits ONCE with all values
        </p>
      </div>
    </section>
  `,
  styles: [`
    .demo-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .demo-card h3 {
      margin-top: 0;
    }

    button {
      padding: 10px 20px;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 15px;
    }

    button:hover {
      background: #0052a3;
    }

    .result {
      background: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .result h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .result-box {
      background: #e8f0fe;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .result-box p {
      margin: 6px 0;
      color: #0066cc;
      font-size: 13px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }
  `]
})
export class ForkJoinDemoComponent {
  loading = false;
  result: any = null;

  loadMultiple() {
    this.loading = true;
    this.result = null;

    forkJoin({
      user: of({ name: 'John Doe', id: 1 }),
      posts: of(5),
      settings: of({ theme: 'dark', language: 'en' })
    }).subscribe(result => {
      this.result = result;
      this.loading = false;
    });
  }
}

@Component({
  selector: 'app-search-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="demo-card">
      <h3>switchMap + debounceTime</h3>
      <input
        type="text"
        [(ngModel)]="searchTerm"
        (input)="search($event)"
        placeholder="Type to search..."
        class="search-input"
      />
      <div class="results">
        <h4>Results:</h4>
        <div class="results-list">
          <div *ngFor="let item of (results\$ | async)" class="result-item">
            {{ item.name }}
          </div>
          <div *ngIf="(results\$ | async)?.length === 0" class="empty">
            No results
          </div>
        </div>
        <p class="description">
          ✓ Waits 300ms after typing
          <br />
          ✓ Cancels previous search
          <br />
          ✓ Only searches if term changed
        </p>
      </div>
    </section>
  `,
  styles: [`
    .demo-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .demo-card h3 {
      margin-top: 0;
    }

    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .results {
      background: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .results h4 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .results-list {
      background: #e8f0fe;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      max-height: 150px;
      overflow-y: auto;
    }

    .result-item {
      padding: 6px;
      margin: 4px 0;
      background: white;
      border-radius: 3px;
      font-size: 13px;
      color: #0066cc;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 20px;
      font-size: 12px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }
  `]
})
export class SearchDemoComponent implements OnInit, OnDestroy {
  searchTerm = '';
  results$!: Observable<DataResult[]>;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.results$ = this.searchSubject.asObservable().pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.performSearch(term)),
      catchError(() => of([])),
      takeUntil(this.destroy$)
    );
  }

  search(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  private performSearch(term: string): Observable<DataResult[]> {
    if (!term.trim()) {
      return of([]);
    }

    // Simulate search
    const mockData: DataResult[] = [
      { id: 1, name: 'Angular', description: 'Framework' },
      { id: 2, name: 'Angular Material', description: 'UI Library' },
      { id: 3, name: 'Angular CLI', description: 'Command Line Tool' }
    ];

    return of(mockData.filter(d =>
      d.name.toLowerCase().includes(term.toLowerCase())
    ));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
