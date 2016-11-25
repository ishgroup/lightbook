import React, { Component } from 'react';

class SearchBox extends Component {
  doSearch() {
    this.props.doSearch(this.refs.searchInput.value);
  }

  render() {
    var inputStyle = {padding:'10px'};

    return (
      <div className="row">
        <div className="input-group input-group-lg" style={inputStyle}>
          <input type="text" ref="searchInput" className="form-control col-md-24" placeholder="Search..." value={this.props.filterString} name="search_input" onChange={this.doSearch.bind(this)} />
        </div>
      </div>
    );
  }
}

export default SearchBox;