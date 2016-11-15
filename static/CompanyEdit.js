import React, { Component } from 'react';

class CompanyEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    }
  }

  close() {
    this.setState({
      showModal: false
    });

    document.getElementById('people-edit-modal').remove();
  }

  open() {
    this.setState({
      showModal: true
    });
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

    console.log(newrow);

    //this.props.onRowSubmit(newrow);

    e.target.name.value = '';
    e.target.username.value = '';
    e.target.company.value = '';
    e.target.company_role.value = '';
    e.target.phone.value = '';
    e.target.notes.value = '';
    e.target.mobile.value = '';

    return false;
  }

  render() {
    var inputStyle = {padding:'12px'};

    return (
      <div role="dialog">
        <div className="modal-backdrop fade in"></div>
        <div role="dialog" tabIndex="-1" className="fade in modal" style={{display: 'block', paddingLeft: '17px'}}>
          <div className="modal-dialog">
            <div className="modal-content" role="document">
              <div className="modal-header">
                  <button type="button" className="close" aria-label="Close" onClick={this.close.bind(this)}>
                      <span aria-hidden="true">×</span>
                  </button>
                  <h4 className="modal-title">Update A People</h4>
              </div>
              <div className="modal-body">
                <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-people" noValidate="true">
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Name" name="name" value={this.props.company.name} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Username" name="username" value={this.props.company.username} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Company" name="company" value={this.props.company.company} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Company Role" name="company_role" value={this.props.company.company_role} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Phone" name="phone" value={this.props.company.phone} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Notes" name="notes" value={this.props.company.notes} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="text" className="form-control col-md-8" placeholder="Mobile" name="mobile" value={this.props.company.mobile} />
                  </div>
                  <div className="input-group input-group-lg" style={inputStyle}>
                    <input type="submit" className="btn btn-primary" value="Update Company"/>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CompanyEdit;