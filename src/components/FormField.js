import React, { Component } from 'react';

class FormField extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }
  }

  handleChange() {
    if(this.props.value !== undefined) {
      this.setState({
        value: this.item.value
      });
    }
  }

  render() {
    return (
      <div className="form-group row">
        <label htmlFor={"input-" + this.props.name}  className="col-sm-3 col-form-label text-sm-right">{this.props.label}</label>
        <div className="col-sm-21">
          <input type="text" name={this.props.name} value={this.state.value} id={"input-" + this.props.name} placeholder={this.props.label} ref={(item) => { this.item = item} } onChange={this.handleChange.bind(this)} className="form-control" />
        </div>
      </div>
    );
  }
}

export default FormField;