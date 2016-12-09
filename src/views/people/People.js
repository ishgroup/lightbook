import React, { Component } from 'react';
import squish_logo from '../../assets/img/squish.png';
import Toggle from '../../components/Toggle';
import PeopleView from './PeopleView';
import PeopleModel from '../../model/PeopleModel';

class People extends Component {
  isFetch = true;

  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      'viewToggle': false,
      people: []
    }
  }

  handleViewToggle() {

    const _toggleState = this.state.viewToggle;

    if(this.isFetch !== false && _toggleState === false) {
      PeopleModel.getPeople(this, this.props.people.id, function(that, response) {
        that.setState({
          people: response.data.output.people
        });

        Toggle.Slide(!that.state.viewToggle, 'view-people-'+ that.props.people.id);
      });
    } else {
      Toggle.Slide(this.state.viewToggle, 'view-people-'+ this.props.people.id);
    }

    this.setState({
      'viewToggle': _toggleState === true ? false : true
    });

    this.isFetch = false;
  }

  render() {
    const _name = this.props.people.name.split(' ');
    const _people = this.state.people.length !== 0 ? this.state.people : [];

    return (
      <div className="row">
        <div className="col-xs-24">
          <div className="row">
            <div className="col-xs-18" onClick={this.handleViewToggle.bind(this)}>
              <span className="link-people">
                {this.props.people.name}
              </span>
              {this.props.people.username !== undefined ? <span> - <a href={"mailto:"+ this.props.people.username}>{this.props.people.username}</a></span> : ''}
            </div>
          </div>
        </div>

        <div className={"view-people col-xs-24" + (this.state.viewToggle ? " slide-down" : '')} id={"view-people-" + this.props.people.id}>
          <PeopleView people={_people}>
            <h6>
              People View -
              <a href={"https://squish.ish.com.au/issues/?jql=reporter%20%3D%20"+ _name[0] +"%20and%20resolution%20%3D%20Unresolved"} style={{marginRight: '5px'}} target="_blank">
                <img src={squish_logo} width="38px" height="25px" alt="Squish Logo" />
              </a>
            </h6>
          </PeopleView>

        </div>
      </div>
    );
  }
}

export default People;