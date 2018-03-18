export const CONNECT_STREAM = 'CONNECT_STREAM';
export const DISCONNECT_STREAM = 'DISCONNECT_STREAM';
export const STREAM_CONNECTED = 'STREAM_CONNECTED';
export const STREAM_DISCONNECTED = 'STREAM_DISCONNECTED';
export const STREAM_ERROR = 'STREAM_ERROR';

export type StreamActions = {
  CONNECT_STREAM: { type: typeof CONNECT_STREAM, date: Date },
  DISCONNECT_STREAM: { type: typeof DISCONNECT_STREAM, date: Date },
  STREAM_CONNECTED: { type: typeof STREAM_CONNECTED, date: Date },
  STREAM_DISCONNECTED: { type: typeof STREAM_DISCONNECTED, date: Date },
  STREAM_ERROR: { type: typeof STREAM_ERROR, date: Date, errorMessage: string },
};

export type StreamAction = StreamActions[keyof StreamActions];

export const streamActionCreators = {
  connectStream: () => ({
    type: CONNECT_STREAM as typeof CONNECT_STREAM,
    date: new Date(),
  }),
  disconnectStream: () => ({
    type: DISCONNECT_STREAM as typeof DISCONNECT_STREAM,
    date: new Date(),
  }),
  streamConnected: () => ({
    type: STREAM_CONNECTED as typeof STREAM_CONNECTED,
    date: new Date(),
  }),
  streamDisconnected: () => ({
    type: STREAM_DISCONNECTED as typeof STREAM_DISCONNECTED,
    date: new Date(),
  }),
  streamError: (errorMessage: string) => ({
    type: STREAM_ERROR as typeof STREAM_ERROR,
    date: new Date(),
    errorMessage,
  }),
};
