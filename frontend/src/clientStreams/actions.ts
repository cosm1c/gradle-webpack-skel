import {action} from 'typesafe-actions';

export const CONNECT_CONNECTION = 'CONNECT_CONNECTION';
export const DISCONNECT_CONNECTION = 'DISCONNECT_CONNECTION';
export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED';
export const CONNECTION_CONNECTING = 'CONNECTION_CONNECTING';
export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED';
export const CONNECTION_DISCONNECTING = 'CONNECTION_DISCONNECTING';
export const CONNECTION_OFFLINE = 'CONNECTION_OFFLINE';
export const CONNECTION_ERROR = 'CONNECTION_ERROR';

export const connectConnection = (id: string) =>
  action(
    CONNECT_CONNECTION,
    {
      id,
      date: new Date(),
    }
  );

export const disconnectConnection = (id: string) =>
  action(
    DISCONNECT_CONNECTION,
    {
      id,
      date: new Date(),
    }
  );

export const connectionDisconnected = (id: string, errorMessage?: string) =>
  action(
    CONNECTION_DISCONNECTED,
    {
      id,
      date: new Date(),
      errorMessage,
    }
  );

export const connectionConnecting = (id: string) =>
  action(
    CONNECTION_CONNECTING,
    {
      id,
      date: new Date(),
    }
  );

export const connectionConnected = (id: string) =>
  action(
    CONNECTION_CONNECTED,
    {
      id,
      date: new Date(),
    }
  );

export const connectionDisconnecting = (id: string) =>
  action(
    CONNECTION_DISCONNECTING,
    {
      id,
      date: new Date(),
    }
  );

export const connectionOffline = (id: string, errorMessage?: string) =>
  action(
    CONNECTION_OFFLINE,
    {
      id,
      date: new Date(),
      errorMessage,
    }
  );
