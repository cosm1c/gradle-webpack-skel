import 'babel-polyfill';
// import './main.less';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {AppNavBar} from './navbar/AppNavBar';
import {AlertToasterConnected} from './globalAlert/AlertToasterConnected';
import {AppTabsConnected} from './tabs/AppTabsConnected';
import {rootStore} from './store';

/*
import * as Loadable from 'react-loadable';
import {AppTabsLoadingComponent} from './tabs/AppTabsLoadingComponent';
const LoadableTabs = Loadable({
  loader: () => import('./tabs/AppTabsLoadable'),
  loading: AppTabsLoadingComponent
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
