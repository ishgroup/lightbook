import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import People from './People';
import Company from './Company';
import PeopleEdit from './PeopleEdit';

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
    };

    Container.setPageName('search');

    const _has_search = this.props.location.query;

    if(_has_search.q !== undefined) {
      if(_has_search.q.length > 0) {
        const _search_query = _has_search.q;
        const getSearchResponse = localStorage.getItem(this.peopleStorageKey());

        if(getSearchResponse !== undefined && getSearchResponse !== null) {
          const _parseResponse = JSON.parse(getSearchResponse);
          if(_parseResponse.companies !== undefined && _parseResponse.peoples !== undefined) {
            this.state = {
              companylist: _parseResponse.companies,
              peoplelist: _parseResponse.peoples,
              filterString: _search_query
            };
          }
        }
      }
    }

    this.onRowSubmit = this.handleNewRowSubmit.bind(this);
    this.onPeopleRemove = this.handlePeopleRemove.bind(this);
    this.onPeopleEdits = this.handlePeopleEdit.bind(this);
  }

  peopleStorageKey() {
    return 'searchResponse';
  }

  handleNewRowSubmit(newPeople) {
    let _total = this.block.state.peoplelist.length;
    newPeople['id'] = ++_total;
    this.block.setState({ peoplelist: this.block.state.peoplelist.concat([newPeople]) });
  }

  handlePeopleRemove(people) {
    if(!confirm('Are you sure you want to delete this people?'))
      return false;

    let index = -1;
    const clength = this.block.state.peoplelist.length;
    for (let i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].name === people.name) {
      index = i;
      break;
      }
    }
    this.block.state.peoplelist.splice(index, 1);
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  handleCompanyRemove(company) {
    if(!confirm('Are you sure you want to delete this company?'))
      return false;

    let index = -1;
    const clength = this.block.state.companylist.length;
    for (let i = 0; i < clength; i++) {
      if (this.block.state.companylist[i].name === company.name) {
        index = i;
        break;
      }
    }
    this.block.state.companylist.splice(index, 1);
    this.block.setState({ companylist: this.block.state.companylist });
  }

  handlePeopleEdit(people) {
    const clength = this.block.state.peoplelist.length;
    for (let i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].id === people.id) {
        this.block.state.peoplelist[i] = people;
        break;
      }
    }
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  doSearch(filterString) {
    const filteredData = [];
    const _queryText = filterString.toLowerCase();

    this.block.props.router.replace('search?q='+ filterString);

    SearchModel.search(this.block, _queryText,
      function(that, response) {
        localStorage.setItem(that.peopleStorageKey(), JSON.stringify(response.data.output));
        that.setState({
          companylist: response.data.output.companies,
          peoplelist: response.data.output.peoples
        });
      }
    );

    this.block.state.peoplelist.forEach(function(people) {
      if(people.name.toLowerCase().indexOf(_queryText) !== -1) {
        filteredData.push(people);
      }
    });

    if(_queryText.length === 0) {
      this.block.props.router.replace('search');
      localStorage.setItem(this.block.peopleStorageKey(), JSON.stringify([]));
      this.block.setState({
        companylist: [],
        peoplelist: []
      });
    }

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
    ViewPeopleModel.getPeople(this, item.id, function(that, response) {
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
    return <Company company={item} onCompanyDelete={block.handleRemove.bind(block)} onCompanyEdit={block.handleEditOpen.bind(block)} />;
  }

  handleCompanyEditOpen(item) {

  }

  render() {
    const _plist = this.state.peoplelist, _clist = this.state.companylist;
    const _hide_peoples = (_plist.length === 0 ? {display: 'none'} : null);

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
                <ListView list={_clist} onRemove={this.handleCompanyRemove.bind(this)} onEdits={this.handleCompanyEditOpen.bind(this)} block={this} item={this.renderCompany} />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PeopleApp;