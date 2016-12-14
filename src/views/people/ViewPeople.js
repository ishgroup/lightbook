import React, { Component } from "react";
import { Link } from "react-router";
import Row from "../../components/Row";

class ViewPeople extends Component {
  render() {
    return (
      <div className="row-view">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>

        <Row label="Name" item={this.props.people.name} />
        <Row label="Email" item={this.props.people.email} link="mailto" />
        <Row label="Company" item={this.props.people.company} />
        <Row label="Company Role" item={this.props.people.company_role} />
        <Row label="Phone" item={this.props.people.phone} link="tel" />
        <Row label="Notes" item={this.props.people.notes} />
        <Row label="Mobile" item={this.props.people.mobile} />

        <div className="form-group row">
          <div className="offset-sm-3 col-sm-21">
            <Link to={"/people/" + this.props.people.id + "/edit"} className="btn btn-primary btn-sm">Edit</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ViewPeople;