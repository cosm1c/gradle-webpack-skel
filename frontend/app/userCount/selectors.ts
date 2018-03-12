import {IRootStateRecord} from '../store';

const initialUserCount = new Map([['userCount', 0]]);

export const getUserCount: (state: IRootStateRecord) => number =
  state => state.get('monoidStore', initialUserCount).get('userCount');
