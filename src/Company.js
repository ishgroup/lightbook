import React, { Component } from 'react';
import Icon from 'react-fa';

class Company extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleRemoveCompany(e) {
    e.preventDefault();
    this.props.onCompanyDelete( this.props.company );
    return false;
  }

  handleEditCompany(e) {
    e.preventDefault();
    this.props.onCompanyEdit( this.props.company );
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
        <td>
          <a href="" onClick={this.handleEditCompany.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="edit" />
          </a>
          <a href="" onClick={this.handleRemoveCompany.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="remove" />
          </a>
        </td>
      </tr>
    );
  }
}

export default Company;