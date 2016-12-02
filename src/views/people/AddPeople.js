import React, { Component } from 'react';
import PeopleModel from '../../model/PeopleModel';
import Validate from '../../components/Validate';

class AddPeople extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const valiadte      = new Validate();
    const name          = valiadte.field('Name', this.refs.name).required().value();
    const username      = valiadte.field('Username', this.refs.username).required().value();
    const company       = valiadte.field('Company', this.refs.company).required().value();
    const company_role  = this.refs.company_role.value;
    const phone         = this.refs.phone.value;
    const notes         = this.refs.notes.value;
    const mobile        = this.refs.mobile.value;

    const newrow = {
      name: name,
      username: username,
      company: company,
      company_role: company_role,
      phone: phone,
      notes: notes,
      mobile: mobile
    };

    if(valiadte.isValidate) {

      PeopleModel.add(this, newrow, function(that, response) {
        that.refs.name.value = '';
        that.refs.username.value = '';
        that.refs.company.value = '';
        that.refs.company_role.value = '';
        that.refs.phone.value = '';
        that.refs.notes.value = '';
        that.refs.mobile.value = '';

        alert('People added successfully.');
      });
    }

    return false;
  }

  hideAddForm() {
    this.props.router.goBack();
  }

  render() {
    const inputStyle = {padding: '12px'};

    return (
      <div className="well">
        <form onSubmit={this.handleSubmit} className="ContactForm" noValidate="true">
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8"  placeholder="Name" name="name" ref="name" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Username" name="username" ref="username" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Company" name="company" ref="company"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Company Role" name="company_role" ref="company_role"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Notes" name="notes" ref="notes"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Mobile" name="mobile" ref="mobile"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="submit" className="btn btn-primary" value="Add People"/>&nbsp;
            <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
          </div>
        </form>
      </div>
    );
  }
}

export default AddPeople;