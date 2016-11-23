#!/usr/bin/env /usr/local/bin/python2

from flask import Flask, render_template, jsonify, make_response, request, current_app
from datetime import timedelta
from functools import update_wrapper
from ldap_api import *

app = Flask(__name__, static_folder='build', static_url_path='')

ish_ldap = connect_to_ldap()

@app.route('/')
def root():
  return app.send_static_file('index.html')

@app.route('/peoples', methods=['GET', 'OPTIONS'])
def get_persons():
  return jsonify({
    "status" : "success",
    "output" : [
      {
        "id": "1",
        "name" : "Chintan Kotadia",
        "username" :"chintankotadia13@gmail.com",
        "company" : "ish",
        "company_role" :"html/css coder",
        "phone" :"49874646",
        "notes" :"My notes",
        "mobile" :"9497654654"
      },
      {
        "id": "2",
        "name" : "Marcus Hodgson",
        "username" :"marcus@ish.com",
        "company" : "ish",
        "company_role" :"developer",
        "phone" :"987897544",
        "notes" :"Not available",
        "mobile" :"9797464876"
      },
      {
        "id": "3",
        "name" : "Stephen McIlwaine",
        "username" :"Stephen@ish.com",
        "company" : "ish",
        "company_role" :"java developer",
        "phone" :"5464979646",
        "notes" :"Busy",
        "mobile" :"9797464797"
      },
      {
        "id": "4",
        "name" : "Aristedes Maniatis",
        "username" :"ari@ish.com.au",
        "company" : "ish",
        "company_role" :"developer",
        "phone" :"554879645",
        "notes" :"employees scrum",
        "mobile" :"9849476469"
      }
    ]
  })

@app.route('/data/people/view/<int:id>')
def view_person(id):
  return jsonify({
    "status": "success",
    "output": {
      "people": get_person_from_ldap(ish_ldap, id)
    }
  })

@app.route('/data/people/update/<int:id>')
def update_person(id):
  return jsonify(
  {
    "status": "success",
    "output": {
    "message": "People updated successfully",
    "people": {
      "id": "1",
      "name": "Chintan Kotadia",
      "username":"chintankotadia13@gmail.com",
      "company": "ish",
      "company_role":"html/css coder",
      "phone":"49874646",
      "notes":"My notes",
      "mobile":"9497654654"
    }
    }
  }
  )

@app.route('/data/people/delete/<int:id>')
def delete_person(id):
  return jsonify(  { 'status':"success",
    'output':{
    'message':"People deleted successfully"
  }})

@app.route('/data/search/get/<search>')
def search_entry(search):
  return jsonify({
    "status": "success",
    "output": {
       'people': search_in_ldap(ish_ldap, 'ou=Customers,ou=People,', search),
       'companies': search_in_ldap(ish_ldap, 'ou=Companies,', search)
     }
  })

@app.route('/data/company/<int:id>/people')
def company_people(id):
  result = get_company_people_from_ldap(ish_ldap, id)

  if result == None:
    return jsonify({
      "status": "error",
      "message": "Company not found"
    })
  else:
    return jsonify({
      "status": "success",
      "people": result
    })

@app.route('/data/company/view/<int:id>')
def view_company(id):
  return jsonify({
    "status": "success",
    "output": {
      "company": get_company_from_ldap(ish_ldap, id)
    }
  })

if __name__ == '__main__':
  app.run(debug=True)
