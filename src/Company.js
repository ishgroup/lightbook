import React, { Component } from 'react';
import Icon from 'react-fa';
import { Link } from 'react-router';

class Company extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleRemovePeople(e) {
    e.preventDefault();
    this.props.onPeopleDelete(this.props.company);
    return false;
  }

  handleEditPeople(e) {
    e.preventDefault();
    this.props.onPeopleEdit(this.props.company);
    return false;
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-18">
          <Link to={"company/" + this.props.company.id} className="link-people">
            {this.props.company.name}
          </Link>
        </div>

        <div className="col-xs-6">
          <a href="" onClick={this.handleRemovePeople.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="remove" />
          </a>
        </div>
      </div>
    );
  }
}

export default Company;