import React, { Component } from 'react';
import Modal, { ModalHeader } from './components/Modal';
import TextInputEdited from './components/TextInputEdited';

class PeopleEdit extends Component {

  handleSubmit(e) {
    e.preventDefault();

    var id = this.props.people.id;
    var name = e.target.name.value;
    var username = e.target.username.value;
    var company = e.target.company.value;
    var company_role = e.target.company_role.value;
    var phone = e.target.phone.value;
    var notes = e.target.notes.value;
    var mobile = e.target.mobile.value;

    var newrow = {
      id: id,
      name: name,
      username: username,
      company: company,
      company_role: company_role,
      phone: phone,
      notes: notes,
      mobile: mobile
    };

    this.props.onPeopleEditSubmit(newrow);

    Modal.close();
    return false;
  }

  render() {
    var inputStyle = {padding:'12px'};

    return (
      <Modal id="people-edit-modal" fullPage={true}>
        <ModalHeader title="Edit People" />
        <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-people" noValidate="true">
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Name" name="name" ref="name" value={this.props.people.name} />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Username" name="username" ref="username" value={this.props.people.username} validate="email" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company" name="company" ref="company" value={this.props.people.company} />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company Role" name="company_role" ref="company_role" value={this.props.people.company_role} />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone" value={this.props.people.phone} validate="phone" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Notes" name="notes" ref="notes" value={this.props.people.notes} />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Mobile" name="mobile" ref="mobile" value={this.props.people.mobile} validate="phone" />
          </div>
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="submit" className="btn btn-primary" value="Update People"/>
          </div>
        </form>
      </Modal>
    );
  }
}

export default PeopleEdit;