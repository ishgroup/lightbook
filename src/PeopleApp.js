import React, { Component } from 'react';
import PeopleList from './PeopleList';
import NewRow from './NewRow';
import SearchBox from './SearchBox';
import axios from 'axios';
import Config from './config';

class PeopleApp extends Component {
  constructor(props) {
     super(props);
     var that = this;

     this.state = {
        peoplelist: [],
        filterString: '',
        filteredData: [],
        showAddForm: false
     }

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
      showAddForm: true
    });
  }

  closeAddForm() {
    this.setState({
      showAddForm: false
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

    return (
      <div className="col-lg-24">
        <div className="row">
          <div className="col-lg-24">
            <SearchBox filterString={this.state.filterString} doSearch={this.doSearch} block={this} />
          </div>

          <div className="col-lg-24">
            <div className="row">
              <div className={_leftBlock}>
                <PeopleList clist={_clist} onPeopleRemove={this.handlePeopleRemove} onPeopleEdits={this.handlePeopleEdit} block={this} />
              </div>
              <div className="col-lg-8">
                <NewRow show={this.state.showAddForm} onRowSubmit={this.handleNewRowSubmit} block={this} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PeopleApp;