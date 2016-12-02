import React, { Component } from 'react';
import CompanyModel from '../../model/CompanyModel';
import Validate from '../../components/Validate';

class AddCompany extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const valiadte = new Validate();
    const name     = valiadte.field('Name', this.refs.name).required().value();
    const email    = valiadte.field('Email', this.refs.email).required().value();
    const phone    = this.refs.phone.value;
    const address  = this.refs.address.value;
    const suburb   = this.refs.suburb.value;
    const postal   = this.refs.postal.value;
    const country  = this.refs.country.value;

    const newrow = {
      name: name,
      email: email,
      phone: phone,
      address: address,
      suburb: suburb,
      postal: postal,
      country: country
    };

    if(valiadte.isValidate) {

      CompanyModel.add(this, newrow, function(that, response) {
        that.refs.name.value = '';
        that.refs.email.value = '';
        that.refs.phone.value = '';
        that.refs.address.value = '';
        that.refs.suburb.value = '';
        that.refs.postal.value = '';
        that.refs.country.value = '';

        alert('Company added successfully.');
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
            <input type="text"  className="form-control col-md-8" placeholder="Email" name="email" ref="email" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Address" name="address" ref="address"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Suburb" name="suburb" ref="suburb"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Postal" name="postal" ref="postal"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text"  className="form-control col-md-8" placeholder="Country" name="country" ref="country"/>
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="submit" className="btn btn-primary" value="Add Company"/>&nbsp;
            <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
          </div>
        </form>
      </div>
    );
  }
}

export default AddCompany;