import React, { Component } from 'react';
import TextInputEdited from '../../components/TextInputEdited';
import Validate from '../../components/Validate';
import CompanyModel from '../../model/CompanyModel';

class EditCompany extends Component {

  constructor(props) {
    super(props);
    this.state = {
      company: {}
    };

    if(this.props.params.id !== undefined) {
      CompanyModel.getCompany(this, this.props.params.id, function(that, response) {
        that.setState({
          company: response.data.output.company
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const id = this.state.company.id;

    const validate = new Validate();
    const name     = validate.field('Name', this.refs.name.refs.inputEditedName).required().value();
    const email    = validate.field('Email', this.refs.email.refs.inputEditedName).required().value();
    const address  = this.refs.address.refs.inputEditedName.value;
    const suburb   = this.refs.suburb.refs.inputEditedName.value;
    const postal   = this.refs.postal.refs.inputEditedName.value;
    const country  = this.refs.country.refs.inputEditedName.value;

    let phoneItem = this.refs.phone.refs.inputEditedName.value;
    let phone = [];
    if(phoneItem.length > 0) {
      const phonePart = phoneItem.split(',');
      phonePart.forEach(function(value) {
        if(value.trim() !== '')
          phone.push(value.trim());
      });
    }

    const newrow = {
      id: id,
      name: name,
      email: email,
      phone: phone,
      address: address,
      suburb: suburb,
      postal: postal,
      country: country
    };

    CompanyModel.edit(this, newrow, function(that, response) {
      alert("Company updated successfully");
    });

    return false;
  }

  hideAddForm() {
    this.props.router.goBack();
  }

  render() {

    return (
      <div className="well">
        {this.state.company.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-company" noValidate="true">

            <TextInputEdited type="text" className="form-control" placeholder="Name" name="name" ref="name" value={this.state.company.name} />
            <TextInputEdited type="text" className="form-control" placeholder="Email" name="email" ref="email" value={this.state.company.email} validate="email" />
            <TextInputEdited type="text" className="form-control" placeholder="Phone" name="phone" ref="phone" value={this.state.company.phone} validate="phone" />
            <TextInputEdited type="text" className="form-control" placeholder="Address" name="address" ref="address" value={this.state.company.address} />
            <TextInputEdited type="text" className="form-control" placeholder="Suburb" name="suburb" ref="suburb" value={this.state.company.suburb} />
            <TextInputEdited type="text" className="form-control" placeholder="Postal" name="postal" ref="postal" value={this.state.company.postal} />
            <TextInputEdited type="text" className="form-control" placeholder="country" name="country" ref="country" value={this.state.company.country} />

            <div className="form-group row">
              <div className="offset-sm-3 col-sm-21">
                <input type="submit" className="btn btn-primary" value="Update Company"/>&nbsp;
                <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
              </div>
            </div>

          </form>
        : ''}
      </div>
    );
  }
}

export default EditCompany;