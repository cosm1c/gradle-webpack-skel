import store from '../reduxStore/store';
import {MonoidStoreAction} from './redux-duck';

export const dispatchMonoidStoreAction = (monoidStoreAction: MonoidStoreAction) => {
  store.dispatch(monoidStoreAction);
};
