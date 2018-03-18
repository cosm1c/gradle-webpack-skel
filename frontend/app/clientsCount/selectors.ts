import {IRootStateRecord} from '../store';
import {emptyMonoidStore} from '../monoidstore';

export const selectClientCount: (state: IRootStateRecord) => number =
  state => state.get('store', emptyMonoidStore).get('clientCount', 0);
