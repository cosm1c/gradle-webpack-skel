export const GLOBAL_ALERT = 'GLOBAL_ALERT';
export const ACK_GLOBAL_ALERT = 'ACK_GLOBAL_ALERT';

export type GlobalAlertActions = {
  // TODO: color should restrict possible values
  GLOBAL_ALERT: { type: typeof GLOBAL_ALERT, date: Date, message: string, color: string },
  ACK_GLOBAL_ALERT: { type: typeof ACK_GLOBAL_ALERT, date: Date },
};

export type GlobalAlertAction = GlobalAlertActions[keyof GlobalAlertActions];

export const globalAlertActionCreators = {
  globalAlert: (message: string, color: string) => ({
    type: GLOBAL_ALERT as typeof GLOBAL_ALERT,
    date: new Date(),
    message,
    color,
  }),
  ackGlobalAlert: () => ({
    type: ACK_GLOBAL_ALERT as typeof ACK_GLOBAL_ALERT,
    date: new Date(),
  }),
};
