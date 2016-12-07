import React, { Component } from 'react';
import PeopleModel from '../../model/PeopleModel';
import { Link } from 'react-router';

class PeopleView extends Component {
  constructor(props) {
    super(props);

    if(this.props.checkFetched() !== false && this.props.fetch === true) {
      PeopleModel.getPeople(this, this.props.people.id, function(that, response) {
        that.props.checkFetched(true, response.data.output.people);
      });
    }
  }

  isNotNull(text) {
    return (text === 'null' || text === undefined) ? '-' : text;
  }

  render() {
    return (
      <div className="row">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Name:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.name)}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Email:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.email)}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Company:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.company)}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Company Role:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.company_role)}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Phone:</div>
          <div className="col-sm-21">{this.isNotNull((this.props.people.phone !== undefined && this.props.people.phone !== null) ? this.props.people.phone.join(', ') : '')}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Notes:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.notes)}</div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">Mobile:</div>
          <div className="col-sm-21">{this.isNotNull(this.props.people.mobile)}</div>
        </div>
        <div className="form-group row">
          <div className="offset-sm-3 col-sm-21">
            <Link to={"/people/" + this.props.people.id + "/edit"} className="btn btn-primary btn-sm">Edit</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default PeopleView;