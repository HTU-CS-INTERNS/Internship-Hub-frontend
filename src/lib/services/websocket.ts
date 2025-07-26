class WebSocketService {
  private socket: WebSocket | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    this.socket = new WebSocket(`${protocol}${window.location.host}/api/ws`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifySubscribers('connectionStatus', 'connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          this.notifySubscribers(data.type, data.payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.notifySubscribers('connectionStatus', 'disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private notifySubscribers(type: string, payload: any) {
    this.subscribers.forEach((callback, key) => {
      if (key === type || key === '*') {
        callback(payload);
      }
    });
  }

  subscribe(type: string, callback: (data: any) => void) {
    this.subscribers.set(type, callback);
    return () => this.subscribers.delete(type);
  }

  send(type: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  getStatus() {
    return this.socket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected';
  }
}

export const webSocketService = new WebSocketService();