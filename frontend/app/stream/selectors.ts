import {IRootStateRecord} from '../store';
import {StreamStateEnum} from './StreamStateRecord';

export const getStreamState: (state: IRootStateRecord) => (StreamStateEnum) =
  state => state.get('streamState').get('connection');
