import { Logger } from '../utils/logger';

// ── WebSocket Service ─────────────────────────────────────────────────
// Singleton WebSocket connection manager with auto-reconnect and
// event emitter pattern matching the server protocol.

type ServerMessage = {
  type: string;
  payload: unknown;
};

type MessageHandler<T = unknown> = (payload: T) => void;
type UntypedMessageHandler = MessageHandler<unknown>;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private handlers = new Map<string, Set<UntypedMessageHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutMs = 10000; // 10s max to establish connection
  private intentionalClose = false;
  private messageQueue: { type: string; payload: unknown }[] = [];
  private maxQueueSize = 50;

  /**
   * Connect to the game server WebSocket.
   */
  connect(url: string): void {
    const hasLiveSocket =
      this.ws
      && this.url === url
      && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN);

    if (hasLiveSocket) {
      return;
    }

    this.url = url;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.createConnection();
  }

  private createConnection(): void {
    if (this.ws) {
      // Detach handlers BEFORE closing so onclose doesn't fire scheduleReconnect
      // while we're already creating a fresh connection.
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      Logger.log('[WS] Connected to server');
      this.reconnectAttempts = 0;
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      this.emit('_connected', {});
      this.flushQueue();
    };

    // Start connection timeout — if we don't connect within the window, retry
    this.connectionTimeout = setTimeout(() => {
      this.connectionTimeout = null;
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        Logger.warn('[WS] Connection timeout — closing and retrying');
        this.ws.close();
      }
    }, this.connectionTimeoutMs);

    this.ws.onmessage = (event: MessageEvent) => {
      let msg: ServerMessage;
      try {
        if (typeof event.data !== 'string') {
          throw new Error('Expected string message, got ' + typeof event.data);
        }
        msg = JSON.parse(event.data) as ServerMessage;
        
        // Basic structure validation
        if (!msg || typeof msg.type !== 'string') {
          throw new Error('Invalid message structure');
        }
        
        this.emit(msg.type, msg.payload);
      } catch (err) {
        Logger.error('[WS] Failed to parse message:', err, event.data);
        this.emit('ERROR', { 
          message: 'حدث خطأ في قراءة بيانات السيرفر', 
          details: err instanceof Error ? err.message : 'Unknown error',
          code: 'PARSE_ERROR'
        });
        
        // Recovery: if messages are consistently corrupt, might need a reconnect
        // For now, we just log it and emit error to UI.
      }
    };

    this.ws.onclose = () => {
      Logger.log('[WS] Disconnected');
      this.emit('_disconnected', {});

      if (!this.intentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      Logger.error('[WS] Error:', err);
    };
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    Logger.log(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  private flushQueue(): void {
    if (this.messageQueue.length > 0) {
      Logger.log(`[WS] Flushing ${this.messageQueue.length} queued messages`);
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      for (const msg of queue) {
        this.send(msg.type, msg.payload);
      }
    }
  }

  /**
   * Send a typed message to the server.
   */
  send<T = unknown>(type: string, payload: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      Logger.warn('[WS] Cannot send — not connected, queueing message:', type);
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push({ type, payload });
      } else {
        Logger.error('[WS] Message queue full, dropping message:', type);
        this.emit('ERROR', { message: 'فشل الاتصال وتم تجاوز سعة قائمة الانتظار' });
      }
      return;
    }
    try {
      this.ws.send(JSON.stringify({ type, payload }));
    } catch (err) {
      Logger.error('[WS] Failed to serialize message:', err);
      this.emit('ERROR', { message: 'فشل في تجهيز البيانات للإرسال', details: err });
    }
  }

  /**
   * Register a handler for a specific message type.
   */
  on<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const untypedHandler = handler as UntypedMessageHandler;
    this.handlers.get(type)!.add(untypedHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(untypedHandler);
    };
  }

  /**
   * Remove a handler for a specific message type.
   */
  off<T = unknown>(type: string, handler: MessageHandler<T>): void {
    this.handlers.get(type)?.delete(handler as UntypedMessageHandler);
  }

  private emit(type: string, payload: unknown): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[WS] Handler error for ${type}:`, err);
        }
      }
    }
  }

  /**
   * Disconnect from the server.
   */
  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    // Clear queued messages to prevent stale data on future reconnect
    this.messageQueue = [];
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if currently connecting.
   */
  get isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }

  /**
   * Check if currently connected.
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
