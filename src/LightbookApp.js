import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import People from './views/people/People';
import Company from './views/company/Company';
import EditPeople from './views/people/EditPeople';
import SearchModel from './model/SearchModel';
import PeopleModel from './model/PeopleModel';
import ListView from './components/ListView';
import SearchBox from './components/SearchBox';
import Util from './components/Util';

import { createHashHistory } from 'history';

const history = createHashHistory();

class LightbookApp extends Component {

  constructor(props) {
    super(props);

    const search_string = new URLSearchParams(history.location.search).get('q');
    let _has_search = {};

    if(search_string !== null)
      _has_search = {q: search_string};

    this.state = {
      peoplelist: [],
      companylist: [],
      filterString: _has_search.q !== undefined ? _has_search.q : '',
      filteredData: [],
      showAddForm: false,
      showSearchForm: true,
      showLoader: ((_has_search.q !== undefined && _has_search.q.length > 1))
    };

    if(_has_search.q !== undefined) {
      if(_has_search.q.length > 1) {
        SearchModel.search(this, _has_search.q,
          function(that, response) {
            that.setState({
              companylist: response.data.output.companies,
              peoplelist: response.data.output.peoples,
              showLoader: false
            });
          }
        );

      }
    }

    this.onRowSubmit = this.handleNewRowSubmit.bind(this);
    this.onPeopleRemove = this.handlePeopleRemove.bind(this);
    this.onPeopleEdits = this.handlePeopleEdit.bind(this);
  }

  setLoader(value) {
    this.setState({
      showLoader: value
    });
  }

  static peopleStorageKey() {
    return 'searchResponse';
  }

  handleNewRowSubmit(newPeople) {
    let _total = this.block.state.peoplelist.length;
    newPeople['id'] = ++_total;
    this.block.setState({ peoplelist: this.block.state.peoplelist.concat([newPeople]) });
  }

  handlePeopleRemove(people) {
    if(!window.confirm('Are you sure you want to delete this people?'))
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
    if(!window.confirm('Are you sure you want to delete this company?'))
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

    history.push({ pathname: "/search?q=" + filterString });

    this.block.setLoader(true);

    SearchModel.search(this.block, _queryText,
      function(that, response) {
        that.setState({
          companylist: response.data.output.companies,
          peoplelist: response.data.output.peoples
        });

        that.setLoader(false);
      }
    );

    this.block.state.peoplelist.forEach(function(people) {
      if(people.name.toLowerCase().indexOf(_queryText) !== -1) {
        filteredData.push(people);
      }
    });

    if(_queryText.length === 0) {
      history.push({ pathname: "/search" });
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
    PeopleModel.getPeople(this, item.id, function(that, response) {
      ReactDOM.render(
        <EditPeople people={response.data.output.people} block={that} onPeopleEditSubmit={that.handlePeopleEdit} />,
        document.getElementById('react-modal')
      );
    });
  }

  static renderPeople(block, item, index) {
    return <People people={item} onPeopleDelete={block.handleRemove.bind(block)} onPeopleEdit={block.handleEditOpen.bind(block)} key={index} />;
  }

  static renderCompany(block, item, index) {
    return <Company company={item} onCompanyDelete={block.handleRemove.bind(block)} onCompanyEdit={block.handleEditOpen.bind(block)} key={index} />;
  }

  handleCompanyEditOpen(item) {

  }

  render() {
    const _plist = this.state.peoplelist, _clist = this.state.companylist;
    const _hide_peoples = (_plist.length === 0 ? {display: 'none'} : null);
    const _hide_companies = (_clist.length === 0 ? {display: 'none'} : null);

    return (
      <div>
        <div className="col-xs-24 search-wrapper">
           <SearchBox filterString={this.state.filterString} doSearch={this.doSearch} block={this} />
           {(this.state.showLoader && this.state.filterString.length > 2) ? Util.loaderImage() : ''}
        </div>

        <div className="row">
          <div className="col-lg-24">
            <div className="row">
              <div className="people-list col-lg-24" style={_hide_peoples}>
                <ListView list={_plist} onRemove={this.handlePeopleRemove} onEdits={this.handlePeopleEditOpen.bind(this)} block={this} item={LightbookApp.renderPeople} />
              </div>

              <div className="col-xs-24" style={ ((_plist.length > 0 && _clist.length > 0) ? {display: 'block'} : {display: 'none'}) }>
                <hr />
              </div>

              <div className="company-list col-lg-24" style={_hide_companies}>
                <ListView list={_clist} onRemove={this.handleCompanyRemove.bind(this)} onEdits={this.handleCompanyEditOpen.bind(this)} block={this} item={LightbookApp.renderCompany} />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LightbookApp;
