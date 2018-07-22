import './main.scss';
import 'whatwg-fetch';
import 'babel-polyfill';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './reduxStore/store';
import {AlertToasterConnected} from './appAlert/AlertToasterConnected';
import clientStreams from './clientStreams/ClientStreams';
import {AppNavBarConnected} from './appNavBar/AppNavBarConnected';
import LoadableAppMain from './appMain/AppMainLoadable';
import {AlertLevel, fireGlobalAlert} from './appAlert';

if (module.hot) {
  module.hot.accept(console.error);
  module.hot.status(console.debug);
}

const Root = (
  <Provider store={store}>
    <div className='root-container'>

      <AppNavBarConnected className='navbar-row'/>

      <main className='main-container'>
        <LoadableAppMain/>
      </main>

      <AlertToasterConnected className='footer'/>

    </div>
  </Provider>
);

render(Root, document.getElementById('root'));

interface ConnectionInfo {
  [name: string]: string;
}

function fetchWsUrls(): Promise<ConnectionInfo> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED`);
    return Promise.resolve({
      dev: 'ws://localhost:8080/ws',
      // uncomment to simulate multiple connections (NOTE: mergeStreams will receive duplicate messages)
      // dev2: 'ws://localhost:8080/ws',
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
  .then((wsUrls) => {
    for (const name in wsUrls) {
      if (wsUrls.hasOwnProperty(name)) {
        clientStreams.connectWebSocket(name, wsUrls[name]);
      }
    }
  })
  .catch((reason) =>
    fireGlobalAlert(JSON.stringify(reason), AlertLevel.DANGER));
