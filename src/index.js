import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';

ReactDOM.render((
   <HashRouter>
      <Route name="Lightbook" path="/" component={App} />
   </HashRouter>

), document.getElementById('page-content'));
