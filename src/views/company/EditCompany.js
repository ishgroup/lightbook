import React, { Component } from 'react';
import TextInputEdited from '../../components/TextInputEdited';
import Validate from '../../components/Validate';
import EditCompanyModel from '../../model/EditCompanyModel';
import ViewCompanyModel from '../../model/ViewCompanyModel';

class EditCompany extends Component {

  constructor(props) {
    super(props);
    this.state = {
      company: {}
    };

    if(this.props.params.id !== undefined) {
      ViewCompanyModel.getCompany(this, this.props.params.id, function(that, response) {
        that.setState({
          company: response.data.output.company
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const id = this.state.company.id;

    const valiadte = new Validate();
    const name     = valiadte.field('Name', this.refs.name.refs.inputEditedName).required().value();
    const email    = valiadte.field('Email', this.refs.email.refs.inputEditedName).required().value();
    const phone    = this.refs.phone.refs.inputEditedName.value;
    const address  = this.refs.address.refs.inputEditedName.value;
    const suburb   = this.refs.suburb.refs.inputEditedName.value;
    const postal   = this.refs.postal.refs.inputEditedName.value;
    const country  = this.refs.country.refs.inputEditedName.value;

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

    EditCompanyModel.edit(this, newrow, function(that, response) {
      alert("Company updated successfully");
    });

    return false;
  }

  render() {
    const inputStyle = {padding: '12px'};

    return (
      <div className="well">
        {this.state.company.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-company" noValidate="true">
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Name" name="name" ref="name" value={this.state.company.name} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Email" name="email" ref="email" value={this.state.company.email} validate="email" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone" value={this.state.company.phone} validate="phone" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Address" name="address" ref="address" value={this.state.company.address} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Suburb" name="suburb" ref="suburb" value={this.state.company.suburb} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Postal" name="postal" ref="postal" value={this.state.company.postal} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="country" name="country" ref="country" value={this.state.company.country} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="submit" className="btn btn-primary" value="Update Company"/>
            </div>
          </form>
        : ''}
      </div>
    );
  }
}

export default EditCompany;