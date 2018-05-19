import {Observer} from 'rxjs/Observer';
import {GlobalAlertAction, globalAlertActionCreators} from '../globalAlert/actions';
import {jsonToMonoidActions} from './protocol';
import {MonoidStoreAction} from './actions';

export class MonoidStoreObserver implements Observer<any> {

  constructor(private readonly dispatchGlobalAlertAction: (globalAlertAction: GlobalAlertAction) => any,
              private readonly dispatchMonoidStoreAction: (monoidStoreAction: MonoidStoreAction) => any) {
  }

  public next(value: any) {
    this.dispatchMonoidStoreAction(jsonToMonoidActions(value));
  }

  public error(err: any) {
    this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`MonoidStoreError err=${JSON.stringify(err)}`, 'danger'));
  }

  public complete() {
    // TODO: handle reconnect
    console.warn('MonoidStoreComplete');
  }

}
