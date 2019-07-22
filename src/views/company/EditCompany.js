import React, { Component } from 'react';
import TextInputEdited from '../../components/TextInputEdited';
import Util from '../../components/Util';
import Validate from '../../components/Validate';
import Select from '../../components/Select';
import CompanyModel from '../../model/CompanyModel';

class EditCompany extends Component {

  constructor(props) {
    super(props);
    this.state = {
      company: {},
      disabledUpdateBtn: false,
      disabledRemoveBtn: false,
      showLoader: true
    };

    if(this.props.match.params.id !== undefined) {
      CompanyModel.getCompany(this, this.props.match.params.id, function(that, response) {
        that.setState({
          company: response.data.output.company,
          showLoader: false
        });
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const id = this.state.company.id;

    const validate = new Validate();
    const phone = Util.numberList(this.refs.phone.item.value);
    const fax = Util.numberList(this.refs.fax.item.value);

    const newrow = {
      id: id,
      name: validate.field('Name', this.refs.name.item).required().value(),
      company: this.refs.company.item.value,
      sla: this.refs.sla.item.value,
      abn: this.refs.abn.item.value,
      active: this.refs.status.value,
      phone: phone,
      fax: fax,
      street: this.refs.street.item.value,
      suburb: this.refs.suburb.item.value,
      postalCode: this.refs.postalCode.item.value,
      state: this.refs.state.item.value,
      notes: this.refs.notes.item.value
    };

    if(validate.isValidate) {
      this.setState({
        disabledUpdateBtn: true
      });

      CompanyModel.edit(this, newrow, function(that, response) {
        alert("Company updated successfully");

        that.setState({
          disabledUpdateBtn: false
        });
      });
    }

    return false;
  }

  goBack() {
    this.props.history.goBack();
  }

  handleRemoveCompany() {
    if(window.confirm('Are you sure you want to delete this company?')) {
      this.setState({
        disabledRemoveBtn: true
      });

      CompanyModel.delete(this, this.state.company.id, function(that, response) {
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

  render() {

    return (
      <div className="well">
        {this.state.showLoader ?
          <div className="alert alert-info" role="alert">
            {Util.loaderImage()}&nbsp;Please wait while fetching company details.
          </div>
          : '' }
        {this.state.company.name !== undefined ?
          <form onSubmit={this.handleSubmit.bind(this)} className="ContactForm edit-company" noValidate={true}>

            <TextInputEdited type="text" placeholder="Name" name="name" ref="name" value={this.state.company.name} />
            <TextInputEdited type="text" placeholder="Company code" name="company" ref="company" value={this.state.company.company} />
            <TextInputEdited type="text" placeholder="Service Level" name="sla" ref="sla" value={this.state.company.sla} />
            <TextInputEdited type="text" placeholder="Abn" name="abn" ref="abn" value={this.state.company.abn} />
            <TextInputEdited type="text" placeholder="Phone" name="phone" ref="phone" value={this.state.company.phone} validate="phone" />
            <TextInputEdited type="text" placeholder="Fax" name="fax" ref="fax" value={this.state.company.fax} validate="phone" />
            <TextInputEdited type="text" placeholder="Street" name="street" ref="street" value={this.state.company.street} />
            <TextInputEdited type="text" placeholder="Suburb" name="suburb" ref="suburb" value={this.state.company.suburb} />
            <TextInputEdited type="text" placeholder="Postal Code" name="postalCode" ref="postalCode" value={this.state.company.postalCode} />
            <TextInputEdited type="text" placeholder="State" name="state" ref="state" value={this.state.company.state} />
            <TextInputEdited type="text" placeholder="Notes" name="notes" ref="notes" value={this.state.company.notes} />

            <Select label="Status" name="status" ref="status" options={[ {'Active': 'TRUE'}, {'Inactive': 'FALSE'} ]} selected={this.state.company.active} />

            <div className="form-group row">
              <div className="offset-sm-3 col-sm-21">
                <input type="submit" className="btn btn-primary" value="Update Company" disabled={this.state.disabledUpdateBtn} />&nbsp;
                <input type="button" className="btn btn-secondary" value="Discard changes" onClick={this.goBack.bind(this)} />&nbsp;
                <input type="button" className="btn btn-danger" value="Remove" onClick={this.handleRemoveCompany.bind(this)} disabled={this.state.disabledRemoveBtn} />
              </div>
            </div>

          </form>
        : ''}
      </div>
    );
  }
}

export default EditCompany;
