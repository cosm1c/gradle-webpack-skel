import {action} from 'typesafe-actions';

export const GLOBAL_ALERT = 'GLOBAL_ALERT';
export const ACK_GLOBAL_ALERT = 'ACK_GLOBAL_ALERT';

export const globalAlert = (message: string, color: string) =>
  action(
    GLOBAL_ALERT,
    {
      date: new Date(),
      message,
      color,
    }
  );

export const ackGlobalAlert = () =>
  action(
    ACK_GLOBAL_ALERT,
    {
      date: new Date(),
    }
  );
