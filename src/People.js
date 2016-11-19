import React, { Component } from 'react';
import Icon from 'react-fa';

class People extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handleRemovePeople(e) {
    e.preventDefault();
    this.props.onPeopleDelete( this.props.people );
    return false;
  }

  handleEditPeople(e) {
    e.preventDefault();
    this.props.onPeopleEdit( this.props.people );
    return false;
  }

  render() {
    return (
      <tr>
        <td>{this.props.people.name}</td>
        <td>{this.props.people.username}</td>
        <td>{this.props.people.company}</td>
        <td>{this.props.people.company_role}</td>
        <td>{this.props.people.phone}</td>
        <td>{this.props.people.notes}</td>
        <td>{this.props.people.mobile}</td>
        <td>
          <a href="" onClick={this.handleEditPeople.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="edit" />
          </a>
          <a href="" onClick={this.handleRemovePeople.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="remove" />
          </a>
        </td>
      </tr>
    );
  }
}

export default People;