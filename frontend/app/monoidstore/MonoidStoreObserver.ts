import {Observer} from 'rxjs/Observer';
import {GlobalAlertAction, globalAlertActionCreators} from '../globalAlert/actions';
import {jsonToMonoidActions} from './protocol';
import {MonoidStoreAction} from './actions';

export class MonoidStoreObserver implements Observer<any> {

  constructor(private readonly dispatchGlobalAlertAction: (globalAlertAction: GlobalAlertAction) => any,
              private readonly dispatchMonoidStoreAction: (monoidStoreAction: MonoidStoreAction) => any) {
  }

  next(value: any) {
    this.dispatchMonoidStoreAction(jsonToMonoidActions(value));
  }

  error(err: any) {
    this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`MonoidStoreError err=${JSON.stringify(err)}`, 'danger'));
  }

  complete() {
    // TODO: handle reconnect
    console.warn('MonoidStoreComplete');
  }

}
