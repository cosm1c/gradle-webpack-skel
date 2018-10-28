import {ActionTree, Module, MutationTree} from 'vuex';
import {RootState} from '@/store';

export interface ConnectionState {
  isConnected: boolean;
  // TODO: could track stream stats here
}

export class RxSocketModule implements Module<ConnectionState, RootState> {

  public actions: ActionTree<ConnectionState, any> = {
    connected({commit}) {
      commit('connected');
    },
    disconnected({commit}) {
      commit('disconnected');
    },
    disconnecting({commit}) {
      commit('disconnecting');
    },
  };

  public namespaced: boolean = true;

  // public getters: GetterTree<ConnectionState, any> = {};

  public mutations: MutationTree<ConnectionState> = {
    connected(state) {
      state.isConnected = true;
    },
    disconnected(state) {
      state.isConnected = false;
    },
    disconnecting(state) {
      console.warn('disconnecting'); // TODO: is there a way to know this module's path?
      // debugger;
    },
  };

  public state: () => ConnectionState = () => ({
    isConnected: false,
  });
}
