import React, { Component } from 'react';
import People from './People';
import PeopleEdit from './PeopleEdit';
import ReactDOM from 'react-dom';

class PeopleList extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handlePeopleRemove(people) {
    this.props.onPeopleRemove(people);
  }

  handleOnPeopleEditSubmit(newRow) {
    this.block.props.onPeopleEdits(newRow);
  }

  handlePeopleEditOpen(people) {
    ReactDOM.render(
      <PeopleEdit people={people} block={this} onPeopleEditSubmit={this.handleOnPeopleEditSubmit} />,
      document.getElementById('react-modal')
    );

    this.props.onPeopleEdits(people);
  }

  render() {
    var peoples = [];
    var that = this; // TODO: Needs to find out why that = this made it work; Was getting error that onPeopleDelete is not undefined
    this.props.clist.forEach(function(people) {
      peoples.push([<People people={people} onPeopleDelete={that.handlePeopleRemove.bind(that)} onPeopleEdit={that.handlePeopleEditOpen.bind(that)} />]);
    });

    return (
      <div>
        <h3>List of People</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Company</th>
              <th>Company Role</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{peoples}</tbody>
        </table>
      </div>
    );
  }
}

export default PeopleList;