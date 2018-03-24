export const GLOBAL_ERROR = 'GLOBAL_ERROR';
export const ACK_GLOBAL_ERROR = 'ACK_GLOBAL_ERROR';

export type GlobalErrorActions = {
  GLOBAL_ERROR: { type: typeof GLOBAL_ERROR, date: Date, error: Error },
  ACK_GLOBAL_ERROR: { type: typeof ACK_GLOBAL_ERROR, date: Date },
};

export type GlobalErrorAction = GlobalErrorActions[keyof GlobalErrorActions];

export const globalErrorActionCreators = {
  globalError: (error: Error) => ({
    type: GLOBAL_ERROR as typeof GLOBAL_ERROR,
    date: new Date(),
    error,
  }),
  ackGlobalError: () => ({
    type: ACK_GLOBAL_ERROR as typeof ACK_GLOBAL_ERROR,
    date: new Date(),
  }),
};
