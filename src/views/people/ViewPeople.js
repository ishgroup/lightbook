import React, { Component } from "react";
import { Link } from "react-router";
import Util from "../../components/Util";

class ViewPeople extends Component {
  render() {
    return (
      <div className="row-view">
        <div className="form-group row">
          <div className="col-xs-24">
            {this.props.children}
          </div>
        </div>
        {Util.Row("Name", this.props.people.name)}
        {Util.Row("Email", this.props.people.email, "mailto")}
        {Util.Row("Company", this.props.people.company)}
        {Util.Row("Company Role", this.props.people.company_role)}
        {Util.Row("Phone", this.props.people.phone, "tel")}
        {Util.Row("Notes", this.props.people.notes)}
        {Util.Row("Mobile", this.props.people.mobile)}
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