/**
 * Mock API Handlers
 * Implements all API endpoints for development and learning
 * Routes HTTP requests to handler functions
 */

import { HttpRequest, HttpResponse } from '@angular/common/http';
import {
  MOCK_USERS,
  MOCK_NOTES,
  generateMockToken,
  simulateNetworkDelay
} from './mock-data';
import { User, AuthResponse } from '@models/user.model';
import { Note } from '@models/note.model';

/**
 * Route HTTP requests to appropriate mock handlers
 * Returns Observable<HttpResponse> for successful requests
 * Returns ErrorEvent for failed requests
 */
export async function handleMockRequest(
  req: HttpRequest<any>
): Promise<HttpResponse<any> | ErrorEvent> {
  // Simulate network delay
  await simulateNetworkDelay();

  // Extract user ID from token if available
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = extractUserIdFromToken(token);

  // Route to appropriate handler based on URL
  if (req.url.includes('/api/auth/login')) {
    return handleLogin(req);
  } else if (req.url.includes('/api/auth/signup')) {
    return handleSignup(req);
  } else if (req.url.includes('/api/auth/validate-token')) {
    return handleValidateToken(token);
  } else if (req.url.includes('/api/auth/profile') && req.method === 'GET') {
    return handleGetProfile(userId);
  } else if (req.url.includes('/api/auth/profile') && req.method === 'PUT') {
    return handleUpdateProfile(userId, req);
  } else if (req.url.includes('/api/notes') && req.method === 'GET') {
    return handleGetNotes(userId);
  } else if (req.url.includes('/api/notes') && req.method === 'POST') {
    return handleCreateNote(userId, req);
  } else if (
    req.url.includes('/api/notes/') &&
    req.method === 'GET'
  ) {
    const noteId = extractIdFromUrl(req.url);
    return handleGetNoteById(userId, noteId);
  } else if (
    req.url.includes('/api/notes/') &&
    req.method === 'PUT'
  ) {
    const noteId = extractIdFromUrl(req.url);
    return handleUpdateNote(userId, noteId, req);
  } else if (
    req.url.includes('/api/notes/') &&
    req.method === 'DELETE'
  ) {
    const noteId = extractIdFromUrl(req.url);
    return handleDeleteNote(userId, noteId);
  } else if (req.url.includes('/api/notes/search')) {
    return handleSearchNotes(userId, req);
  }

  // No handler found
  return new HttpResponse({
    status: 404,
    statusText: 'Not Found',
    body: { message: 'Endpoint not found' }
  });
}

// ============================================================================
// AUTHENTICATION HANDLERS
// ============================================================================

/**
 * Handle login request
 * Validates credentials and returns user + token
 */
function handleLogin(req: HttpRequest<any>): HttpResponse<any> {
  const { email, password } = req.body;

  // Find user by email
  const userRecord = MOCK_USERS.get(email);

  // Validate credentials
  if (!userRecord || userRecord.password !== password) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Invalid email or password' }
    });
  }

  // Generate token and return response
  const token = generateMockToken(userRecord.user.id, email);
  const response: AuthResponse = {
    user: userRecord.user,
    token
  };

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: response
  });
}

/**
 * Handle signup request
 * Validates input and creates new user
 */
function handleSignup(req: HttpRequest<any>): HttpResponse<any> {
  const { email, password, name } = req.body;

  // Check if user already exists
  if (MOCK_USERS.has(email)) {
    return new HttpResponse({
      status: 409,
      statusText: 'Conflict',
      body: { message: 'User already exists' }
    });
  }

  // Validate input
  if (!email || !password || !name) {
    return new HttpResponse({
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'Email, password, and name are required' }
    });
  }

  // Create new user
  const newUserId = String(MOCK_USERS.size + 1);
  const newUser: User = {
    id: newUserId,
    email,
    name,
    createdAt: new Date()
  };

  // Store user
  MOCK_USERS.set(email, { user: newUser, password });

  // Initialize empty notes array for new user
  MOCK_NOTES.set(newUserId, []);

  // Generate token
  const token = generateMockToken(newUserId, email);
  const response: AuthResponse = {
    user: newUser,
    token
  };

  return new HttpResponse({
    status: 201,
    statusText: 'Created',
    body: response
  });
}

/**
 * Handle token validation
 */
function handleValidateToken(token: string | null): HttpResponse<any> {
  const isValid = token !== null && token !== '';

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: isValid
  });
}

/**
 * Handle get profile request
 */
function handleGetProfile(userId: string | null): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  // Find user by ID
  const user = Array.from(MOCK_USERS.values()).find((u) => u.user.id === userId);

  if (!user) {
    return new HttpResponse({
      status: 404,
      statusText: 'Not Found',
      body: { message: 'User not found' }
    });
  }

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: user.user
  });
}

/**
 * Handle update profile request
 */
function handleUpdateProfile(userId: string | null, req: HttpRequest<any>): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  // Update would happen here
  // For now, just return success
  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: { message: 'Profile updated' }
  });
}

// ============================================================================
// NOTES HANDLERS
// ============================================================================

/**
 * Handle get all notes for user
 */
function handleGetNotes(userId: string | null): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  const userNotes = MOCK_NOTES.get(userId) || [];

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: userNotes
  });
}

/**
 * Handle create note request
 */
function handleCreateNote(userId: string | null, req: HttpRequest<any>): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  const { title, content, tags = [] } = req.body;

  // Validate input
  if (!title || !content) {
    return new HttpResponse({
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'Title and content are required' }
    });
  }

  // Create new note
  const newNote: Note = {
    id: `note-${Date.now()}`,
    userId,
    title,
    content,
    tags,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Store note
  const userNotes = MOCK_NOTES.get(userId) || [];
  userNotes.unshift(newNote); // Add to beginning (newest first)
  MOCK_NOTES.set(userId, userNotes);

  return new HttpResponse({
    status: 201,
    statusText: 'Created',
    body: newNote
  });
}

/**
 * Handle get note by ID
 */
function handleGetNoteById(userId: string | null, noteId: string): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  const userNotes = MOCK_NOTES.get(userId) || [];
  const note = userNotes.find((n) => n.id === noteId);

  if (!note) {
    return new HttpResponse({
      status: 404,
      statusText: 'Not Found',
      body: { message: 'Note not found' }
    });
  }

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: note
  });
}

/**
 * Handle update note request
 */
function handleUpdateNote(
  userId: string | null,
  noteId: string,
  req: HttpRequest<any>
): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  const userNotes = MOCK_NOTES.get(userId) || [];
  const noteIndex = userNotes.findIndex((n) => n.id === noteId);

  if (noteIndex === -1) {
    return new HttpResponse({
      status: 404,
      statusText: 'Not Found',
      body: { message: 'Note not found' }
    });
  }

  const { title, content, tags = [] } = req.body;

  // Update note
  const updatedNote: Note = {
    ...userNotes[noteIndex],
    title: title || userNotes[noteIndex].title,
    content: content || userNotes[noteIndex].content,
    tags: tags || userNotes[noteIndex].tags,
    updatedAt: new Date()
  };

  userNotes[noteIndex] = updatedNote;
  MOCK_NOTES.set(userId, userNotes);

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: updatedNote
  });
}

/**
 * Handle delete note request
 */
function handleDeleteNote(userId: string | null, noteId: string): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  let userNotes = MOCK_NOTES.get(userId) || [];
  const originalLength = userNotes.length;

  // Filter out the note
  userNotes = userNotes.filter((n) => n.id !== noteId);

  if (userNotes.length === originalLength) {
    // Note not found
    return new HttpResponse({
      status: 404,
      statusText: 'Not Found',
      body: { message: 'Note not found' }
    });
  }

  MOCK_NOTES.set(userId, userNotes);

  return new HttpResponse({
    status: 204,
    statusText: 'No Content'
  });
}

/**
 * Handle search notes request
 */
function handleSearchNotes(userId: string | null, req: HttpRequest<any>): HttpResponse<any> {
  if (!userId) {
    return new HttpResponse({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'Authentication required' }
    });
  }

  const searchTerm = req.params.get('q')?.toLowerCase() || '';
  const userNotes = MOCK_NOTES.get(userId) || [];

  const filtered = userNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );

  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    body: filtered
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract user ID from mock token
 */
function extractUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const userId = decoded.split('.')[0];
    return userId;
  } catch (error) {
    return null;
  }
}

/**
 * Extract resource ID from URL
 * Example: /api/notes/note-123 → note-123
 */
function extractIdFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}
