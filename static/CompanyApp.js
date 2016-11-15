import React, { Component } from 'react';
import CompanyList from './CompanyList';
import NewRow from './NewRow';
import SearchBox from './SearchBox';

class CompanyApp extends Component {
  constructor(props) {
     super(props);
     this.state = {
        companylist: this.props.companies,
        filterString: '',
        filteredData: [],
        showAddForm: false
     }

     this.onRowSubmit = this.handleNewRowSubmit.bind(this);
     this.onCompanyRemove = this.handleCompanyRemove.bind(this);
     this.onCompanyEdits = this.handleCompanyEdit.bind(this);
  }

  handleNewRowSubmit(newcompany) {
    this.block.setState({ companylist: this.block.state.companylist.concat([newcompany]) });
  }

  handleCompanyRemove(company) {
    var index = -1;
    var clength = this.block.state.companylist.length;
    for (var i = 0; i < clength; i++) {
      if (this.block.state.companylist[i].name === company.name) {
      index = i;
      break;
      }
    }
    this.block.state.companylist.splice(index, 1);
    this.block.setState({ companylist: this.block.state.companylist });
  }

  handleCompanyEdit(company) {
    //var index = -1;
    var clength = this.block.state.companylist.length;
    for (var i = 0; i < clength; i++) {
      if (this.block.state.companylist[i].id === company.id) {
        this.block.state.companylist[i] = company;
        break;
      }
    }
    //this.block.state.companylist.splice(index, 1);
    this.block.setState({ companylist: this.block.state.companylist });
  }

  doSearch(filterString) {
    var filteredData = [];
    var _queryText = filterString.toLowerCase();

    this.block.state.companylist.forEach(function(company) {
      if(company.name.toLowerCase().indexOf(_queryText) !== -1
        || company.username.toLowerCase().indexOf(_queryText) !== -1
        || company.company.toLowerCase().indexOf(_queryText) !== -1
        || company.company_role.toLowerCase().indexOf(_queryText) !== -1
        || company.phone.toLowerCase().indexOf(_queryText) !== -1
        || company.notes.toLowerCase().indexOf(_queryText) !== -1
        || company.mobile.toLowerCase().indexOf(_queryText) !== -1
      ) {
        filteredData.push(company);
      }
    });

    this.block.setState({
      filterString: filterString,
      filteredData: filteredData
    })
  }

  showAddForm() {
    console.log(this);
    this.setState({
      showAddForm: true
    });
  }

  closeAddForm() {
    this.setState({
      showAddForm: false
    });
  }

  render() {
    /*var tableStyle = {width: '100%'};
    var leftTdStyle = {width: '50%',padding:'20px',verticalAlign: 'top'};
    var rightTdStyle = {width: '50%',padding:'20px',verticalAlign: 'top'};*/

    var _clist = [];
    if(this.state.filterString.length > 0) {
      _clist = this.state.filteredData;
    } else {
      _clist = this.state.companylist;
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
                <CompanyList clist={_clist} onCompanyRemove={this.handleCompanyRemove} onCompanyEdits={this.handleCompanyEdit} block={this} />
              </div>
              <div className="col-lg-8">
                {this.state.showAddForm ?
                  <NewRow show={this.state.showAddForm} onRowSubmit={this.handleNewRowSubmit} block={this} />
                  : '' }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default CompanyApp;