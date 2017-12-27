import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ViewCompany from './ViewCompany';
import CompanyModel from '../../model/CompanyModel';
import Util from '../../components/Util';
import Toggle from '../../components/Toggle';

class Company extends Component {
  isFetch;

  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      viewToggle: false,
      company: (this.props.autoFetch === true ? this.props.company : []),
      showLoader: false,
      isAutoFetched: (this.props.autoFetch || false)
    }
    this.isFetch = true;
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.viewToggle)
      Toggle.Slide(true, 'view-company-'+ this.props.company.id);

    this.isFetch = true;

    this.setState({
      viewToggle: false,
      showLoader: false
    });
  }

  setLoader(value) {
    this.setState({
      showLoader: value
    });
  }

  handleViewToggle() {
    let _toggleState = this.state.viewToggle;

    if(this.isFetch !== false && _toggleState === false && !this.state.isAutoFetched) {
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
      viewToggle: ! _toggleState
    });

    this.isFetch = false;
  }

  onCheckPage(e) {
    if(this.props.onSamePage !== undefined && this.props.onSamePage === true) {
      e.preventDefault();
    }
  }

  render() {
    const _company = this.state.company.length !== 0 ? this.state.company : [];

    return (
      <div className="row">
        <div className="col-xs-24" onClick={this.handleViewToggle.bind(this)}>
          <div className="row">
            <div className="col-xs-24">
              <Link to={"company/" + this.props.company.id} className="link-people" onClick={this.onCheckPage.bind(this)}>
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
