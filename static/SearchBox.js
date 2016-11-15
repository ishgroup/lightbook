import React, { Component } from 'react';
import Icon from 'react-fa';

class SearchBox extends Component {
  doSearch() {
    this.props.doSearch(this.refs.searchInput.value);
  }

  showAddForm(e) {
    e.preventDefault();
    console.log(this);
    this.props.block.showAddForm();
  }

  render() {
    var inputStyle = {padding:'12px'};

    return (
      <div className="row">
        <div className="col-xs-20">
          <div className="input-group input-group-lg" style={inputStyle}>
            <input type="text" ref="searchInput" className="form-control col-md-8"  placeholder="Saerch..." value={this.props.filterString} name="search_input" onChange={this.doSearch.bind(this)} />
          </div>
        </div>
        <div className="col-xs-4 add-link" style={{padding: '23px'}}>
          <a href="" onClick={this.showAddForm.bind(this)}>
            <Icon name="user-plus" />
          </a>
        </div>
      </div>
    );
  }
}

export default SearchBox;