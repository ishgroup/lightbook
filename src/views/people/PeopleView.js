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

  getRow(label, item) {
    if(item !== 'null' && item !== undefined) {
      return (
        <div className="form-group row">
          <div className="col-sm-3 text-sm-right">{label}:</div>
          <div className="col-sm-21">{item}</div>
        </div>
      );
    }
  }

  render() {
    let phone = null;
    if(this.props.people.phone !== undefined && this.props.people.phone !== null) {
      phone = [];
      this.props.people.phone.forEach(function(value) {
        const _phonePart = value.split(' ');
        if(_phonePart[0] !== null)
          phone.push(['<a href="tel:'+ _phonePart[0] +'">'+ _phonePart[0] +'</a> ' + _phonePart[1]]);
        else
          phone.push([value]);
      });
    }

    return (
      <div className="row">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>
        {this.getRow("Name", this.props.people.name)}
        {this.getRow("Email", this.props.people.email)}
        {this.getRow("Company", this.props.people.company)}
        {this.getRow("Company Role", this.props.people.company_role)}
        {phone !== null ?
          <div className="form-group row">
            <div className="col-sm-3 text-sm-right">Phone:</div>
            <div className="col-sm-21" dangerouslySetInnerHTML={{__html: phone.join(', ')}} />
          </div>
        : ''}
        {this.getRow("Notes", this.props.people.notes)}
        {this.getRow("Mobile", this.props.people.mobile)}
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