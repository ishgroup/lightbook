import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import NewRow from './NewRow';
import PeopleApp from './PeopleApp';
import PeopleList from './PeopleList';

import { Router, Route, hashHistory, IndexRoute  } from 'react-router';

ReactDOM.render((
   <Router history={hashHistory}>
      <Route path="/" component={App}>
         <IndexRoute component={PeopleApp} />
         <Route name="add-people" path="add-people" component={NewRow} />
         <Route name="search" path="search" component={PeopleApp} />
         <Route name="company" path="company/:id" component={PeopleList} />
      </Route>
   </Router>

), document.getElementById('page-content'));