import * as Loadable from 'react-loadable';
import {AppMainLoading} from './AppMainLoading';

if (module.hot) {
  module.hot.accept(console.error);
  module.hot.status(console.debug);
}

const LoadableAppMain = Loadable({
  loader: () => import('./AppMain'),
  loading: AppMainLoading,
});

export default LoadableAppMain;
