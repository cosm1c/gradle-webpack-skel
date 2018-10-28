import _Vue from 'vue';
import Exchange, {Exchange as ExchangeInstance} from '@/exchange/Exchange';

export function ExchangePlugin<ExchangePlugOptions>(Vue: typeof _Vue, options?: ExchangePluginOptions): void {
  Vue.prototype.$exchange = Exchange;
}

export class ExchangePluginOptions {
}

declare module 'vue/types/vue' {
  interface Vue {
    $exchange: ExchangeInstance;
  }
}
