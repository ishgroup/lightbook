import React, { Component } from 'react';
import { Link } from 'react-router';
import Util from '../../components/Util';

class ViewCompany extends Component {

  render() {
    return (
      <div className="row-view">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>

        {Util.Row("Name", this.props.company.name)}
        {Util.Row("Email", this.props.company.email, "mailto")}
        {Util.Row("Phone", this.props.company.phone, "tel")}
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

export default ViewCompany;