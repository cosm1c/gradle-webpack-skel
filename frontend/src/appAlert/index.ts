import store from '../reduxStore/store';
import {globalAlert} from './actions';

// Translates to bootstrap color
export enum AlertLevel {
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

export const fireGlobalAlert = (message: string, alertLevel: AlertLevel) => {
  store.dispatch(globalAlert(message, alertLevel));
};
