import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AddPeople from './views/people/AddPeople';
import PeopleApp from './views/people/PeopleApp';
import PeopleList from './views/people/PeopleList';
import PeopleEdit from './views/people/PeopleEdit';

import AddCompany from './views/company/AddCompany';
import EditCompany from './views/company/EditCompany';

import { Router, Route, hashHistory, IndexRoute  } from 'react-router';

ReactDOM.render((
   <Router history={hashHistory}>
      <Route name="Lightbook" path="/" component={App}>
         <IndexRoute component={PeopleApp} />
         <Route name="Add People" path="add-people" component={AddPeople} />
         <Route name="Add Company" path="add-company" component={AddCompany} />
         <Route name="Search" path="search" component={PeopleApp} />
         <Route name="List of People" path="company/:id" component={PeopleList} />
         <Route name="Edit Company" path="company/:id/edit" component={EditCompany} />
         <Route name="Edit People" path="people/:id/edit" component={PeopleEdit} />
      </Route>
   </Router>

), document.getElementById('page-content'));