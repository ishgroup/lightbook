import React, { Component } from 'react';
import TextInputEdited from '../../components/TextInputEdited';
import PeopleModel from '../../model/PeopleModel';

class PeopleEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      people: {}
    };

    if(this.props.params.id !== undefined) {
      PeopleModel.getPeople(this, this.props.params.id, function(that, response) {
        that.setState({
          people: response.data.output.people
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const id = this.state.people.id;
    const name = e.target.name.value;
    const username = e.target.username.value;
    const company = e.target.company.value;
    const company_role = e.target.company_role.value;
    const phone = e.target.phone.value;
    const notes = e.target.notes.value;
    const mobile = e.target.mobile.value;

    const newrow = {
      id: id,
      name: name,
      username: username,
      company: company,
      company_role: company_role,
      phone: phone,
      notes: notes,
      mobile: mobile
    };

    //this.props.onPeopleEditSubmit(newrow);

    PeopleModel.edit(this, newrow, function(that, response) {
      alert("People updated successfully");
    });

    //Modal.close();
    return false;
  }

  render() {
    const inputStyle = {padding: '12px'};

    return (
      <div className="well">
        {this.state.people.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-people" noValidate="true">
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Name" name="name" ref="name" value={this.state.people.name} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Username" name="username" ref="username" value={this.state.people.username} validate="email" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company" name="company" ref="company" value={this.state.people.company} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company Role" name="company_role" ref="company_role" value={this.state.people.company_role} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone" value={this.state.people.phone} validate="phone" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Notes" name="notes" ref="notes" value={this.state.people.notes} />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <TextInputEdited type="text" className="form-control col-md-8" placeholder="Mobile" name="mobile" ref="mobile" value={this.state.people.mobile} validate="phone" />
            </div>
            <div className="input-group input-group-lg" style={inputStyle}>
              <input type="submit" className="btn btn-primary" value="Update People"/>
            </div>
          </form>
          : '' }
      </div>
    );
  }
}

export default PeopleEdit;