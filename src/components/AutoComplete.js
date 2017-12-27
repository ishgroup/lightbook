import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BaseModel from '../model/BaseModel';
import Util from './Util';

class AutoComplete extends Component {
  checkMounted;

  constructor(props) {
    super(props);

    this.state = {
      filterString: (this.props.value !== undefined ? this.props.value : ''),
      selectedItem: [],
      itemList: [],
      showList: true,
      showLoader: false,
      isTextChanged: false,
      isSearched: false
    }

    this.checkMounted = false;
  }

  componentWillUnmount() {
    this.checkMounted = false;
  }

  componentDidMount() {
    const that = this;
    this.checkMounted = true;

    document.body.addEventListener('click', function(e) {
      if(that.checkMounted) {
        const id = AutoComplete.getId(that.props.id);
        if(e.target !== (document.getElementById(id) || document.getElementById('searched-items-' + id))) {
          if(e.target.parentElement.parentElement !== document.getElementById('searched-items-' + id)
            && e.target.parentElement.parentElement !== document.getElementById('search-lists-' + id)
            && e.target.parentElement !== document.getElementById('search-lists-' + id)) {
              that.hideList();
          }
        }
      }
    });
  }

  static getId(id) {
    return ((id !== undefined && id !== '') ? id : 'autocomplete-input');
  }

  doSearch() {
    let searchString = this.item.value;

    this.setState({
      filterString: searchString,
      isTextChanged: true
    });
  }

  showList() {
    this.setState({
      showList: true
    });
  }

  hideList() {
    this.setState({
      showList: false
    });
  }

  onBlur(e) {
    if(e.relatedTarget !== null)
      this.hideList();
  }

  onFocus() {
    this.item.select();
    if(this.item.value.length > 0) {
      this.setState({
        showList: true
      });
    }
  }

  onKeyUp() {
    if(this.state.isTextChanged === true) {
      const searchString = this.state.filterString;

      if(this.props.onKeyUp !== undefined) {
        this.props.onKeyUp(searchString);
      }

      if(this.props.url !== undefined && this.props.url !== '' && searchString !== '' && this.props.output) {
        this.setState({
          showLoader: true
        });

        BaseModel.fetch(this, this.props.url + '/' + searchString, function(that, response) {
          if(response.data.output !== undefined) {
            that.setState({
              itemList: response.data.output,
              showLoader: false,
              showList: true,
              isSearched: true
            });
          }
        });
      } else {
        this.setState({
          itemList: []
        });
      }
    }

    if(this.state.filterString.length === 0)
      this.hideList();

    this.setState({
      isTextChanged: false
    });
  }

  setItem(that) {
    that.setState({
      filterString: this.name,
      showList: false,
      selectedItem: this
    });

    if(that.props.onClick !== undefined) {
      that.props.onClick(this.name);
    }
  }

  getList(items) {
    if(items.length > 0) {
      let item = [];

      const that = this;
      items.forEach(function(value) {
        const activeItem = (value === that.state.selectedItem ? ' active-item' : '');
        item.push([<li onClick={that.setItem.bind(value, that)} className={"auto-list-item" + activeItem} ><span>{value.name}</span></li>]);
      });

      if(this.state.showList) {
        return (
          <div id={"search-lists-" + AutoComplete.getId(this.props.id)} className="search-lists">
            <ul id={"searched-items-" + AutoComplete.getId(this.props.id)} className="searched-items">
              {item}
            </ul>
          </div>
        );
      }
    } else if(this.state.showList && this.state.filterString.length > 0 && !this.state.showLoader && this.state.isSearched) {
      return (
        <div id="search-lists-no-match" className="search-lists">
          <ul id="searched-items-no-match" className="searched-items">
            <li>No match found</li>
          </ul>
        </div>
      );
    }
  }

  render() {
    const list = this.state.itemList[this.props.output] !== undefined ? this.state.itemList[this.props.output] : [];

    return (
      <div className="auto-complete">
        <input type="text" name="search" ref={(item) => { this.item = item } } placeholder={this.props.placeholder !== undefined ? this.props.placeholder : "Search..."} value={this.state.filterString} onChange={this.doSearch.bind(this)} onKeyUp={this.onKeyUp.bind(this)} onClick={this.showList.bind(this)} onBlur={this.onBlur.bind(this)} onFocus={this.onFocus.bind(this)} className="form-control" id={AutoComplete.getId(this.props.id)} autoComplete="off" />
        {this.state.showLoader ? Util.loaderImage() : ''}
        {this.getList(list)}
      </div>
    );
  }
}

AutoComplete.propTypes = {
  output: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
};

export default AutoComplete;
