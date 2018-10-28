import Vue from 'vue';
import Vuex from 'vuex';
import {ExchangeState, initialExchangeState} from '@/exchange/ExchangeModule';

Vue.use(Vuex);

export interface RootState {
  exchange: ExchangeState;
  errors: string[];
}

// TODO: simplify by using helpers
export default new Vuex.Store<RootState>({

  strict: process.env.NODE_ENV !== 'production',

  actions: {
    globalAlert({commit}, error: string) {
      commit('globalAlert', error);
    },
    dismissGlobalAlert({commit}) {
      commit('dismissGlobalAlert');
    },
  },

  state: {
    exchange: initialExchangeState,
    errors: [],
  },

  mutations: {
    globalAlert(state, error: string) {
      state.errors.push(error);
    },
    dismissGlobalAlert(state) {
      state.errors.pop();
    },
  },

});

/*
if (module.hot) {
  // accept actions and mutations as hot modules
  module.hot.accept(['./mutations', './modules/a'], () => {
    // require the updated modules
    // have to add .default here due to babel 6 module output
    const newMutations = require('./mutations').default
    const newModuleA = require('./modules/a').default
    // swap in the new modules and mutations
    store.hotUpdate({
      mutations: newMutations,
      modules: {
        a: newModuleA
      }
    })
  })
}
*/
