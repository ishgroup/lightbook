import React, { Component } from 'react';

class Container extends Component {
  static $pageName;
  static setPageName($pageName) {
    Container.pageName = 'page-' + $pageName;
  }

  static getPageName() {
    return Container.pageName;
  }

  render() {
    const className = this.props.className !== undefined ? ' ' + this.props.className : '';
    return (
      <div className={'page-wrapper col-lg-24 ' + Container.getPageName() + className}>
        {this.props.children}
      </div>
    );
  }
}

export default Container;