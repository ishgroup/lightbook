import React, { Component } from 'react';
import Util from '../../components/Util';
import CompanyModel from '../../model/CompanyModel';
import Validate from '../../components/Validate';
import FormField from '../../components/FormField';
import Select from '../../components/Select';

class AddCompany extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      disabledAddBtn: false
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    e.persist();

    const validate = new Validate();
    const phone = Util.numberList(this.refs.phone.item.value);
    const fax = Util.numberList(this.refs.fax.item.value);

    const newrow = {
      name: validate.field('Name', this.refs.name.item).required().value(),
      abn: this.refs.abn.item.value,
      active: this.refs.status.value,
      phone: phone,
      fax: fax,
      street: this.refs.street.item.value,
      suburb: this.refs.suburb.item.value,
      postalCode: this.refs.postalCode.item.value,
      st: this.refs.state.item.value,
      notes: this.refs.notes.item.value
    };

    if(validate.isValidate) {

      this.setState({
        disabledAddBtn: true
      });

      CompanyModel.add(this, newrow, function(that, response) {

        if(response.data.output.validate_company !== undefined) {
          let messages = response.data.output.messages.map(function(message) {
            return Object.values(message);
          }).join("\n");

          alert(messages);
        } else {
          alert('Company added successfully.');
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

  render() {

    return (
      <div className="well">
        <form onSubmit={this.handleSubmit} className="ContactForm" noValidate="true">
          <FormField label="Name" name="name" ref="name" />
          <FormField label="Company code" name="company" ref="company" />
          <FormField label="Abn" name="abn" ref="abn" />
          <FormField label="Phone" name="phone" ref="phone" />
          <FormField label="Fax" name="fax" ref="fax" />
          <FormField label="Street" name="street" ref="street" />
          <FormField label="Suburb" name="suburb" ref="suburb" />
          <FormField label="Postal Code" name="postalCode" ref="postalCode" />
          <FormField label="State" name="state" ref="state" />
          <FormField label="Notes" name="notes" ref="notes" />
          <Select label="Status" name="status" ref="status" options={[ {'Active': 'TRUE'}, {'Inactive': 'FALSE'} ]} selected={'TRUE'} />

          <div className="form-group row">
            <div className="offset-sm-3 col-sm-21">
              <input type="submit" className="btn btn-primary" value="Add Company" disabled={this.state.disabledAddBtn} />&nbsp;
              <input type="button" className="btn btn-secondary" value="Discard changes" onClick={this.goBack.bind(this)} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default AddCompany;
