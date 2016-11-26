import React, { Component } from 'react';
import Icon from 'react-fa';
import { Link } from 'react-router';

class Company extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleRemoveCompany(e) {
    e.preventDefault();
    this.props.onCompanyDelete(this.props.company);
    return false;
  }

  handleEditCompany() {
    this.props.onCompanyEdit(this.props.company);
    return false;
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-18">
          <Link to={"company/" + this.props.company.id} className="link-people">
            {this.props.company.name}
          </Link>
        </div>

        <div className="col-xs-6">
          <a href="" onClick={this.handleRemoveCompany.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="remove" />
          </a>
        </div>
      </div>
    );
  }
}

export default Company;