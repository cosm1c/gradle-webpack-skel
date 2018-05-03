import {Observer} from 'rxjs/Observer';
import {Store} from 'redux';
import {IRootStateRecord} from '../store';
import {globalErrorActionCreators} from '../globalError';
import {jsonToMonoidActions} from './protocol';

export * from './actions';
export * from './protocol';
export * from './reducer';

export class MonoidStoreObserver implements Observer<any> {

  constructor(private readonly store: Store<IRootStateRecord>) {
  }

  next(value: any) {
    this.store.dispatch(jsonToMonoidActions(value));
  }

  error(err: any) {
    this.store.dispatch(
      globalErrorActionCreators.globalError(new Error(`MonoidStoreError err=${JSON.stringify(err)}`)));
  }

  complete() {
    // TODO: resubscribe for websocket reconnect
    console.warn('MonoidStoreComplete');
  }
}
