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

    const newrow = {
      id: this.state.people.id,
      name: this.refs.name.item.value,
      username: this.refs.username.item.value,
      company: this.refs.company.item.value,
      company_role: this.refs.company_role.item.value,
      phone: this.refs.phone.item.value,
      notes: this.refs.notes.item.value,
      mobile: this.refs.mobile.item.value
    };

    PeopleModel.edit(this, newrow, function(that, response) {
      alert("People updated successfully");
    });

    return false;
  }

  hideAddForm() {
    this.props.router.goBack();
  }

  render() {

    return (
      <div className="well">
        {this.state.people.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-people" noValidate="true">
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Name" name="name" ref="name" value={this.state.people.name} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Email" name="email" ref="email" value={this.state.people.email || ''} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Username" name="username" ref="username" value={this.state.people.username || ''} validate="email" />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company" name="company" ref="company" value={this.state.people.company || ''}  />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company Role" name="company_role" ref="company_role" value={this.state.people.company_role || ''} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone" value={this.state.people.phone || ''} validate="phone" />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Notes" name="notes" ref="notes" value={this.state.people.notes || ''} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Mobile" name="mobile" ref="mobile" value={this.state.people.mobile || ''} validate="phone" />

            <div className="form-group row">
              <div className="offset-sm-3 col-sm-21">
                <input type="submit" className="btn btn-primary" value="Update"/>&nbsp;
                <input type="button" className="btn btn-primary" value="Close" onClick={this.hideAddForm.bind(this)} />
              </div>
            </div>
          </form>
          : '' }
      </div>
    );
  }
}

export default PeopleEdit;