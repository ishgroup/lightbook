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
      value: this.refs.inputEditedName.value
    });
  }

  hasTextEdited(e) {
    this.refs.inputEditedName.focus();
    this.setState({
      activeInput: true
    });
  }

  onBlur() {
    this.setState({
      activeInput: false
    })
  }

  getText(valiadte, text) {
    if(valiadte !== undefined && text !== '' && text !== null) {
      if(valiadte === 'email')
        return '<a href="mailto:'+ text +'">'+ text +'</a>';
      if(valiadte === 'phone')
        return '<a href="tel:'+ text +'">'+ text +'</a>';
    } else
      return text;
  }

  render() {
    let textValue = this.getText(this.props.validate, this.state.value);
    let inputTextEmpty = '';
    if(textValue === null || (textValue !== null && textValue.length === 0)) {
      inputTextEmpty = ' text-empty';
      textValue = this.props.placeholder;
    }

    return (
      <div className={'input-box'+ (this.state.activeInput ? ' input-active' : '')}>
        <div className={'input-edited' + inputTextEmpty} onClick={this.hasTextEdited.bind(this)} dangerouslySetInnerHTML={{ __html: textValue }} />
        <input type={this.props.type} name={this.props.name} id={this.props.name} value={this.state.value} ref="inputEditedName" className={'input-tag ' + this.props.className} placeholder={this.props.placeholder} onChange={this.handleChange.bind(this)} onBlur={this.onBlur.bind(this)} />
      </div>
    );
  }
}

export default TextInputEdited;