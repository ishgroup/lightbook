import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { NavLink } from 'react-router-dom';

import './assets/css/styles.css';

import Icon from 'react-fa';
import Container from './components/Container';
import IshLogo from './assets/img/ish-logo.png';

import LightbookApp from './LightbookApp';
import AddPeople from './views/people/AddPeople';
import ListPeople from './views/people/ListPeople';
import ListInactivePeople from './views/people/ListInactivePeople';
import EditPeople from './views/people/EditPeople';
import AddCompany from './views/company/AddCompany';
import EditCompany from './views/company/EditCompany';

class App extends Component {
  render() {

    let pageTitle = 'Lightbook';
    const pathName = this.props.location.pathname.replace('/', "");

    if(pathName.length > 0) {
      const pathPart = pathName.split('-');
      if(pathPart.length > 0) {
        pageTitle = pathPart.map(function(s) {
          return s[0].toUpperCase() + s.slice(1);
        }).join(" ") + " - " + pageTitle;
      } else {
        pageTitle = pathPart + " - " + pageTitle;
      }
    }

    document.title = pageTitle;

    return (
      <div className="App clearfix">
        <Container>
          <header id="header" className="row">
            <nav className="navbar navbar-dark bg-inverse">
              <div className="nav navbar-nav">
                <NavLink to="/" className="navbar-brand" activeClassName="active"><img src={IshLogo} alt="ish" />ish customer directory</NavLink>
                <div className="float-xs-right">
                  <li className="nav-item">
                    <NavLink to="/add-people" className="nav-link" activeClassName="active">
                      <Icon name="user-plus" />
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/add-company" className="nav-link" activeClassName="active">
                      <Icon name="building-o" />
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/search" className="nav-link" activeClassName="active"><Icon name="search" /></NavLink>
                  </li>
                </div>
              </div>
            </nav>
          </header>

          <Switch>
            <Route exact path="/" name="Lightbook" component={LightbookApp} />
             <Route name="Search" path="/search" component={LightbookApp} />
             <Route name="Add People" path="/add-people" component={AddPeople} />
             <Route name="Add Company" path="/add-company" component={AddCompany} />
             <Route name="Edit Company" path="/company/:id/edit" component={EditCompany} />
             <Route name="List of People" path="/company/:id/:status" component={ListInactivePeople} />
             <Route name="List of People" path="/company/:id" component={ListPeople} />
             <Route name="Edit People" path="/people/:id/edit" component={EditPeople} />
          </Switch>

        </Container>
      </div>
    );
  }
}

export default App;
