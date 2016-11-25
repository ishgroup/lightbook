import React, { Component } from 'react';
import { Link } from 'react-router';

import './assets/css/styles.css';

import Icon from 'react-fa';
import Container from './components/Container';
import ishLogo from './assets/img/ish-logo.png';

class App extends Component {
  render() {
    var _active_add_form = 'add-link';
    var _active_search_form = 'search-link';

    return (
      <div className="App clearfix">
        <Container>
          <header id="header" className="row">
            <nav className="navbar navbar-dark bg-inverse">
              <div className="nav navbar-nav">
                <Link to="/" className="navbar-brand"><img src={ishLogo} alt="ish" /></Link>
                <div className="float-xs-right">
                  <li className="nav-item">
                    <Link to="add-people" className="nav-link" activeClassName="active">
                      <Icon name="user-plus" />
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/search" className="nav-link" activeClassName="active"><Icon name="search" /></Link>
                  </li>
                </div>
              </div>
            </nav>
          </header>
          {this.props.children}
        </Container>
      </div>
    );
  }
}

export default App;
