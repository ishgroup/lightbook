import React, { Component } from 'react';
import { Link } from 'react-router';

import './assets/css/styles.css';

import Icon from 'react-fa';
import Container from './components/Container';
import IshLogo from './assets/img/ish-logo.png';

class App extends Component {

  render() {

    let pageTitle = 'Lightbook';
    let routes = this.props.routes;

    if(routes.length >= 2) {
      let pagePart = routes[routes.length - 1];
      if(pagePart.name !== undefined) {
        document.title = pagePart.name +' - ' + pageTitle;
      } else {
        document.title = pageTitle;
      }
    }

    return (
      <div className="App clearfix">
        <Container>
          <header id="header" className="row">
            <nav className="navbar navbar-dark bg-inverse">
              <div className="nav navbar-nav">
                <Link to="/" className="navbar-brand"><img src={IshLogo} alt="ish" />ish customer directory</Link>
                <div className="float-xs-right">
                  <li className="nav-item">
                    <Link to="add-people" className="nav-link" activeClassName="active">
                      <Icon name="user-plus" />
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="add-company" className="nav-link" activeClassName="active">
                      <Icon name="building-o" />
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="search" className="nav-link" activeClassName="active"><Icon name="search" /></Link>
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
