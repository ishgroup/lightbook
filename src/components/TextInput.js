import React, { Component } from 'react';

class TextInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }
  }

  handleChange() {
    this.setState({
      value: this.refs.inputName.value
    });
  }

  render() {
    return (
      <input type={this.props.type} name={this.props.name} value={this.state.value} ref="inputName" className={this.props.className} placeholder={this.props.placeholder} onChange={this.handleChange.bind(this)} />
    );
  }
}

export default TextInput;