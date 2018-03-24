export const CONNECT_WEBSOCKET = 'CONNECT_WEBSOCKET';
export const DISCONNECT_WEBSOCKET = 'DISCONNECT_WEBSOCKET';
export const WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED';
export const WEBSOCKET_CONNECTING = 'WEBSOCKET_CONNECTING';
export const WEBSOCKET_CONNECTED = 'WEBSOCKET_CONNECTED';
export const WEBSOCKET_DISCONNECTING = 'WEBSOCKET_DISCONNECTING';
export const WEBSOCKET_OFFLINE = 'WEBSOCKET_OFFLINE';
export const WEBSOCKET_ERROR = 'WEBSOCKET_ERROR';

export type WebSocketActions = {
  CONNECT_WEBSOCKET: { type: typeof CONNECT_WEBSOCKET, date: Date },
  DISCONNECT_WEBSOCKET: { type: typeof DISCONNECT_WEBSOCKET, date: Date },
  WEBSOCKET_DISCONNECTED: { type: typeof WEBSOCKET_DISCONNECTED, date: Date },
  WEBSOCKET_CONNECTING: { type: typeof WEBSOCKET_CONNECTING, date: Date },
  WEBSOCKET_CONNECTED: { type: typeof WEBSOCKET_CONNECTED, date: Date },
  WEBSOCKET_DISCONNECTING: { type: typeof WEBSOCKET_DISCONNECTING, date: Date },
  WEBSOCKET_OFFLINE: { type: typeof WEBSOCKET_OFFLINE, date: Date },
  WEBSOCKET_ERROR: { type: typeof WEBSOCKET_ERROR, date: Date, errorMessage: string },
};

export type WebSocketAction = WebSocketActions[keyof WebSocketActions];

export const websocketActionCreators = {
  connectWebSocket: () => ({
    type: CONNECT_WEBSOCKET as typeof CONNECT_WEBSOCKET,
    date: new Date(),
  }),
  disconnectWebSocket: () => ({
    type: DISCONNECT_WEBSOCKET as typeof DISCONNECT_WEBSOCKET,
    date: new Date(),
  }),
  webSocketDisconnected: () => ({
    type: WEBSOCKET_DISCONNECTED as typeof WEBSOCKET_DISCONNECTED,
    date: new Date(),
  }),
  webSocketConnecting: () => ({
    type: WEBSOCKET_CONNECTING as typeof WEBSOCKET_CONNECTING,
    date: new Date(),
  }),
  webSocketConnected: () => ({
    type: WEBSOCKET_CONNECTED as typeof WEBSOCKET_CONNECTED,
    date: new Date(),
  }),
  webSocketDisconnecting: () => ({
    type: WEBSOCKET_DISCONNECTING as typeof WEBSOCKET_DISCONNECTING,
    date: new Date(),
  }),
  webSocketOffline: () => ({
    type: WEBSOCKET_OFFLINE as typeof WEBSOCKET_OFFLINE,
    date: new Date(),
  }),
  webSocketError: (errorMessage: string) => ({
    type: WEBSOCKET_ERROR as typeof WEBSOCKET_ERROR,
    date: new Date(),
    errorMessage,
  }),
};
