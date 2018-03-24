import {IGlobalErrorStateRecord} from './GlobalErrorStateRecord';
import {IRootStateRecord} from '../store';

export const selectGlobalErrorMessage: (state: IRootStateRecord) => (IGlobalErrorStateRecord) =
  state => state.get('globalError') as IGlobalErrorStateRecord;
