# lightbook
Corporate addressbook using an LDAP backend.

## Set up the dependencies

1. Make sure you have python3 and pip installed
1. `# pip3 install -r requirements.txt`
1. `# npm install`


## Development mode

`# python3 development.py &`
`# npm start`

Now you can open http://127.0.0.1:3000/ and browse the project. NPM acts as a little web server to deliver the js and html parts to the browser. Python runs on port 5000 to repond to requests for search data, but using sample test json data rather than a real connection to LDAP.

## Production mode

Create ldap.json in the root of the project and set some values.

1. `# npm run build`
1. `# python3 production.py`

The web application will request a username and password using base auth. This will then be used to log into your LDAP server.