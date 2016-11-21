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
        <td>
          <a href="" onClick={this.handleEditPeople.bind(this)} className="link-people">
            {this.props.people.name}
          </a>
        </td>

        <td>
          <a href="" onClick={this.handleRemovePeople.bind(this)} style={{marginRight: '5px'}}>
            <Icon name="remove" />
          </a>
        </td>
      </tr>
    );
  }
}

export default People;