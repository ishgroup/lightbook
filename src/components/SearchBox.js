import React, { Component } from 'react';

class SearchBox extends Component {
  constructor(props) {
    super(props);

    let searchQuery = new URLSearchParams(this.props.block.props.location.search).get('q');

    this.state = {
      filterString: searchQuery !== null ? searchQuery : '',
      isTextChanged: false
    }
  }
  doSearch() {
    this.setState({
      filterString: this.refs.searchInput.value,
      isTextChanged: true
    });
  }

  onKeyUp() {
    if(this.state.isTextChanged === true) {
      this.props.doSearch(this.refs.searchInput.value);
    }

    this.setState({
      isTextChanged: false
    });
  }

  render() {
    const inputStyle = {padding: '10px'};

    return (
      <div className="row">
        <div className="input-group input-group-lg" style={inputStyle}>
          <input type="text" ref="searchInput" className="form-control col-md-24" placeholder="Search..." value={this.state.filterString} name="search_input" onChange={this.doSearch.bind(this)} onKeyUp={this.onKeyUp.bind(this)} />
        </div>
      </div>
    );
  }
}

export default SearchBox;
