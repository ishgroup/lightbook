import React, { Component } from 'react';
import { Link } from 'react-router';
import logo from './assets/img/logo.svg';
import './assets/css/styles.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <nav className="navbar navbar-light bg-faded">
            <ul className="nav navbar-nav">
              <li className="nav-item nav-link"><Link to='/'>Home</Link></li>
              <li className="nav-item nav-link"><Link to='/about'>About</Link></li>
              <li className="nav-item nav-link"><Link to='/contact'>Contact</Link></li>
            </ul>
          </nav>

          {this.props.children}
        </div>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
