import { Injectable } from '@angular/core';

/**
 * BrowserStorageService - Wrapper around browser's localStorage
 * Provides type-safe access to persistent storage
 *
 * Equivalent to React101's useLocalStorage hook
 * Handles serialization/deserialization of objects
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  /**
   * Set a value in localStorage
   * @param key - Storage key
   * @param value - Value to store (can be any type, will be JSON serialized)
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item in localStorage [${key}]:`, error);
    }
  }

  /**
   * Get a value from localStorage
   * @param key - Storage key
   * @returns The stored value, or null if not found
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item from localStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Remove a value from localStorage
   * @param key - Storage key
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage [${key}]:`, error);
    }
  }

  /**
   * Clear all localStorage data
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key - Storage key
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
