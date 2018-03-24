import {Observer} from 'rxjs/Observer';
import store from '../store';
import {globalErrorActionCreators} from '../globalError';
import {jsonToMonoidActions} from './protocol';

export * from './actions';
export * from './protocol';
export * from './reducer';

export const monoidStoreObserver: Observer<any> = {

  next(value: any) {
    store.dispatch(jsonToMonoidActions(value));
  },

  error(err: any) {
    store.dispatch(
      globalErrorActionCreators.globalError(new Error(`MonoidStoreError err=${JSON.stringify(err)}`)));
  },

  complete() {
    // TODO: resubscribe for websocket reconnect (need to implement the queue in ClientStreams first)
    console.warn('MonoidStoreComplete');
  }
};
