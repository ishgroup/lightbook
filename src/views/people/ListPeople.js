import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

import People from './People';
import EditPeople from './EditPeople';
import PeopleModel from '../../model/PeopleModel';
import ListView from '../../components/ListView';
import Util from '../../components/Util';
import Toggle from '../../components/Toggle';
import ViewCompany from '../company/ViewCompany';
import CompanyModel from '../../model/CompanyModel';

class ListPeople extends Component {
  constructor(props) {
    super(props);

    this.state = {
      company: null,
      peoplelist: [],
      showLoader: true,
      viewToggle: false
    };

    if(this.props.params.id !== undefined) {
      CompanyModel.getCompany(this, this.props.params.id, function(that, response) {
        that.setState({
          company: response.data.output.company
        });
      });

      PeopleModel.getList(this, this.props.params, function(that, response) {
        if(response.data.peoples !== undefined) {
          that.setState({
            peoplelist: response.data.peoples,
            showLoader: false
          });
        }
      });
    } else {
      this.state = {
        peoplelist: this.props.list
      };
    }

    this.onRowSubmit = this.handleNewRowSubmit.bind(this);
    this.onPeopleRemove = this.handlePeopleRemove.bind(this);
    this.onPeopleEdits = this.handlePeopleEdit.bind(this);
  }

  handleNewRowSubmit(newPeople) {
    let _total = this.block.state.peoplelist.length;
    newPeople['id'] = ++_total;
    this.block.setState({ peoplelist: this.block.state.peoplelist.concat([newPeople]) });
  }

  handlePeopleRemove(people) {
    if(!window.confirm('Are you sure you want to delete this people?'))
      return false;

    let index = -1;
    const clength = this.block.state.peoplelist.length;
    for (let i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].name === people.name) {
      index = i;
      break;
      }
    }
    this.block.state.peoplelist.splice(index, 1);
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  handlePeopleEdit(people) {
    const clength = this.block.state.peoplelist.length;
    for (let i = 0; i < clength; i++) {
      if (this.block.state.peoplelist[i].id === people.id) {
        this.block.state.peoplelist[i] = people;
        break;
      }
    }
    this.block.setState({ peoplelist: this.block.state.peoplelist });
  }

  close() {
    this.setState({ showModal: false });
  }

  handlePeopleEditOpen(item) {
    PeopleModel.getPeople(this, item.id, function(that, response) {
      ReactDOM.render(
        <EditPeople people={response.data.output.people} block={that} onPeopleEditSubmit={that.handlePeopleEdit} />,
        document.getElementById('react-modal')
      );
    });
  }

  static renderPeople(block, item) {
    return <People people={item} onPeopleDelete={block.handleRemove.bind(block)} onPeopleEdit={block.handleEditOpen.bind(block)} />;
  }

  handleViewToggle(e) {
    e.preventDefault();
    Toggle.Slide(this.state.viewToggle, 'view-company-'+ this.state.company.id);

    this.setState({
      viewToggle: ! this.state.viewToggle
    });
  }

  render() {
    const _plist = this.state.peoplelist;

    return (
      <div className="people-list">
        <p>
          <Link to={"/company/" + this.props.params.id} className="btn btn-outline-primary" onClick={this.handleViewToggle.bind(this)}>View Company</Link>&nbsp;
          {this.props.params.status === undefined ?
            <Link to={"/company/" + this.props.params.id + "/inactive"} className="btn btn-outline-primary">View inactive users</Link>
          : <Link to={"/company/" + this.props.params.id} className="btn btn-outline-primary">View active users</Link>
          }
        </p>

        {this.state.company !== null ?
          <div className={"view-company col-xs-24" + (this.state.viewToggle ? " slide-down" : '')} id={"view-company-" + this.state.company.id}>
            <ViewCompany company={this.state.company} />
          </div>
        : ''}
        <div className="clearfix" />
        <p style={(this.state.viewToggle ? {display: "block"} : {display: "none"})}>&nbsp;</p>
        {this.state.showLoader ?
          <div className="alert alert-info" role="alert">
            {Util.loaderImage()}&nbsp;Please wait while fetching person(s).
          </div>
          : '' }
        {_plist.length !== 0 ?
          <div className="clearfix">
            <ListView list={_plist} onRemove={this.handlePeopleRemove} onEdits={this.handlePeopleEditOpen.bind(this)} block={this} item={ListPeople.renderPeople} />
          </div>

        : (!this.state.showLoader ?
            <div className="alert alert-info" role="alert">
              People not found under this company.
            </div>
          : '')
        }
      </div>
    );
  }
}

export default ListPeople;
