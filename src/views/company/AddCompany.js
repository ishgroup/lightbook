import React, { Component } from 'react';
import CompanyModel from '../../model/CompanyModel';
import Validate from '../../components/Validate';
import FormField from '../../components/FormField';

class AddCompany extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    console.log(this);
    //console.log(newrow);

    const valiadte = new Validate();
    const name     = valiadte.field('Name', this.refs.name.item).required().value();
    const email    = valiadte.field('Email', this.refs.email.item).required().value();
    const phone    = this.refs.phone.item.value;
    const address  = this.refs.address.item.value;
    const suburb   = this.refs.suburb.item.value;
    const postal   = this.refs.postal.item.value;
    const country  = this.refs.country.item.value;

    const newrow = {
      name: name,
      // email: email,
      phone: phone,
      address: address,
      suburb: suburb,
      postal: postal,
      // country: country
    };

    if(valiadte.isValidate) {

      CompanyModel.add(this, newrow, function(that, response) {
        that.refs.name.item.value = '';
        that.refs.email.item.value = '';
        that.refs.phone.item.value = '';
        that.refs.address.item.value = '';
        that.refs.suburb.item.value = '';
        that.refs.postal.item.value = '';
        that.refs.country.item.value = '';

        alert('Company added successfully.');
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
          <FormField label="Phone" name="phone" ref="phone" />
          <FormField label="Address" name="address" ref="address" />
          <FormField label="Suburb" name="suburb" ref="suburb" />
          <FormField label="Postal" name="postal" ref="postal" />
          <FormField label="Country" name="country" ref="country" />

          <div className="form-group row">
            <div className="offset-sm-3 col-sm-21">
              <input type="submit" className="btn btn-primary" value="Add Company"/>&nbsp;
              <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default AddCompany;
