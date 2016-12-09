import React, { Component } from 'react';
import { Link } from 'react-router';
import Util from '../../components/Util';

class CompanyView extends Component {

  render() {
    let phone = Util.Phone(this.props.company.phone);

    return (
      <div className="row-view">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>

        {Util.Row("Name", this.props.company.name)}
        {Util.Row("Email", this.props.company.email)}

        {phone !== null ?
          <div className="form-group row">
            <div className="col-sm-3 text-sm-right">Phone:</div>
            <div className="col-sm-21" dangerouslySetInnerHTML={{__html: phone.join(', ')}} />
          </div>
        : ''}
        {Util.Row("Address", this.props.company.address)}
        {Util.Row("Suburb", this.props.company.suburb)}
        {Util.Row("Postal", this.props.company.postal)}
        {Util.Row("Country", this.props.company.country)}

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