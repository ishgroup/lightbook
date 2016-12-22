import React, { Component } from "react";

class CheckBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked ? this.props.checked : false
    }
  }

  handleChange() {
    this.setState({
      checked: !this.state.checked
    });
  }

  render() {
    let lClass = (this.props.lClass || "col-sm-"+ (this.props.lWidth || '3') +" text-sm-right");
    let rClass = (this.props.rClass || "col-sm-" + (this.props.rWidth || '21'));

    this.value = this.state.checked;

    return (
      <div className="form-group row">
        <label htmlFor={"input-" + this.props.name}  className={"col-form-label " + lClass}>{this.props.label}</label>
        <div className={rClass}>
          <div className="form-check">
            <label className="form-check-label">
              <input type="checkbox" ref={(item) => { this.item = item; } } className="form-check-input" id={"input-" + this.props.name} name={this.props.name} onChange={this.handleChange.bind(this)} checked={this.state.checked} value="1" />&nbsp;
              {this.props.text}
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default CheckBox;