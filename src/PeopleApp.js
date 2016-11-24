import React, { Component } from 'react';
import PeopleList from './PeopleList';
import NewRow from './NewRow';
import SearchBox from './SearchBox';
import axios from 'axios';
import Config from './config';
import Icon from 'react-fa';
import Container from './components/Container';
import ishLogo from './assets/img/ish-logo.png'

class PeopleApp extends Component {
  constructor(props) {
     super(props);
     var that = this;

     this.state = {
        peoplelist: [],
        filterString: '',
        filteredData: [],
        showAddForm: false,
        showAddressBook: false,
        showSearchForm: true,
     }

     Container.setPageName('search');

     axios.get('/peoples', { baseURL: Config.baseUrl() })
      .then(function(response){
        that.setState({
          peoplelist: response.data.output
        });
      });

     this.onRowSubmit = this.handleNewRowSubmit.bind(this);
     this.onPeopleRemove = this.handlePeopleRemove.bind(this);
     this.onPeopleEdits = this.handlePeopleEdit.bind(this);
  }

  handleNewRowSubmit(newPeople) {
    this.block.setState({ peoplelist: this.block.state.peoplelist.concat([newPeople]) });
  }

  handlePeopleRemove(people) {
    if(!confirm('Are you sure you want to delete this people?'))
      return false;

    var index = -1;
    var clength = this.block.state.peoplelist.length;
    for (var i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].name === people.name) {
      index = i;
      break;
      }
    }
    this.block.state.peoplelist.splice(index, 1);
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  handlePeopleEdit(people) {
    var clength = this.block.state.peoplelist.length;
    for (var i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].id === people.id) {
        this.block.state.peoplelist[i] = people;
        break;
      }
    }
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  doSearch(filterString) {
    var filteredData = [];
    var _queryText = filterString.toLowerCase();

    this.block.state.peoplelist.forEach(function(people) {
      if(people.name.toLowerCase().indexOf(_queryText) !== -1
        || people.username.toLowerCase().indexOf(_queryText) !== -1
        || people.company.toLowerCase().indexOf(_queryText) !== -1
        || people.company_role.toLowerCase().indexOf(_queryText) !== -1
        || people.phone.toLowerCase().indexOf(_queryText) !== -1
        || people.notes.toLowerCase().indexOf(_queryText) !== -1
        || people.mobile.toLowerCase().indexOf(_queryText) !== -1
      ) {
        filteredData.push(people);
      }
    });

    this.block.setState({
      filterString: filterString,
      filteredData: filteredData
    })
  }

  showAddForm() {
    this.setState({
      showAddForm: true,
      filterString: '',
    });

    Container.setPageName('add-form');

    this.closeAddressBook();
    this.closeSearchForm();
  }

  closeAddForm() {
    this.setState({
      showAddForm: false,
      showSearchForm: true,
    });
  }

  showAddressBook() {
    this.setState({
      showAddressBook: true,
      filterString: '',
    });

    Container.setPageName('address-book');

    this.closeAddForm();
    this.closeSearchForm();
    return false;
  }

  closeAddressBook() {
    this.setState({
      showAddressBook: false,
      filterString: ''
    });
  }

  showSearchForm() {
    this.setState({
      showSearchForm: true,
    });

    Container.setPageName('search');

    this.closeAddForm();
    this.closeAddressBook();
  }

  closeSearchForm() {
    this.setState({
      showSearchForm: false
    });
  }

  close() {
    this.setState({ showModal: false });
  }

  render() {
    var _clist = [];
    if(this.state.filterString.length > 0) {
      _clist = this.state.filteredData;
    } else {
      _clist = this.state.peoplelist;
    }

    var _leftBlock = 'col-lg-24';
    if(this.state.showAddForm) {
      _leftBlock = 'col-lg-16';
    }

    var _hide_peoples = (this.state.showAddForm || (!this.state.showAddForm && this.state.showSearchForm && this.state.filterString.length === 0)) ? {display: 'none'} : null;
    var _hide_search = this.state.showAddForm ? {display: 'none'} : null;

    var _active_add_form = 'add-link' + (this.state.showAddForm ? " active" : "");
    var _active_address_book = 'address-book-link' + (this.state.showAddressBook ? " active" : "");
    var _active_search_form = 'search-link' + (this.state.showSearchForm ? " active" : "");

    return (
      <Container>
        <header id="header" className="row">
          <nav className="navbar navbar-dark bg-inverse">
            <div className="nav navbar-nav">
              <a className="navbar-brand" href="#">
                <img src={ishLogo} alt="ish" />
              </a>
              <div className="pull-xs-right">
                <a href="#add-people" onClick={this.showAddForm.bind(this)} className={"nav-item nav-link " + _active_add_form}>
                  <Icon name="user-plus" />
                </a>
                <a href="#search-people" onClick={this.showSearchForm.bind(this)} className={"nav-item nav-link " + _active_search_form}>
                  <Icon name="search" />
                </a>
              </div>
            </div>
          </nav>
          <div className="container">
            <div className="search-wrapper" style={_hide_search}>
               <SearchBox filterString={this.state.filterString} doSearch={this.doSearch} block={this} />
            </div>
          </div>

        </header>

        <div className="row">
          <div className="col-lg-24">
            <div className="row">
              <div className={'people-list ' + _leftBlock} style={_hide_peoples}>
                <PeopleList clist={_clist} onPeopleRemove={this.handlePeopleRemove} onPeopleEdits={this.handlePeopleEdit} block={this} />
              </div>
              <div className="col-lg-24">
                <NewRow show={this.state.showAddForm} onRowSubmit={this.handleNewRowSubmit} block={this} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
};

export default PeopleApp;