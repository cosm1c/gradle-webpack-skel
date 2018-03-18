import store from '../store';
import {streamActionCreators} from './';

export * from './StreamStateRecord';
export * from './actions';
export * from './reducer';
export * from './selectors';
export * from './StreamStatus';
export * from './StreamStatusConnected';
export * from './ClientStreams';

const stream = {
  connect(): void {
    store.dispatch(streamActionCreators.connectStream());
  },

  disconnect(): void {
    store.dispatch(streamActionCreators.disconnectStream());
  }
};

export default stream;
