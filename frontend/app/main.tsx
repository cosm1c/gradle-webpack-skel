import './main.less';
import {Observer} from 'rxjs/Observer';
import store from './store';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Button, Nav, Navbar, NavItem} from 'react-bootstrap';
import {ErrorToasterConnected} from './globalError';
import {ClientStreams, WebSocketStreamStatusConnected} from './stream';
import {monoidStoreObserver} from './monoidstore';
import {ClientCountConnected} from './clientsCount';
import {WidgetListConnected} from './widgets/widgetlist';
import {chartStreamActionCreators} from './widgets/chartstream';

// Used by DefinePlugin
declare const IS_PROD: string;


export function calcWsUrl(): string {
  if (!IS_PROD) {
    const wsUrl = 'ws://localhost:8080/ws';
    const msg = `[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED - WebSocket URL:`;
    // '='.repeat(msg.length + wsUrl.length + 1) +
    console.warn(`======================================\n${msg}`, wsUrl);
    return wsUrl;
  }

  if (window.location.protocol !== 'https:') {
    console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
  }

  return window.location.protocol === 'https:' ? `wss://${window.location.host}:8080/ws` : `ws://${window.location.host}/ws`;
}

// TODO: MonoidStore should receive MONOID_CLEAR every WebSocket reconnect
export const clientStreams =
  new ClientStreams(
    calcWsUrl(),
    new Map<string, Observer<any>>([
      ['store', monoidStoreObserver]
    ]), store);

function rootReactCallback() {
  clientStreams.connect();
}

const Root = (
  <Provider store={store}>
    <div className='root-container'>

      <Navbar className='navbar-row'>
        <Navbar.Header>
          <Navbar.Brand>Gradle Webpack Skeleton</Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight={true}>
            <NavItem eventKey={1}><WebSocketStreamStatusConnected/></NavItem>
            <NavItem eventKey={2}><ClientCountConnected/></NavItem>
            <NavItem eventKey={3}>
              <Button bsStyle='primary' bsSize='xsmall'
                      onClick={() => store.dispatch(chartStreamActionCreators.addChartStream())}>Add Chart</Button>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <main className='main-container'>
        <WidgetListConnected/>
      </main>

      <ErrorToasterConnected className='footer'/>
    </div>
  </Provider>
);

render(Root, document.getElementById('root'), rootReactCallback);
