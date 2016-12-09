import React, { Component } from 'react';

class Container extends Component {

  render() {
    const className = this.props.className !== undefined ? ' ' + this.props.className : '';
    return (
      <div className={'page-wrapper col-lg-24 ' + className}>
        {this.props.children}
      </div>
    );
  }
}

export default Container;