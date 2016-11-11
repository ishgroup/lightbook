import React, { Component } from 'react';
import CompanyList from './CompanyList';
import NewRow from './NewRow';

class CompanyApp extends Component {
  constructor(props) {
     super(props);
     this.state = {
        companylist: this.props.companies
     }

     this.onRowSubmit = this.handleNewRowSubmit.bind(this);
     this.onCompanyRemove = this.handleCompanyRemove.bind(this);
  }

  handleNewRowSubmit(newcompany) {
    console.log(this.state.companylist);
    this.setState({ companylist: this.state.companylist.concat([newcompany]) });
  }

  handleCompanyRemove(company) {
    var index = -1;
    var clength = this.state.companylist.length;
    for (var i = 0; i < clength; i++) {
      if (this.state.companylist[i].name === company.name) {
      index = i;
      break;
      }
    }
    this.state.companylist.splice(index, 1);
    this.setState({ companylist: this.state.companylist });
  }

  render() {
    var tableStyle = {width: '100%'};
    var leftTdStyle = {width: '50%',padding:'20px',verticalAlign: 'top'};
    var rightTdStyle = {width: '50%',padding:'20px',verticalAlign: 'top'};
    console.log(this.props.companies);
    return (
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={leftTdStyle}>
              <CompanyList clist={this.state.companylist}  onCompanyRemove={this.handleCompanyRemove} />
            </td>
            <td style={rightTdStyle}>
              <NewRow onRowSubmit={this.handleNewRowSubmit}/>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
};

export default CompanyApp;