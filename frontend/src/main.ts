import 'normalize.css/normalize.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import {ExchangePlugin} from '@/exchange/ExchangePlugin';
import {ConnectionsConfig, ExchangeModule} from '@/exchange/ExchangeModule';

Vue.config.productionTip = false;

// provide vm.$exchange to Components to avoid import/dependency of exchange
Vue.use(ExchangePlugin);

const vm = new Vue({
  router,
  store,
  render: (h) => h(App),
  mounted() {
    this.$store.registerModule(ExchangeModule.EXCHANGE, new ExchangeModule());
  },
}).$mount('#app');

export function globalAlert(err: any) {
  vm.$store.dispatch('globalAlert', JSON.stringify(err));
}

function fetchWsUrls(): Promise<ConnectionsConfig> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED`);
    return Promise.resolve({
      dev: 'ws://localhost:8080/ws',
      // uncomment to simulate multiple connections
      dev2: 'ws://localhost:8081/ws',
    });
  }

  if (window.location.protocol !== 'https:') {
    console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
  }

  const fetchWsUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/wsUrls`;
  return new Promise((resolve, reject) => {
    try {
      console.debug('Fetching WebSocket URLs from', fetchWsUrl);
      fetch(fetchWsUrl)
        .then((response) => {
          response.json()
            .then((wsUrls) => {
              console.debug('Using wsUrls:', wsUrls);
              resolve(wsUrls);
            })
            .catch(reject);
        })
        .catch(reject);

    } catch (e) {
      const err = `Failed to fetch wsUrls from ${fetchWsUrl} - error: ${e}`;
      console.error(err, e);
      reject(err);
    }
  });
}

fetchWsUrls()
  .then((wsUrls) => store.dispatch(`${ExchangeModule.EXCHANGE}/connect`, wsUrls))
  .catch(globalAlert);
