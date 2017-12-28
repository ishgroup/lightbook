import React, { Component } from 'react';

class TextInputEdited extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      activeInput: false
    }
  }

  handleChange() {
    this.setState({
      value: this.item.value
    });
  }

  hasTextEdited(e) {
    this.item.focus();
    this.setState({
      activeInput: true
    });
  }

  onBlur() {
    this.setState({
      activeInput: false
    });
  }

  onFocus() {
    this.setState({
      activeInput: true
    })
  }

  static linkHtml(item, type) {
    let key = item.replace(/(\D)*|(\s)*/g, "");
    if (type === "mailto")
      key = item.replace(/\s/g, "");

    return <a href={ type + ":" + key } className="mr-1" key={key}>{item.trim()}</a>;
  }

  static linkTo(item, type) {
    let rowItem = [];
		if(typeof item === "string" && item.indexOf(",") === -1) {
			rowItem.push([TextInputEdited.linkHtml(item, type)]);
		} else {
		  if(item.indexOf(",") !== -1) {
				item.split(",").forEach(function (value) {
					rowItem.push([TextInputEdited.linkHtml(value, type)]);
				});
      } else {
				item.forEach(function (value) {
					rowItem.push([TextInputEdited.linkHtml(value, type)]);
				});
			}
		}

		return rowItem;
  }

  static getText(validate, text) {
    if(validate !== undefined && text !== '' && text !== 'null' && text !== undefined) {
      if(validate === 'email')
        return this.linkTo(text, "mailto");
      if(validate === 'phone')
        return this.linkTo(text, "tel");
    } else
      return text;
  }

  render() {
    let textValue = TextInputEdited.getText(this.props.validate, this.state.value);
    let inputTextEmpty = '';

    if(textValue === 'null' || textValue === undefined || (textValue !== 'null' && textValue.length === 0)) {
      inputTextEmpty = ' text-empty';
      textValue = this.props.placeholder;
    }

    return (
      <div className="form-group row">
        <label htmlFor={"input-" + this.props.name}  className="col-sm-3 col-form-label text-sm-right">{this.props.placeholder}</label>
        <div className={'col-sm-21 input-box'+ (this.state.activeInput ? ' input-active' : '')}>
          <div className={'input-edited' + inputTextEmpty} onClick={this.hasTextEdited.bind(this)}>{textValue}</div>
          <input type={this.props.type} name={this.props.name} id={'input-' + this.props.name} value={this.state.value !== 'null' ? this.state.value : ""} ref={(item) => { this.item = item } } className={'input-tag form-control ' + (this.props.className || "")} placeholder={this.props.placeholder} onChange={this.handleChange.bind(this)} onBlur={this.onBlur.bind(this)} onFocus={this.onFocus.bind(this)} />
        </div>
      </div>
    );
  }
}

export default TextInputEdited;
