import React, { Component } from 'react';
import Company from './Company';

class CompanyList extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleCompanyRemove(company) {
    this.props.onCompanyRemove( company );
  }

  render() {
    var companies = [];
    var that = this; // TODO: Needs to find out why that = this made it work; Was getting error that onCompanyDelete is not undefined
    this.props.clist.forEach(function(company) {
      companies.push(<Company company={company} onCompanyDelete={that.handleCompanyRemove} /> );
    });

    return (
      <div>
        <h3>List of Companies</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Compnay</th>
              <th>Compnay Role</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{companies}</tbody>
        </table>
      </div>
    );
  }
}

export default CompanyList;