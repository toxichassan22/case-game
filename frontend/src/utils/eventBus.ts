/**
 * Event Bus - Pub/Sub Pattern
 * Decoupled event system for cross-component communication
 */

type EventCallback = (...args: any[]) => void;

export class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Subscribe to an event once
   */
  once(event: string, callback: EventCallback): () => void {
    const unsubscribe = this.on(event, (...args) => {
      callback(...args);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Pre-defined events
export const GameEvents = {
  // Authentication
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_ERROR: 'auth:error',

  // Game State
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_END: 'game:end',

  // Case
  CASE_LOAD: 'case:load',
  CASE_COMPLETE: 'case:complete',
  CASE_ERROR: 'case:error',

  // Evidence
  EVIDENCE_COLLECT: 'evidence:collect',
  EVIDENCE_EXAMINE: 'evidence:examine',

  // Player Actions
  PLAYER_ACTION: 'player:action',
  PLAYER_ERROR: 'player:error',

  // UI
  TOAST_SHOW: 'toast:show',
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',

  // WebSocket
  WS_CONNECT: 'ws:connect',
  WS_DISCONNECT: 'ws:disconnect',
  WS_MESSAGE: 'ws:message',
  WS_ERROR: 'ws:error',
} as const;
