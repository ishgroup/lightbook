import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import People from './People';
import Company from './Company';
import PeopleEdit from './PeopleEdit';
import PeopleList from './PeopleList';

import SearchModel from './model/SearchModel';
import ViewPeopleModel from './model/ViewPeopleModel';

import Container from './components/Container';
import ListView from './components/ListView';
import SearchBox from './components/SearchBox';

class PeopleApp extends Component {
  constructor(props) {
     super(props);

     this.state = {
        peoplelist: [],
        companylist: [],
        filterString: '',
        filteredData: [],
        showAddForm: false,
        showSearchForm: true,
     }

     Container.setPageName('search');

     /*axios.get('/peoples', { baseURL: Config.baseUrl() })
      .then(function(response){
        that.setState({
          peoplelist: response.data.output
        });
      });*/

     this.onRowSubmit = this.handleNewRowSubmit.bind(this);
     this.onPeopleRemove = this.handlePeopleRemove.bind(this);
     this.onPeopleEdits = this.handlePeopleEdit.bind(this);
  }

  handleNewRowSubmit(newPeople) {
    var _total = this.block.state.peoplelist.length;
    newPeople['id'] = ++_total;
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

  getSearchResponse(that, response) {
    that.setState({
      companylist: response.data.output.companies,
      peoplelist: response.data.output.people
    });
  }

  doSearch(filterString) {
    var filteredData = [];
    var _queryText = filterString.toLowerCase();

    SearchModel.search(this.block, _queryText,
      function(that, response) {
        that.setState({
          companylist: response.data.output.companies,
          peoplelist: response.data.output.people
        });
      }
    );

    this.block.state.peoplelist.forEach(function(people) {
      if(people.name.toLowerCase().indexOf(_queryText) !== -1) {
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

    this.closeSearchForm();
  }

  closeAddForm() {
    this.setState({
      showAddForm: false,
      showSearchForm: true,
    });
  }

  showSearchForm() {
    this.setState({
      showSearchForm: true,
    });

    Container.setPageName('search');

    this.closeAddForm();
  }

  closeSearchForm() {
    this.setState({
      showSearchForm: false
    });
  }

  close() {
    this.setState({ showModal: false });
  }

  handlePeopleEditOpen(item) {
    console.log(item.id);
    ViewPeopleModel.getPeople(this, item.id, function(that, response) {
      console.log(response.data.output.people);
      ReactDOM.render(
        <PeopleEdit people={response.data.output.people} block={that} onPeopleEditSubmit={that.handlePeopleEdit} />,
        document.getElementById('react-modal')
      );
    });
  }

  renderPeople(block, item) {
    return <People people={item} onPeopleDelete={block.handleRemove.bind(block)} onPeopleEdit={block.handleEditOpen.bind(block)} />;
  }

  renderCompany(block, item) {
    return <Company company={item} onPeopleDelete={block.handleRemove.bind(block)} onPeopleEdit={block.handleEditOpen.bind(block)} />;
  }

  handleCompanyList(item) {

  }

  render() {
    var _plist = this.state.peoplelist, _clist = this.state.companylist;
    var _hide_peoples = (_plist.length === 0 ? {display: 'none'} : null);

    return (
      <div>
        <div className="col-xs-24 search-wrapper">
           <SearchBox filterString={this.state.filterString} doSearch={this.doSearch} block={this} />
        </div>

        <div className="row">
          <div className="col-lg-24">
            <div className="row">
              <div className="people-list col-lg-24" style={_hide_peoples}>
                <ListView list={_plist} onRemove={this.handlePeopleRemove} onEdits={this.handlePeopleEditOpen.bind(this)} block={this} item={this.renderPeople} />
              </div>

              <div className="company-list col-lg-24" style={_hide_peoples}>
                <br /><hr /><br />
                <ListView list={_clist} onRemove={this.handlePeopleRemove} onEdits={this.handleCompanyList.bind(this)} block={this} item={this.renderCompany} />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PeopleApp;