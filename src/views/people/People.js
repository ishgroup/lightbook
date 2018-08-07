import React, { Component } from 'react';
import SquishLogo from '../../assets/img/squish.png';
import Toggle from '../../components/Toggle';
import Util from '../../components/Util';
import ViewPeople from './ViewPeople';
import PeopleModel from '../../model/PeopleModel';

class People extends Component {
  isFetch;

  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      viewToggle: false,
      people: [],
      showLoader: false
    }

    this.isFetch = true;
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.viewToggle)
      Toggle.Slide(true, 'view-people-'+ this.props.people.id);

    this.isFetch = true;

    this.setState({
      viewToggle: false,
      showLoader: false
    });
  }

  setLoader(value) {
    this.setState({
      showLoader: value
    });
  }

  handleViewToggle() {

    const _toggleState = this.state.viewToggle;

    if(this.isFetch !== false && _toggleState === false) {
      this.setLoader(true);
      PeopleModel.getPeople(this, this.props.people.id, function(that, response) {
        that.setState({
          people: response.data.output.people
        });

        that.setLoader(false);

        Toggle.Slide(!that.state.viewToggle, 'view-people-'+ that.props.people.id);
      });
    } else {
      Toggle.Slide(this.state.viewToggle, 'view-people-'+ this.props.people.id);
    }

    this.setState({
      viewToggle: ! _toggleState
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
              {this.props.people.company !== undefined ? <span className="company">{this.props.people.company}</span> : ''}
              {this.props.people.auto_add_to_task === true ? <span class="badge badge-primary"> Auto-add </span> : ''}
              {this.props.people.approvers === true ? <span class="badge badge-secondary"> Approver </span> : ''}
            </div>
          </div>
          {this.state.showLoader ? Util.loaderImage() : ''}
        </div>

        <div className={"view-people col-xs-24" + (this.state.viewToggle ? " slide-down" : '')} id={"view-people-" + this.props.people.id}>
          <ViewPeople people={_people}>
            <h6>
              People View -
              <a href={"https://squish.ish.com.au/issues/?jql=reporter%20%3D%20"+ _name[0] +"%20and%20resolution%20%3D%20Unresolved"} style={{marginRight: '5px'}} target="_blank">
                <img src={SquishLogo} width="38px" height="25px" alt="Squish Logo" />
              </a>
            </h6>
          </ViewPeople>

        </div>
      </div>
    );
  }
}

export default People;
