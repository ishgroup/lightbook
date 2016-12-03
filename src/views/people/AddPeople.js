import React, { Component } from 'react';
import PeopleModel from '../../model/PeopleModel';
import Validate from '../../components/Validate';
import FormField from '../../components/FormField';

class AddPeople extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const valiadte      = new Validate();
    const name          = valiadte.field('Name', this.refs.name.item).required().value();
    const username      = valiadte.field('Username', this.refs.username.item).required().value();
    const company       = valiadte.field('Company', this.refs.company.item).required().value();
    const company_role  = this.refs.company_role.item.value;
    const phone         = this.refs.phone.item.value;
    const notes         = this.refs.notes.item.value;
    const mobile        = this.refs.mobile.item.value;

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
        that.refs.name.item.value = '';
        that.refs.username.item.value = '';
        that.refs.company.item.value = '';
        that.refs.company_role.item.value = '';
        that.refs.phone.item.value = '';
        that.refs.notes.item.value = '';
        that.refs.mobile.item.value = '';

        alert('People added successfully.');
      });
    }

    return false;
  }

  hideAddForm() {
    this.props.router.goBack();
  }

  render() {

    return (
      <div className="well">
        <form onSubmit={this.handleSubmit} className="ContactForm" noValidate="true">
          <FormField label="Name" name="name" ref="name" />
          <FormField label="Username" name="username" ref="username" />
          <FormField label="Company" name="company" ref="company" />
          <FormField label="Company Role" name="company_role" ref="company_role" />
          <FormField label="Phone" name="phone" ref="phone" />
          <FormField label="Notes" name="notes" ref="notes" />
          <FormField label="Mobile" name="mobile" ref="mobile" />

          <div className="form-group row">
            <div className="offset-sm-3 col-sm-21">
              <input type="submit" className="btn btn-primary" value="Add People"/>&nbsp;
              <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default AddPeople;