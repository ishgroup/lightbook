import React, { Component } from "react";
import { Link } from "react-router";
import Row from "../../components/Row";

class ViewCompany extends Component {

  render() {
    return (
      <div className="row-view">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>

        <Row label="Name" item={this.props.company.name} />
        <Row label="Email" item={this.props.company.email} link="mailto" />
        <Row label="Phone" item={this.props.company.phone} link="tel" />
        <Row label="Address" item={this.props.company.address} />
        <Row label="Suburb" item={this.props.company.suburb} />
        <Row label="Postal" item={this.props.company.postal} />
        <Row label="Country" item={this.props.company.country} />

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