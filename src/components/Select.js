import React, { Component } from "react";
import PropTypes from 'prop-types';

class Select extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    }
  }

  option(value, item) {
    return <option value={value[item] || ""}>{item}</option>;
  }

  groupOptions(items=[], label = "") {
    return (
      <optgroup label={label}>
        {items}
      </optgroup>
    );
  }

  getOptions(value) {
    const that = this;
    let children = [];

    value.forEach(function(value) {
      let items = Object.keys(value).map(function(item) {
        if(Array.isArray(value[item])) {
          return that.groupOptions(that.getOptions(value[item]), item);
        } else {
          return that.option(value, item);
        }
      });
      children.push([items]);
    });
    return children;
  }

  handleChange() {
    let items = [];
    if(this.item.type === 'select-one') {
      items.push(this.item.value);

      this.setState({
        selected: this.item.value
      });
    } else {
      for (var item of this.item.selectedOptions) {
        items.push(item.value);
      }

      this.setState({
        selected: items
      });
    }

    if(this.props.onChange !== undefined) {
      this.props.onChange(items);
    }
  }

  render() {
    let lClass = (this.props.lClass || "col-sm-"+ (this.props.lWidth || '3') +" text-sm-right");
    let rClass = (this.props.rClass || "col-sm-" + (this.props.rWidth || '21'));

    let child = this.getOptions(this.props.options);

    this.value = this.state.selected;

    return (
      <div className="form-group row">
        <label htmlFor={"input-" + this.props.name}  className={"col-form-label " + lClass}>{this.props.label}</label>
        <div className={rClass}>
          <select ref={(item) => { this.item = item; } } multiple={this.props.multiple} className="form-control" id={"input-" + this.props.name} name={this.props.name} onChange={this.handleChange.bind(this)} defaultValue={this.value} disabled={this.props.disabled}>
            {this.props.default ? this.option([], this.props.default) : ''}
            {child}
          </select>
        </div>
      </div>
    );
  }
}

Select.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired
}

export default Select;