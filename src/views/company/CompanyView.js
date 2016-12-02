import React, { Component } from 'react';
import CompanyModel from '../../model/CompanyModel';
import { Link } from 'react-router';

class CompanyView extends Component {
  constructor(props) {
    super(props);

    if(this.props.checkFetched() !== false && this.props.fetch === true) {
      CompanyModel.getCompany(this, this.props.company.id, function(that, response) {
        that.props.checkFetched(true, response.data.output.company);
      });
    }
  }

  isNotNull(text) {
    return text === 'null' ? '-' : text;
  }

  render() {
    const inputStyle = {padding: '12px'};

    return (
      <div className="row">
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Name:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.name)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Email:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.email)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Phone:</div>
          <div className="col-sm-18">{this.isNotNull((this.props.company.phone !== undefined && this.props.company.phone !== 'null') ? this.props.company.phone.join(', ') : '')}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Address:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.address)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Suburb:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.suburb)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Postal:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.postal)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Country:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.company.country)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <Link to={"/company/" + this.props.company.id + "/edit"} className="btn btn-primary btn-sm">Edit</Link>
        </div>
      </div>
    );
  }
}

export default CompanyView;