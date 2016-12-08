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
    if(this.props.company.phone !== undefined && this.props.company.phone !== null) {
      phone = [];
      this.props.company.phone.forEach(function(value) {
        const _phonePart = value.split(' ');
        if(_phonePart[0] !== null)
          phone.push(['<a href="tel:'+ _phonePart[0] +'">'+ _phonePart[0] +'</a> ' + _phonePart[1]]);
        else
          phone.push([value]);
      });
    }

    return (
      <div className="row-view">
        {this.getRow("Name", this.props.company.name)}
        {this.getRow("Email", this.props.company.email)}

        {phone !== null ?
          <div className="form-group row">
            <div className="col-sm-3 text-sm-right">Phone:</div>
            <div className="col-sm-21" dangerouslySetInnerHTML={{__html: phone.join(', ')}} />
          </div>
        : ''}
        {this.getRow("Address", this.props.company.address)}
        {this.getRow("Suburb", this.props.company.suburb)}
        {this.getRow("Postal", this.props.company.postal)}
        {this.getRow("Country", this.props.company.country)}

        <div className="form-group row">
          <div className="offset-sm-3 col-sm-21">
            <Link to={"/company/" + this.props.company.id + "/edit"} className="btn btn-primary btn-sm">Edit</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default CompanyView;