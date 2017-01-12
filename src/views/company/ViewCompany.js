import React, { Component } from "react";
import { Link } from "react-router";
import Row from "../../components/Row";

class ViewCompany extends Component {

  render() {
    return (
      <div className="row-view">
        {this.props.children ?
          <div className="form-group row">
            <div className="col-xs-24">
              {this.props.children}
            </div>
          </div>
        : ''}

        <Row label="Name" item={this.props.company.name} />
        <Row label="Abn" item={this.props.company.abn} />
        <Row label="Status" item={this.props.company.active === 'TRUE' ? 'Active' : 'Inactive'} />
        <Row label="Phone" item={this.props.company.phone} link="tel" />
        <Row label="Fax" item={this.props.company.fax} link="tel" />
        <Row label="Street" item={this.props.company.street} />
        <Row label="Suburb" item={this.props.company.suburb} />
        <Row label="Postal Code" item={this.props.company.postalCode} />
        <Row label="State" item={this.props.company.st} />
        <Row label="Notes" item={this.props.company.notes} />

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