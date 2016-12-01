import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AddPeople from './AddPeople';
import PeopleApp from './PeopleApp';
import PeopleList from './PeopleList';
import PeopleEdit from './PeopleEdit';

import AddCompany from './views/company/AddCompany';
import EditCompany from './views/company/EditCompany';

import { Router, Route, hashHistory, IndexRoute  } from 'react-router';

ReactDOM.render((
   <Router history={hashHistory}>
      <Route path="/" component={App}>
         <IndexRoute component={PeopleApp} />
         <Route name="add-people" path="add-people" component={AddPeople} />
         <Route name="add-company" path="add-company" component={AddCompany} />
         <Route name="search" path="search" component={PeopleApp} />
         <Route name="company" path="company/:id" component={PeopleList} />
         <Route name="edit-company" path="company/:id/edit" component={EditCompany} />
         <Route name="edit-people" path="people/:id/edit" component={PeopleEdit} />
      </Route>
   </Router>

), document.getElementById('page-content'));