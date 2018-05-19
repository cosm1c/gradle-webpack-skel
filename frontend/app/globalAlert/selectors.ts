import {IGlobalAlertStateRecord, initialGlobalAlertState} from './GlobalAlertStateRecord';
import {IRootStateRecord} from '../store';

export const selectGlobalAlert: (state: IRootStateRecord) => (IGlobalAlertStateRecord) =
  state => state.get('globalAlert', initialGlobalAlertState) as IGlobalAlertStateRecord;
