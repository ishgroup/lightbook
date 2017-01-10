import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import LightbookApp from './LightbookApp';
import AddPeople from './views/people/AddPeople';
import ListPeople from './views/people/ListPeople';
import ListInactivePeople from './views/people/ListInactivePeople';
import EditPeople from './views/people/EditPeople';
import AddCompany from './views/company/AddCompany';
import EditCompany from './views/company/EditCompany';

import { Router, Route, hashHistory, IndexRoute  } from 'react-router';

ReactDOM.render((
   <Router history={hashHistory}>
      <Route name="Lightbook" path="/" component={App}>
         <IndexRoute component={LightbookApp} />
         <Route name="Add People" path="add-people" component={AddPeople} />
         <Route name="Add Company" path="add-company" component={AddCompany} />
         <Route name="Search" path="search" component={LightbookApp} />
         <Route name="List of People" path="company/:id" component={ListPeople} />
         <Route name="Edit Company" path="company/:id/edit" component={EditCompany} />
         <Route name="List of People" path="company/:id/:status" component={ListInactivePeople} />
         <Route name="Edit People" path="people/:id/edit" component={EditPeople} />
      </Route>
   </Router>

), document.getElementById('page-content'));