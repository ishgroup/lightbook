import React, { Component } from "react";
import LoaderImage from "../assets/img/small-loader.svg";

class Util extends Component {
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

  static loaderImage(width = 20, className="loader-image") {
    return (
      <img src={LoaderImage} width={width} className={className} alt="loader" />
    );
  }
}

export default Util;