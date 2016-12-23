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

  static getText(validate, text) {
    if(validate !== undefined && text !== '' && text !== 'null' && text !== undefined) {
      if(validate === 'email')
        return <a href={"mailto:"+ text}>{text}</a>;
      if(validate === 'phone')
        return <a href={"tel:"+ text}>{text}</a>;
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