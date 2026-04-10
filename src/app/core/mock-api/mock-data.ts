/**
 * Mock API Data
 * In-memory database for development and learning
 * Matches React101's mock data structure
 */

import { User, AuthResponse } from '@models/user.model';
import { Note } from '@models/note.model';

/**
 * Mock users database
 * In a real app, this would be in a backend database
 */
export const MOCK_USERS: Map<string, { user: User; password: string }> = new Map([
  [
    'demo@example.com',
    {
      user: {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        createdAt: new Date('2024-01-01')
      },
      password: 'password' // Demo password (would be hashed in real app)
    }
  ],
  [
    'alice@example.com',
    {
      user: {
        id: '2',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        createdAt: new Date('2024-02-01')
      },
      password: 'password123'
    }
  ]
]);

/**
 * Mock notes database
 * Each user has their own notes
 */
export const MOCK_NOTES: Map<string, Note[]> = new Map([
  [
    '1', // Demo user's notes
    [
      {
        id: 'note-1',
        userId: '1',
        title: 'Angular Learning Goals',
        content:
          'Master Angular 19, understand RxJS observables, and build reactive applications. Focus on understanding the patterns rather than just coding.',
        tags: ['angular', 'learning', 'goals'],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: 'note-2',
        userId: '1',
        title: 'BehaviorSubject vs Subject',
        content:
          'BehaviorSubject stores the current value and emits it immediately to new subscribers. Subject requires subscribers to listen for future events. Choose BehaviorSubject for state management.',
        tags: ['rxjs', 'observables', 'patterns'],
        createdAt: new Date('2024-03-14'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: 'note-3',
        userId: '1',
        title: 'Dependency Injection Best Practices',
        content:
          'Always use providedIn: "root" for services. Avoid creating services in components. Use private to prevent accidental access. Type inject() over constructor injection for tree-shaking.',
        tags: ['angular', 'di', 'best-practices'],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10')
      }
    ]
  ]
]);

/**
 * Mock token generator
 * Generates simple JWT-like tokens for authentication
 * Note: Not real JWT, just for learning purposes
 */
export function generateMockToken(userId: string, email: string): string {
  // Simple token format: base64(userId.email.timestamp)
  const tokenData = `${userId}.${email}.${Date.now()}`;
  return Buffer.from(tokenData).toString('base64');
}

/**
 * Simulate network delay
 * Makes mock API feel more realistic
 */
export function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => {
    const delay = Math.random() * 800 + 200; // 200-1000ms
    setTimeout(resolve, delay);
  });
}
