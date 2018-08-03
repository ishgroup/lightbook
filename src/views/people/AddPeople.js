import React, { Component } from 'react';
import Config from '../../Config';
import Util from '../../components/Util';
import PeopleModel from '../../model/PeopleModel';
import Validate from '../../components/Validate';
import FormField from '../../components/FormField';
import AutoComplete from '../../components/AutoComplete';
import Select from '../../components/Select';
import CheckBox from '../../components/CheckBox';

class AddPeople extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      disabledAddBtn: false,
      selectedCompany: ''
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    e.persist();

    const validate = new Validate();

    const newrow = {
      name: validate.field('Name', this.refs.name.item).required().value(),
      email: Util.numberList(validate.field('Email', this.refs.email.item).required().value()),
      username: validate.field('Username', this.refs.username.item).required().value(),
      company: validate.field('Company', this.refs.company.item).required().value(),
      company_role: this.refs.company_role.item.value,
      phone: Util.numberList(this.refs.phone.item.value),
      notes: this.refs.notes.item.value,
      mobile: Util.numberList(this.refs.mobile.item.value),
      active: this.refs.status.value,
      auto_add_to_task: this.refs.auto_add_to_task.value,
      approvers: this.refs.approvers.value
    };

    if(validate.isValidate && this.state.selectedCompany === '') {
      validate.isValidate = false;
      alert('Please select a company from company list.');
      this.refs.company.item.focus();
    }

    if(validate.isValidate) {

      this.setState({
        disabledAddBtn: true
      });

      PeopleModel.add(this, newrow, function(that, response) {
        if(response.data.output.validate_people !== undefined) {
          let messages = response.data.output.messages.map(function(message) {
            return Object.values(message);
          }).join("\n");

          alert(messages);
        } else {
          alert('Person added successfully.');
          e.target.reset();
        }

        that.setState({
          disabledAddBtn: false
        });
      });
    }

    return false;
  }

  goBack() {
    this.props.history.goBack();
  }

  onAutoCompleteClick(text) {
    this.setState({
      selectedCompany: text
    });
  }

  onAutoCompleteKeyUp(text) {
    this.setState({
      selectedCompany: ''
    });
  }

  render() {
    return (
      <div className="well">
        <form onSubmit={this.handleSubmit} className="ContactForm" noValidate="true">
          <FormField label="Name" name="name" ref="name" />
          <FormField label="Email" name="email" ref="email" />
          <FormField label="Username" name="username" ref="username" />

          <div className="form-group row">
            <label htmlFor="input-search" className="col-sm-3 col-form-label text-sm-right">Company</label>
            <div className="col-sm-21">
              <AutoComplete id="input-search" placeholder="Company" url={Config.getUrl('searchCompanies')} ref="company" output="companies" onClick={this.onAutoCompleteClick.bind(this)} onKeyUp={this.onAutoCompleteKeyUp.bind(this)} />
            </div>
          </div>

          <FormField label="Company Role" name="company_role" ref="company_role" />
          <FormField label="Phone" name="phone" ref="phone" />
          <FormField label="Notes" name="notes" ref="notes" />
          <FormField label="Mobile" name="mobile" ref="mobile" />

          <Select ref="status" name="status" label="Status" options={[ {'Active': "TRUE"}, {'Inactive': "FALSE"} ]} selected={"TRUE"} />
          <CheckBox ref="auto_add_to_task" name="auto_add_to_task" text="Auto add to task" checked={false} />
          <CheckBox ref="approvers" name="approvers" text="Allow user to approve quotes" checked={false} />

          <div className="form-group row">
            <div className="offset-sm-3 col-sm-21">
              <input type="submit" className="btn btn-primary" value="Create" disabled={this.state.disabledAddBtn} />&nbsp;
              <input type="button" className="btn btn-secondary" value="Discard changes" onClick={this.goBack.bind(this)} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default AddPeople;
