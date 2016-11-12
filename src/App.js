import React, { Component } from 'react';
import './assets/css/styles.css';

import CompanyApp from './CompanyApp';
import defCompanies from './response/search.json';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CompanyApp companies={defCompanies.output} />
      </div>
    );
  }
}

export default App;
