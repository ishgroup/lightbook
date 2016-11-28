import React, { Component } from 'react';

class Modal extends Component {

  static _id = '';

  constructor(props) {
    super(props);

    Modal._id = this.props.id;

    this.state = {
      showModal: false
    };

    let className = document.getElementsByTagName('body')[0].className.replace('modal-open', '').replace('  ', ' ');
    className = className.trim() + 'modal-open';
    document.getElementsByTagName('body')[0].setAttribute('class', className.replace('  ', ' ').trim());
  }

  static close() {
    if(document.getElementById(Modal._id) !== null)
      document.getElementById(Modal._id).remove();
    else if(document.getElementById('react-modal') !== null)
      document.getElementById('react-modal').getElementsByTagName('div')[0].remove();

    const className = document.getElementsByTagName('body')[0].className.replace('modal-open', '').replace('  ', ' ');
    document.getElementsByTagName('body')[0].setAttribute('class', className.trim());
  }

  render() {
    let _fullPage = '';
    console.log(this);
    if(this.props.fullPage !== undefined && this.props.fullPage === true)
      _fullPage = ' modal-full-page';

    return (
      <div role="dialog" id={this.props.id} className={_fullPage}>
        <div className="modal-backdrop fade in"></div>
        <div role="dialog" tabIndex="-1" className="fade in modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content" role="document">
              <div className="modal-header">
                <button type="button" className="close" aria-label="Close" data-dismiss="modal" onClick={Modal.close.bind(this)}>
                  <span aria-hidden="true">×</span>
                </button>
                {(this.props.children[0] != null && this.props.children.length > 1) ? this.props.children[0] : '' }
              </div>
              <div className="modal-body">
                {(this.props.children[1] != null && this.props.children.length > 1) ? this.props.children[1] : this.props.children }
              </div>
              {
                ((this.props.children[2] != null && this.props.children.length > 2)) && <div className="modal-footer">{this.props.children[2]}</div>
              }

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class ModalHeader extends Component {
  propTypes: {
    title: React.PropTypes.string.isRequired
  };

  render() {
    return (
      <div>
        <h4 className="modal-title">{ this.props.title }</h4>
        {this.props.children}
      </div>
    );
  }
}

export class ModalFooter extends Modal {
  render() {
    return (
      <div>
          {this.props.children}
      </div>
    );
  }
}

export default Modal;