'use strict';

require.config({
    paths: {
        assets: '/assets/js'
    }
});

var { Router,
      Route,
      IndexRoute,
      IndexLink,
      Link, browserHistory } = ReactRouter;

require(['App', 'assets/js/home.js'], function(App, Home) {
    console.log(App);

    console.log(ReactRouter);

    var defCompanies = [
      {
        name: 'Chintan Kotadia',
        username:'chintankotadia13@gmail.com',
        company: 'ish',
        company_role:'html/css coder',
        phone:'49874646',
        notes:'My notes',
        mobile:'9497654654'
      },
      {
        name: 'Marcus Hodgson',
        username:'marcus@ish.com',
        company: 'ish',
        company_role:'developer',
        phone:'987897544',
        notes:'Not available',
        mobile:'9797464876'
      },
      {
        name: 'Stephen McIlwaine',
        username:'Stephen@ish.com',
        company: 'ish',
        company_role:'java developer',
        phone:'5464979646',
        notes:'Busy at 2:45 AM',
        mobile:'9797464797'
      }
    ];

    ReactDOM.render(React.createElement(
      Router,
      { history: browserHistory },
      React.createElement(IndexRoute, { component: Home }),
      React.createElement(
        Route,
        { path: '/', component: App }
      ),
      React.createElement(
        CompanyApp,
        { companies: defCompanies }
      )
    ), document.getElementById("companyList"));
});

/*define('CompanyApp1', ['require'], function(require) {
    console.log('CompanyApp1');
    console.log(CompanyApp1);
    var App = require(['assets/js/app.js']);
    return App;
});*/

/*require(["App"], function(App) {
    console.log('Employee');
    console.log(App);
});*/

/*define("main", ["assets/js/Employee.js"], function (Employee1) {
    var john = new Employee("John", "Smith");

    return john;
});*/

//var Employee1 = require(["main"]);

//console.log(Employee1.main);
