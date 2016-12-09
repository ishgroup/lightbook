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
    const validate = new Validate();

    let phoneItem = this.refs.phone.item.value;
    let phone = [];
    if(phoneItem.length > 0) {
      const phonePart = phoneItem.split(',');
      phonePart.forEach(function(value) {
        if(value.trim() !== '')
          phone.push(value.trim());
      });
    }

    const newrow = {
      name: validate.field('Name', this.refs.name.item).required().value(),
      email: validate.field('Email', this.refs.email.item).required().value(),
      username: validate.field('Username', this.refs.username.item).required().value(),
      company: validate.field('Company', this.refs.company.item).required().value(),
      company_role: this.refs.company_role.item.value,
      phone: phone,
      notes: this.refs.notes.item.value,
      mobile: this.refs.mobile.item.value
    };

    if(validate.isValidate) {

      PeopleModel.add(this, newrow, function(that, response) {
        document.getElementsByClassName('ContactForm')[0].reset();
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
          <FormField label="Email" name="email" ref="email" />
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