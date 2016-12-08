import React, { Component } from 'react';
import Icon from 'react-fa';
import { Link } from 'react-router';
import CompanyView from './CompanyView';
import Toggle from '../../components/Toggle';

class Company extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      'viewToggle': false,
      fetch: true,
      company: []
    }
  }

  handleRemoveCompany(e) {
    e.preventDefault();
    this.props.onCompanyDelete(this.props.company);
    return false;
  }

  handleEditCompany() {
    //this.props.onCompanyEdit(this.props.company);
    return false;
  }

  handleViewToggle() {
    var _toggleState = this.state.viewToggle;
    this.setState({
      'viewToggle': _toggleState === true ? false : true
    });

    Toggle.Slide(this.state.viewToggle, 'view-company-'+ this.props.company.id);
  }

  handleCheckFetched(check, company=[]) {
    if(check !== undefined) {
      this.setState({
        fetch: false,
        company: company
      });
    } else
      return this.state.fetch;
  }

  render() {
    const _company = this.state.company.length !== 0 ? this.state.company : this.props.company;

    return (
      <div className="row">
        <div className="col-xs-24" onClick={this.handleViewToggle.bind(this)}>
          <div className="row">
            <div className="col-xs-18">
              <Link to={"company/" + this.props.company.id} className="link-people">
                {this.props.company.name}
              </Link>
              {this.props.company.email !== undefined ? <span> - <a href={"mailto:"+ this.props.company.email}>{this.props.company.email}</a></span> : ''}
            </div>

            <div className="col-xs-6">
              <a href="" onClick={this.handleRemoveCompany.bind(this)} style={{marginRight: '5px'}}>
                <Icon name="remove" />
              </a>
            </div>
          </div>
        </div>
        <div className={"view-company col-xs-24" + (this.state.viewToggle ? " slide-down" : '')} id={"view-company-" + this.props.company.id}>
          <CompanyView company={_company} checkFetched={this.handleCheckFetched.bind(this)} fetch={this.state.viewToggle} />
        </div>
      </div>
    );
  }
}

export default Company;