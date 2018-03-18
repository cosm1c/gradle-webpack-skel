import './main.less';
import store from './store';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Button, Nav, Navbar, NavItem} from 'react-bootstrap';
import stream, {clientStreams, StreamStatusConnected} from './stream';
import {webSocketSubject} from './stream/websocket/webSocketEpic';
import {ClientCountConnected} from './clientsCount';
import {JobInfoListConnected} from './joblist';
import {ErrorToasterConnected} from './errortoaster';
import {ChartStreams, exampleObserver} from './chartstreams';

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
            <NavItem eventKey={1}><StreamStatusConnected/></NavItem>
            <NavItem eventKey={2}><ClientCountConnected/></NavItem>

            <NavItem eventKey={3}><Button bsStyle='primary' bsSize='xsmall' onClick={() =>
              clientStreams.subscribe('sine', 'sine', exampleObserver)
            }>Start Stream</Button></NavItem>
            <NavItem eventKey={4}><Button bsStyle='primary' bsSize='xsmall' onClick={() =>
              webSocketSubject.next(JSON.stringify({sine: null}))
            }>Stop Stream</Button></NavItem>

          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <main className='main-container'>
        <ChartStreams/>
        <JobInfoListConnected/>
      </main>

      <ErrorToasterConnected className='footer'/>
    </div>
  </Provider>
);

function onStart() {
  stream.connect();
}

render(Root, document.getElementById('root'), onStart);
