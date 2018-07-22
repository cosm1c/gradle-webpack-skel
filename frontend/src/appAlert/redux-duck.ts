import {ActionType} from 'typesafe-actions';
import {Reducer} from 'redux';
import reducerRegistry from '../reduxStore/reducerRegistry';
import {IGlobalAlertStateRecord, initialGlobalAlertState} from './GlobalAlertStateRecord';
import * as globalAlertAction from './actions';
import {ACK_GLOBAL_ALERT, GLOBAL_ALERT} from './actions';
import {AppRootState} from '../reduxStore/store';

const reducerName = 'globalAlert';

// TODO: handle multiple alerts in UI
// TODO: allow alerts to self-update (eg: downgrade red to amber when reconnected)

export type GlobalAlertAction = ActionType<typeof globalAlertAction>;

const reducer: Reducer<IGlobalAlertStateRecord> =
  (prevState = initialGlobalAlertState, newAction) => {
    switch (newAction.type) {
      case GLOBAL_ALERT:
        console.warn('GlobalAlert date=', newAction.payload.date, 'message=', newAction.payload.message, 'color=', newAction.payload.color);
        return prevState
          .set('date', newAction.payload.date)
          .set('message', newAction.payload.message)
          .set('color', newAction.payload.color);

      case ACK_GLOBAL_ALERT:
        return prevState.set('lastAckDate', newAction.payload.date);

      default:
        return prevState;
    }
  };

reducerRegistry.register(reducerName, reducer);

export default reducer;

export const selectGlobalAlert = (state: AppRootState) => state.get(reducerName, initialGlobalAlertState);
