import React, { Component } from 'react';
import { Link } from 'react-router';
import ViewCompany from './ViewCompany';
import CompanyModel from '../../model/CompanyModel';
import Util from '../../components/Util';
import Toggle from '../../components/Toggle';

class Company extends Component {
  isFetch = true;

  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      'viewToggle': false,
      company: [],
      showLoader: false
    }
  }

  setLoader(value) {
    this.setState({
      showLoader: value
    });
  }

  handleViewToggle() {
    var _toggleState = this.state.viewToggle;

    if(this.isFetch !== false && _toggleState === false) {
      this.setLoader(true);
      CompanyModel.getCompany(this, this.props.company.id, function(that, response) {
        that.setState({
          company: response.data.output.company
        });

        that.setLoader(false);

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
            </div>
          </div>
          {this.state.showLoader ? Util.loaderImage() : ''}
        </div>

        <div className={"view-company col-xs-24" + (this.state.viewToggle ? " slide-down" : '')} id={"view-company-" + this.props.company.id}>
          <ViewCompany company={_company}>
            <h6>Company View</h6>
          </ViewCompany>
        </div>
      </div>
    );
  }
}

export default Company;