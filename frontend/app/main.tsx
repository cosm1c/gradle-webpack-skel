import 'whatwg-fetch';
import 'babel-polyfill';
// import './main.less';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
// import * as Loadable from 'react-loadable';
import {AppNavBar} from './navbar/AppNavBar';
import {AlertToasterConnected} from './globalAlert/AlertToasterConnected';
import {AppTabsConnected} from './tabs/AppTabsConnected';
// import {AppTabsLoadingComponent} from './tabs/AppTabsLoadingComponent';
import {rootStore} from './store';

if (module.hot) {
  module.hot.accept(console.error);
}

/*
const LoadableTabs = Loadable({
  loader: () => import('./tabs/AppTabsLoadable'),
  loading: AppTabsLoadingComponent,
});
*/

const Root = (
  <Provider store={rootStore}>
    <div className='root-container'>

      <AppNavBar className='navbar-row'/>

      <main className='main-container'>
        <AppTabsConnected/>
      </main>

      <AlertToasterConnected className='footer'/>

    </div>
  </Provider>
);

render(Root, document.getElementById('root'));
