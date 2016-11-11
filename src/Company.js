import React, { Component } from 'react';

class Company extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleRemoveCompany() {
    this.props.onCompanyDelete( this.props.company );
    return false;
  }

  render() {
    return (
      <tr>
        <td>{this.props.company.name}</td>
        <td>{this.props.company.username}</td>
        <td>{this.props.company.company}</td>
        <td>{this.props.company.company_role}</td>
        <td>{this.props.company.phone}</td>
        <td>{this.props.company.notes}</td>
        <td>{this.props.company.mobile}</td>
        <td><input type="button"  className="btn btn-primary" value="Remove" onClick={this.handleRemoveCompany}/></td>
      </tr>
    );
  }
}

export default Company;