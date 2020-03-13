import React, { Component } from 'react';
import Config from '../../Config';
import TextInputEdited from '../../components/TextInputEdited';
import Util from '../../components/Util';
import Validate from '../../components/Validate';
import AutoComplete from '../../components/AutoComplete';
import Select from '../../components/Select';
import CheckBox from '../../components/CheckBox';
import PeopleModel from '../../model/PeopleModel';

class EditPeople extends Component {

  constructor(props) {
    super(props);
    this.state = {
      people: {},
      disabledUpdateBtn: false,
      disabledRemoveBtn: false,
      showLoader: true,
      enabledAutoAddToTask: true,
      enabledAutoAddToApprovers: true,
      enabledUnsubscribed: true,
      selectedCompany: ''
    };

    if(this.props.match.params.id !== undefined) {
      PeopleModel.getPeople(this, this.props.match.params.id, function(that, response) {
        that.setState({
          people: response.data.output.people,
          showLoader: false,
          enabledAutoAddToTask: (response.data.output.people.active === true ? true : false),
          enabledAutoAddToApprovers: (response.data.output.people.active === true ? true : false),
          enabledUnsubscribed: (response.data.output.people.active === true ? true : false),
          selectedCompany: response.data.output.people.company
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const validate = new Validate();

    const newrow = {
      id: this.state.people.id,
      name: validate.field('Name', this.refs.name.item).required().value(),
      email: Util.numberList(validate.field('Email', this.refs.email.item).required().value()),
      username: validate.field('Username', this.refs.username.item).required().value(),
      company: this.refs.company.item.value,
      company_role: this.refs.company_role.item.value,
      phone: Util.numberList(this.refs.phone.item.value),
      notes: this.refs.notes.item.value,
      mobile: Util.numberList(this.refs.mobile.item.value),
      active: this.refs.status.value
    };

    if(this.refs.auto_add_to_task !== undefined) {
      newrow['auto_add_to_task'] = this.refs.auto_add_to_task.value;
    }

    if(this.refs.approvers !== undefined) {
          newrow['approvers'] = this.refs.approvers.value;
        }
    if(this.refs.unsubscribed !== undefined) {
              newrow['unsubscribed'] = this.refs.unsubscribed.value;
            }

    if(validate.isValidate && this.state.selectedCompany === '') {
      validate.isValidate = false;
      alert('Please select a company from company list.');
      this.refs.company.item.focus();
    }

    if(validate.isValidate) {
      this.setState({
        disabledUpdateBtn: true
      });

      PeopleModel.edit(this, newrow, function(that, response) {
        that.setState({
          disabledUpdateBtn: false
        });
      });
    }

    return false;
  }

  handleRemovePeople() {
    if(window.confirm('Are you sure you want to delete this person?')) {
      this.setState({
        disabledRemoveBtn: true
      });

      PeopleModel.delete(this, this.state.people.id, function(that, response) {
        that.setState({
          disabledRemoveBtn: false
        });

        if(response.data.output.message !== undefined) {
          alert(response.data.output.message);
          that.goBack();
        }
      });
    }
  }

  onStatusChange(item) {
    if(item[0] === "FALSE") {
      this.setState({
        enabledAutoAddToTask: false
      });
       this.setState({
               enabledAutoAddToApprovers: false
             });
    } else {
      this.setState({
        enabledAutoAddToTask: true
      });
       this.setState({
               enabledAutoAddToApprovers: true
             });
    }
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
        {this.state.showLoader ?
          <div className="alert alert-info" role="alert">
            {Util.loaderImage()}&nbsp;Please wait while fetching people details.
          </div>
          : '' }
        {this.state.people.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-people" noValidate={true}>
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Name" name="name" ref="name" value={this.state.people.name} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Email" name="email" ref="email" value={this.state.people.email || ''} validate="email" />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Username" name="username" ref="username" value={this.state.people.username || ''} validate="email" />

            <div className="form-group row">
              <label htmlFor="input-search" className="col-sm-3 col-form-label text-sm-right">Company</label>
              <div className="col-sm-21">
                <AutoComplete id="input-search" value={this.state.people.company || ''} placeholder="Company" url={Config.getUrl('searchCompanies')} ref="company" output="companies" onClick={this.onAutoCompleteClick.bind(this)} onKeyUp={this.onAutoCompleteKeyUp.bind(this)} />
              </div>
            </div>

            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Company Role" name="company_role" ref="company_role" value={this.state.people.company_role || ''} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Phone" name="phone" ref="phone" value={this.state.people.phone || ''} validate="phone" />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Notes" name="notes" ref="notes" value={this.state.people.notes || ''} />
            <TextInputEdited type="text" className="form-control col-md-8" placeholder="Mobile" name="mobile" ref="mobile" value={this.state.people.mobile || ''} validate="phone" />

            <Select ref="status" name="status" label="Status" options={[ {'Active': "true"}, {'Inactive': "false"} ]} selected={this.state.people.active || ''} onChange={this.onStatusChange.bind(this)} />
            {this.state.enabledAutoAddToTask ?
              <CheckBox ref="auto_add_to_task" name="auto_add_to_task" text="Auto add to task" checked={this.state.people.auto_add_to_task || false} />
            : ''}
            {this.state.enabledAutoAddToApprovers ?
                          <CheckBox ref="approvers" name="approvers" text="Allow user to approve quotes" checked={this.state.people.approvers || false}/>
            : ''}
            {this.state.enabledUnsubscribed ?
                                      <CheckBox ref="unsubscribed" name="unsubscribed" text="Do not send email to this user" checked={this.state.people.unsubscribed || false}/>
                        : ''}

            <div className="form-group row">
              <div className="offset-sm-3 col-sm-21">
                <input type="submit" className="btn btn-primary" value="Update" disabled={this.state.disabledUpdateBtn} />&nbsp;
                <input type="button" className="btn btn-secondary" value="Discard changes" onClick={this.goBack.bind(this)} />&nbsp;
                <input type="button" className="btn btn-danger" value="Delete" onClick={this.handleRemovePeople.bind(this)} disabled={this.state.disabledRemoveBtn} />
              </div>
            </div>
          </form>
          : '' }
      </div>
    );
  }
}

export default EditPeople;
