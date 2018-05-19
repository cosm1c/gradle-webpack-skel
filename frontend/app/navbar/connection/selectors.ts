import {IRootStateRecord} from '../../store';
import {ConnectionStateEnum, initialConnectionState} from './ConnectionStateRecord';

export const selectConnectionState: (state: IRootStateRecord) => (ConnectionStateEnum) =
  (state) => state.get('connectionState', initialConnectionState).get('connection');

export const selectConnectionErrorMessage: (state: IRootStateRecord) => string =
  (state) => state.get('connectionState', initialConnectionState).get('errorMessage');
