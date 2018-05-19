export const CONNECT_CONNECTION = 'CONNECT_CONNECTION';
export const DISCONNECT_CONNECTION = 'DISCONNECT_CONNECTION';
export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED';
export const CONNECTION_CONNECTING = 'CONNECTION_CONNECTING';
export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED';
export const CONNECTION_DISCONNECTING = 'CONNECTION_DISCONNECTING';
export const CONNECTION_OFFLINE = 'CONNECTION_OFFLINE';
export const CONNECTION_ERROR = 'CONNECTION_ERROR';

export interface ConnectionActions {
  CONNECT_CONNECTION: { type: typeof CONNECT_CONNECTION, date: Date };
  DISCONNECT_CONNECTION: { type: typeof DISCONNECT_CONNECTION, date: Date };
  CONNECTION_DISCONNECTED: { type: typeof CONNECTION_DISCONNECTED, date: Date };
  CONNECTION_CONNECTING: { type: typeof CONNECTION_CONNECTING, date: Date };
  CONNECTION_CONNECTED: { type: typeof CONNECTION_CONNECTED, date: Date };
  CONNECTION_DISCONNECTING: { type: typeof CONNECTION_DISCONNECTING, date: Date };
  CONNECTION_OFFLINE: { type: typeof CONNECTION_OFFLINE, date: Date };
  CONNECTION_ERROR: { type: typeof CONNECTION_ERROR, date: Date, errorMessage: string };
}

export type ConnectionAction = ConnectionActions[keyof ConnectionActions];

export const connectionActionCreators = {
  connectConnection: () => ({
    type: CONNECT_CONNECTION as typeof CONNECT_CONNECTION,
    date: new Date(),
  }),
  disconnectConnection: () => ({
    type: DISCONNECT_CONNECTION as typeof DISCONNECT_CONNECTION,
    date: new Date(),
  }),
  connectionDisconnected: () => ({
    type: CONNECTION_DISCONNECTED as typeof CONNECTION_DISCONNECTED,
    date: new Date(),
  }),
  connectionConnecting: () => ({
    type: CONNECTION_CONNECTING as typeof CONNECTION_CONNECTING,
    date: new Date(),
  }),
  connectionConnected: () => ({
    type: CONNECTION_CONNECTED as typeof CONNECTION_CONNECTED,
    date: new Date(),
  }),
  connectionDisconnecting: () => ({
    type: CONNECTION_DISCONNECTING as typeof CONNECTION_DISCONNECTING,
    date: new Date(),
  }),
  connectionOffline: () => ({
    type: CONNECTION_OFFLINE as typeof CONNECTION_OFFLINE,
    date: new Date(),
  }),
  connectionError: (errorMessage: string) => ({
    type: CONNECTION_ERROR as typeof CONNECTION_ERROR,
    date: new Date(),
    errorMessage,
  }),
};
