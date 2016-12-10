import React, { Component } from 'react';
import BaseModel from '../model/BaseModel';

class AutoComplete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterString: '',
      itemList: [],
      showList: true
    }
  }

  doSearch() {
    let searchString = this.item.value;
    this.setState({
      filterString: searchString
    });

    if(this.props.url !== undefined && this.props.url !== '' && searchString !== '') {
      BaseModel.fetch(this, this.props.url + '/' + searchString, function(that, response) {
        if(response.data.output !== undefined) {
          that.setState({
            itemList: response.data.output
          });
        }
      });
    } else {
      this.setState({
        itemList: []
      });
    }
  }

  showList() {
    this.setState({
      showList: true
    });
  }

  setItem(that) {
    that.setState({
      filterString: this.name,
      showList: false
    });
  }

  getList(items) {
    if(items.length > 0) {
      let item = [];

      const that = this;
      items.forEach(function(value) {
        item.push([<li onClick={that.setItem.bind(value, that)}><span>{value.name}</span></li>]);
      });

      if(this.state.showList) {
        return (
          <div id="search-lists">
            <ul>
              {item}
            </ul>
          </div>
        );
      }
    }
  }

  render() {
    const list = this.state.itemList[this.props.output] !== undefined ? this.state.itemList[this.props.output] : [];

    return (
      <div className="auto-complete">
        <input type="text" name="search" ref={(item) => { this.item = item } } placeholder={this.props.placeholder !== undefined ? this.props.placeholder : "Search..."} value={this.state.filterString} onChange={this.doSearch.bind(this)} onClick={this.showList.bind(this)} className="form-control" id="autocomplete-input" />
        {this.getList(list)}
      </div>
    );
  }
}

export default AutoComplete;