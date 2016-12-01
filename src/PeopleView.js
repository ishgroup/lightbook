import React, { Component } from 'react';
import ViewPeopleModel from './model/ViewPeopleModel';
import { Link } from 'react-router';

class PeopleView extends Component {
  constructor(props) {
    super(props);

    if(this.props.checkFetched() !== false && this.props.fetch === true) {
      ViewPeopleModel.getPeople(this, this.props.people.id, function(that, response) {
        that.props.checkFetched(true, response.data.output.people);
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
          <div className="col-sm-18">{this.isNotNull(this.props.people.name)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Email:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.people.username)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Company:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.people.company)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Company Role:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.people.company_role)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Phone:</div>
          <div className="col-sm-18">{this.isNotNull((this.props.people.phone !== undefined && this.props.people.phone !== null) ? this.props.people.phone.join(', ') : '')}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Notes:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.people.notes)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <div className="col-sm-6">Mobile:</div>
          <div className="col-sm-18">{this.isNotNull(this.props.people.mobile)}</div>
        </div>
        <div className="col-xs-24" style={inputStyle}>
          <Link to={"/people/" + this.props.people.id + "/edit"} className="btn btn-primary btn-sm">Edit</Link>
        </div>
      </div>
    );
  }
}

export default PeopleView;