import React, { Component } from "react";

class Row extends Component {
  render() {
    let lClass = (this.props.lClass || "col-sm-"+ (this.props.lWidth || '3') +" text-sm-right");
    let rClass = (this.props.rClass || "col-sm-" + (this.props.rWidth || '21'));

    let item = this.props.item;

    if(this.props.link)
      item = <a href={this.props.link + ':' + item}>{item}</a>;

    return (
      <div>
        {(this.props.item && this.props.item !== 'null') ?
          <div className="form-group row">
            <div className={lClass}>{this.props.label}:</div>
            <div className={rClass}>
              {this.props.children ? this.props.children : item }
            </div>
          </div>
        : ''}
      </div>
    );
  }
}

export default Row;