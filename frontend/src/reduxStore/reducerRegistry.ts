import {Reducer, ReducersMapObject} from 'redux';

// noinspection TsLint
const noop: ReducerRegistryListener = (_ignore: ReducersMapObject) => {
};

export type ReducerRegistryListener = (registryMap: ReducersMapObject) => void;

export class ReducerRegistry {

  private reducers: ReducersMapObject = {};

  private emitChange: ReducerRegistryListener = noop;

  public getReducers() {
    return {...this.reducers};
  }

  public register(name: string, reducer: Reducer) {
    this.reducers = {...this.reducers, [name]: reducer};
    if (this.emitChange) {
      this.emitChange(this.getReducers());
    }
  }

  public setChangeListener(listener: ReducerRegistryListener) {
    this.emitChange = listener;
  }
}

const reducerRegistry = new ReducerRegistry();

export default reducerRegistry;
