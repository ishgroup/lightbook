import React, { Component } from "react";
import LoaderImage from "../assets/img/small-loader.svg";

class Util extends Component {
  static Row(label, item, lclass = "col-sm-3 text-sm-right", rclass = "col-sm-21", link="") {
    if(Util.isEmpty(item)) {
      if (link) {
        item = `<a href='${link}:${item}'>${item}</a>`;
      };
      return (
        <div className="form-group row">
          <div className={lclass}>{label}:</div>
          <div className={rclass}>{item}</div>
        </div>
      );
    }
  }

  static numberList(item) {
    let number = [];
    if(item.length > 0) {
      const list = item.split(',');
      list.forEach(function(value) {
        if(value.trim() !== '')
          number.push(value.trim());
      });
    }
    return number;
  }

  static isEmpty(item) {
    return (item !== 'null' && item !== undefined && item !== '');
  }

  static loaderImage(width = 20, className="loader-image") {
    return (
      <img src={LoaderImage} width={width} className={className} alt="loader" />
    );
  }
}

export default Util;