import React, { Component } from 'react';
import Icon from 'react-fa';
import squish_logo from './assets/img/logo.png';
import PeopleView from './PeopleView';

class People extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      'viewToggle': false,
      fetch: true,
      people: []
    }
  }

  handleRemovePeople(e) {
    e.preventDefault();
    this.props.onPeopleDelete(this.props.people);
    return false;
  }

  handleEditPeople(e) {
    e.preventDefault();
    //this.props.onPeopleEdit(this.props.people);
    return false;
  }

  handleViewToggle() {
    var _toggleState = this.state.viewToggle;
    this.setState({
      'viewToggle': _toggleState === true ? false : true
    });
  }

  handleCheckFetched(check, people=[]) {
    if(check !== undefined) {
      this.setState({
        fetch: false,
        people: people
      });
    } else
      return this.state.fetch;
  }

  render() {
    const _name = this.props.people.name.split(' ');
    const _people = this.state.people.length !== 0 ? this.state.people : this.props.people;

    return (
      <div className="row">
        <div className="col-xs-24" onClick={this.handleViewToggle.bind(this)}>
          <div className="row">
            <div className="col-xs-18">
              <a href="" onClick={this.handleEditPeople.bind(this)} className="link-people">
                {this.props.people.name}
              </a>
              {this.props.people.username !== undefined ? <span> - <a href={"mailto:"+ this.props.people.username}>{this.props.people.username}</a></span> : ''}
            </div>

            <div className="col-xs-6">
              <a href={"https://squish.ish.com.au/issues/?jql=reporter%20%3D%20"+ _name[0] +"%20and%20resolution%20%3D%20Unresolved"} style={{marginRight: '5px'}} target="_blank">
                <img src={squish_logo} width="38px" height="25px" alt="Squish Logo" />
              </a>
              <a href="" onClick={this.handleRemovePeople.bind(this)} style={{marginRight: '5px'}}>
                <Icon name="remove" />
              </a>
            </div>
          </div>
        </div>
        {this.state.viewToggle ?
          <div className="view-people col-xs-24">
            <PeopleView people={_people} checkFetched={this.handleCheckFetched.bind(this)} fetch={this.state.viewToggle} />
          </div> : ''}
      </div>
    );
  }
}

export default People;