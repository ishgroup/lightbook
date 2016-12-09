import React, { Component } from 'react';
import { Link } from 'react-router';
import Icon from 'react-fa';
import CompanyView from './CompanyView';
import CompanyModel from '../../model/CompanyModel';
import Toggle from '../../components/Toggle';

class Company extends Component {
  isFetch = true;

  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      'viewToggle': false,
      company: []
    }
  }

  handleRemoveCompany(e) {
    e.preventDefault();
    this.props.onCompanyDelete(this.props.company);
    return false;
  }

  handleViewToggle() {
    var _toggleState = this.state.viewToggle;

    if(this.isFetch !== false && _toggleState === false) {
      CompanyModel.getCompany(this, this.props.company.id, function(that, response) {
        that.setState({
          company: response.data.output.company
        });

        Toggle.Slide(!that.state.viewToggle, 'view-company-'+ that.props.company.id);
      });
    } else {
      Toggle.Slide(this.state.viewToggle, 'view-company-'+ this.props.company.id);
    }

    this.setState({
      'viewToggle': _toggleState === true ? false : true
    });

    this.isFetch = false;
  }

  render() {
    const _company = this.state.company.length !== 0 ? this.state.company : [];

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
          <CompanyView company={_company}>
            <h6>Company View</h6>
          </CompanyView>
        </div>
      </div>
    );
  }
}

export default Company;