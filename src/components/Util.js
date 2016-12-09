import React, { Component } from 'react';

class Util extends Component {
  static Row(label, item, lclass = "col-sm-3 text-sm-right", rclass = "col-sm-21") {
    if(Util.isEmpty(item)) {
      return (
        <div className="form-group row">
          <div className={lclass}>{label}:</div>
          <div className={rclass}>{item}</div>
        </div>
      );
    }
  }

  static Phone(number) {
    let phone = null;
    if(Util.isEmpty(number)) {
      phone = [];
      number.forEach(function(value) {
        const _phonePart = value.split(' ');
        if(_phonePart[0] !== null)
          phone.push(['<a href="tel:'+ _phonePart[0] +'">'+ _phonePart[0] +'</a> ' + (_phonePart[1] || '')]);
        else
          phone.push([value]);
      });
    }
    return phone;
  }

  static isEmpty(item) {
    return (item !== 'null' && item !== undefined && item !== '');
  }
}

export default Util;