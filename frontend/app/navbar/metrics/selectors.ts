import {IRootStateRecord} from '../../store';
import {emptyMonoidStore} from '../../monoidstore/reducer';

export const selectClientCount: (state: IRootStateRecord) => number =
  (state) => state.get('store', emptyMonoidStore).get('webSocketCount', 0);
