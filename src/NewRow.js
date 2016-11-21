import React, { Component } from 'react';

class NewRow extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    var name = e.target.name.value;
    var username = e.target.username.value;
    var company = e.target.company.value;
    var company_role = e.target.company_role.value;
    var phone = e.target.phone.value;
    var notes = e.target.notes.value;
    var mobile = e.target.mobile.value;

    var newrow = {
      name: name,
      username: username,
      company: company,
      company_role: company_role,
      phone: phone,
      notes: notes,
      mobile: mobile
    };

    this.props.onRowSubmit(newrow);

    e.target.name.value = '';
    e.target.username.value = '';
    e.target.company.value = '';
    e.target.company_role.value = '';
    e.target.phone.value = '';
    e.target.notes.value = '';
    e.target.mobile.value = '';

    this.props.block.showAddressBook();

    return false;
  }

  hideAddForm() {
    this.props.block.showAddressBook();
  }

  render() {
    var inputStyle = {padding:'12px'};

    return (
      this.props.show ?
        <div className="well">
          <form onSubmit={this.handleSubmit} className="ContactForm" noValidate="true">
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8"  placeholder="Name" name="name" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Username" name="username"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Company" name="company"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Company Role" name="company_role"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Phone" name="phone"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Notes" name="notes"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="text"  className="form-control col-md-8" placeholder="Mobile" name="mobile"/>
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="submit" className="btn btn-primary" value="Add People"/>&nbsp;
              <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
            </div>
          </form>
        </div>
        : null
    );
  }
}

export default NewRow;