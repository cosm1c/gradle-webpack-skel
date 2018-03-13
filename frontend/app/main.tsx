import './main.less';
import store from './store';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import stream, {StreamStatusConnected} from './stream';
import {UserCountConnected} from './userCount';

const Root = (
  <Provider store={store}>
    <div className='root-container'>

      <Navbar className='navbar-row' defaultExpanded={true}>
        <Navbar.Header>
          <Navbar.Brand>Gradle Webpack Skeleton</Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight={true}>
            <NavItem eventKey={1}><StreamStatusConnected/></NavItem>
            <NavItem eventKey={2}><UserCountConnected/></NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <main className='main-container'>Main content goes here.</main>

    </div>
  </Provider>
);

function onStart() {
  stream.connect();
}

render(Root, document.getElementById('root'), onStart);
