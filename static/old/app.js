'use strict';

var CompanyApp = React.createClass({
  displayName: 'CompanyApp',

  getInitialState: function getInitialState() {
    return { companylist: this.props.companies };
  },
  handleNewRowSubmit: function handleNewRowSubmit(newcompany) {
    this.setState({ companylist: this.state.companylist.concat([newcompany]) });
  },
  handleCompanyRemove: function handleCompanyRemove(company) {

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
  },
  render: function render() {
    var tableStyle = { width: '100%' };
    var leftTdStyle = { width: '50%', padding: '20px', verticalAlign: 'top' };
    var rightTdStyle = { width: '50%', padding: '20px', verticalAlign: 'top' };
    return React.createElement(
      'table',
      { style: tableStyle },
      React.createElement(
        'tr',
        null,
        React.createElement(
          'td',
          { style: leftTdStyle },
          React.createElement(CompanyList, { clist: this.state.companylist, onCompanyRemove: this.handleCompanyRemove })
        ),
        React.createElement(
          'td',
          { style: rightTdStyle },
          React.createElement(NewRow, { onRowSubmit: this.handleNewRowSubmit })
        )
      )
    );
  }
});

var CompanyList = React.createClass({
  displayName: 'CompanyList',

  handleCompanyRemove: function handleCompanyRemove(company) {
    this.props.onCompanyRemove(company);
  },
  render: function render() {
    var companies = [];
    var that = this; // TODO: Needs to find out why that = this made it work; Was getting error that onCompanyDelete is not undefined
    this.props.clist.forEach(function (company) {
      companies.push(React.createElement(Company, { company: company, onCompanyDelete: that.handleCompanyRemove }));
    });
    return React.createElement(
      'div',
      null,
      React.createElement(
        'h3',
        null,
        'List of People'
      ),
      React.createElement(
        'table',
        { className: 'table table-striped' },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'th',
              null,
              'Name'
            ),
            React.createElement(
              'th',
              null,
              'Username'
            ),
            React.createElement(
              'th',
              null,
              'Company'
            ),
            React.createElement(
              'th',
              null,
              'Company Role'
            ),
            React.createElement(
              'th',
              null,
              'Phone'
            ),
            React.createElement(
              'th',
              null,
              'Notes'
            ),
            React.createElement(
              'th',
              null,
              'Mobile'
            ),
            React.createElement(
              'th',
              null,
              'Action'
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          companies
        )
      )
    );
  }
});

var Company = React.createClass({
  displayName: 'Company',

  handleRemoveCompany: function handleRemoveCompany() {
    this.props.onCompanyDelete(this.props.company);
    return false;
  },
  render: function render() {
    return React.createElement(
      'tr',
      null,
      React.createElement(
        'td',
        null,
        this.props.company.name
      ),
      React.createElement(
        'td',
        null,
        this.props.company.username
      ),
      React.createElement(
        'td',
        null,
        this.props.company.company
      ),
      React.createElement(
        'td',
        null,
        this.props.company.company_role
      ),
      React.createElement(
        'td',
        null,
        this.props.company.phone
      ),
      React.createElement(
        'td',
        null,
        this.props.company.notes
      ),
      React.createElement(
        'td',
        null,
        this.props.company.mobile
      ),
      React.createElement(
        'td',
        null,
        React.createElement('input', { type: 'button', className: 'btn btn-primary', value: 'Remove', onClick: this.handleRemoveCompany })
      )
    );
  }
});

var NewRow = React.createClass({
  displayName: 'NewRow',

  handleSubmit: function handleSubmit(e) {
    e.preventDefault();
    console.log(this.refs.name.value);
    var name = this.refs.name.value;
    var username = this.refs.username.value;
    var company = this.refs.company.value;
    var company_role = this.refs.company_role.value;
    var phone = this.refs.phone.value;
    var notes = this.refs.notes.value;
    var mobile = this.refs.mobile.value;

    var newrow = {
      name: name,
      username: username,
      company: company,
      company_role: company_role,
      phone: phone,
      notes: notes,
      mobile: mobile
    };

    this.props.onRowSubmit(newrow);

    this.refs.name.value = '';
    this.refs.username.value = '';
    this.refs.company.value = '';
    this.refs.company_role.value = '';
    this.refs.phone.value = '';
    this.refs.notes.value = '';
    this.refs.mobile.value = '';

    return false;
  },
  render: function render() {
    var inputStyle = { padding: '12px' };

    return React.createElement(
      'div',
      { className: 'well' },
      React.createElement(
        'h3',
        null,
        'Add A People'
      ),
      React.createElement(
        'form',
        { onSubmit: this.handleSubmit, className: 'ContactForm', noValidate: true },
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Name', ref: 'name' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Username', ref: 'username' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Company', ref: 'company' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Company Role', ref: 'company_role' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Phone', ref: 'phone' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('textarea', { type: 'text', className: 'form-control col-md-8', placeholder: 'Notes', ref: 'notes' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'text', className: 'form-control col-md-8', placeholder: 'Mobile', ref: 'mobile' })
        ),
        React.createElement(
          'div',
          { className: 'input-group input-group-lg', style: inputStyle },
          React.createElement('input', { type: 'submit', className: 'btn btn-primary', value: 'Add Company' })
        )
      )
    );
  }
});