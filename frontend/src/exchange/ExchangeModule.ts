import {ActionTree, GetterTree, Module, MutationTree} from 'vuex';
import exchange from '@/exchange/Exchange';
import store, {RootState} from '@/store';
import {RxSocketModule} from './RxSocketModule';

export interface ConnectionsConfig {
  [name: string]: string; // connection name => WebSocket URL
}

export interface ExchangeState {
  names: string[];
}

export const initialExchangeState: ExchangeState = {
  names: [],
};

export class ExchangeModule implements Module<ExchangeState, RootState> {

  public static readonly EXCHANGE = 'exchange';

  public actions: ActionTree<ExchangeState, any> = {
    connect({dispatch, state, commit}, payload: ConnectionsConfig) {

      for (const name in payload) {
        if (payload.hasOwnProperty(name) && state.names.indexOf(name) >= 0) {
          throw new Error(`"${name}" already registered`);
        }
      }

      for (const name in payload) {
        if (payload.hasOwnProperty(name)) {
          store.registerModule([ExchangeModule.EXCHANGE, name], new RxSocketModule());
          commit('connected', name);

          exchange.connect(
            name,
            payload[name],
            true,
            {next: (event) => dispatch(`${name}/connected`)},
            {next: (closeEvent) => dispatch(`${name}/disconnected`)},
            {next: () => dispatch(`${name}/disconnecting`)}
          );
        }
      }
    },
    // TODO: disconnect action which unregisters module
  };

  public namespaced: boolean = true;

  public getters: GetterTree<ExchangeState, any> = {
    // listConnections: (state) => state.names,
  };

  public mutations: MutationTree<ExchangeState> = {
    connected(state, name: string) {
      state.names.push(name);
      state.names.sort();
    },
  };

  public state: () => ExchangeState = () => ({
    names: [],
  });

}
