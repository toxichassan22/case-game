/**
 * Session Management
 * Secure session handling with expiration
 */

import crypto from 'crypto';

export interface Session {
  id: string;
  userId: number;
  createdAt: number;
  expiresAt: number;
  data?: Record<string, any>;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private sessionTimeout: number; // milliseconds
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(sessionTimeoutMinutes: number = 30) {
    this.sessionTimeout = sessionTimeoutMinutes * 60 * 1000;
    this.startCleanup();
  }

  /**
   * Create a new session
   */
  createSession(userId: number, data?: Record<string, any>): Session {
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout,
      data,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session
   */
  updateSession(sessionId: string, data: Record<string, any>): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) return false;

    session.data = { ...session.data, ...data };
    session.expiresAt = Date.now() + this.sessionTimeout; // Refresh expiration

    return true;
  }

  /**
   * Destroy session
   */
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Destroy all sessions for a user
   */
  destroyUserSessions(userId: number): number {
    let destroyed = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        destroyed++;
      }
    }

    return destroyed;
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: number): Session[] {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId && Date.now() <= session.expiresAt
    );
  }

  /**
   * Refresh session expiration
   */
  refreshSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) return false;

    session.expiresAt = Date.now() + this.sessionTimeout;
    return true;
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    let count = 0;

    for (const session of this.sessions.values()) {
      if (Date.now() <= session.expiresAt) {
        count++;
      }
    }

    return count;
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  private startCleanup() {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * Stop cleanup interval
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager(30);
