import React, { Component } from 'react';
import './assets/css/styles.css';
import PeopleApp from './PeopleApp';

class App extends Component {
  render() {

    return (
      <div className="App clearfix">
        <PeopleApp />
      </div>
    );
  }
}

export default App;
