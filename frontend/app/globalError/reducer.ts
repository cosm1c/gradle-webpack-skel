import {AnyAction, Reducer} from 'redux';
import {ACK_GLOBAL_ERROR, GLOBAL_ERROR} from './actions';
import {IGlobalErrorStateRecord, initialGlobalErrorState} from './GlobalErrorStateRecord';

export const globalErrorReducer: Reducer<IGlobalErrorStateRecord> =
  (state: IGlobalErrorStateRecord = initialGlobalErrorState, action: AnyAction): IGlobalErrorStateRecord => {
    switch (action.type) {
      case GLOBAL_ERROR:
        console.error('GlobalError date=', action.date, 'Error=', action.error);
        // TODO: don't just drop/overwrite error messages, collect in bounded storage
        return state
          .set('date', action.date)
          .set('error', action.error);

      case ACK_GLOBAL_ERROR:
        return state.set('lastAckDate', action.date);

      default:
        return state;
    }
  };
