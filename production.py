#!/usr/bin/env /usr/local/bin/python2

from gevent import monkey
from gevent import wsgi
from flask import Flask, jsonify, request, render_template
from ldap_api import *
import logging
from ldap_api.settings import SiteSettings

logging.basicConfig(level=logging.DEBUG)
try:
  file_handler = logging.FileHandler('/var/log/lightbook/lightbook.log')
  file_handler.setLevel(logging.NOTSET)
  logging.addHandler(file_handler)
except:
  None

config = SiteSettings()
app = Flask(__name__, static_folder='build', static_url_path='')

ish_ldap = connect_to_ldap(config.get_ldap_url())


@app.route('/')
def root():
  return render_template('index.html')


@app.route('/data/people/view/<int:person_id>')
def view_person(person_id):
  return jsonify({
    "status": "success",
    "output": {
      "people": get_person_from_ldap(ish_ldap, person_id)
    }
  })


@app.route('/data/people/update/<int:person_id>', methods=['PATCH'])
def update_person(person_id):
  result = modify_person(ish_ldap, person_id, request.json)
  if result is None:
    return jsonify({
      "status": "error",
      "message": "Person not found"
    })
  return jsonify({
    "status": "success",
    "output": {
      "message": "People updated successfully",
      "people": result
    }
  })


@app.route('/data/companies/update/<int:company_id>', methods=['PATCH'])
def update_company(company_id):
  result = modify_company(ish_ldap, company_id, request.json)
  if result is None:
    return jsonify({
      "status": "error",
      "message": "Company not found"
    })
  return jsonify({
    "status": "success",
    "output": {
      "message": "Company updated successfully",
      "people": result
    }
  })


@app.route('/data/people/delete/<int:person_id>')
def delete_person(person_id):
  return jsonify({
    'status': "success",
    'output': {
      'message': "Person %s deleted successfully" % person_id
    }
  })


@app.route('/data/search/get/<search>')
def search_entry(search):
  return jsonify({
    "status": "success",
    "output": {
      'peoples': search_in_ldap(ish_ldap, 'ou=Customers,ou=People', search),
      'companies': search_in_ldap(ish_ldap, 'ou=Companies', search)
    }
  })


@app.route('/data/company/<int:company_id>/people')
def company_people(company_id):
  result = get_company_people_from_ldap(ish_ldap, company_id)

  if result is None:
    return jsonify({
      "status": "error",
      "message": "Company not found"
    })
  else:
    return jsonify({
      "status": "success",
      "peoples": result
    })


@app.route('/data/company/view/<int:company_id>')
def view_company(company_id):
  return jsonify({
    "status": "success",
    "output": {
      "company": get_company_from_ldap(ish_ldap, company_id)
    }
  })


if __name__ == '__main__':
  monkey.patch_all()
  server = wsgi.WSGIServer((config.get_bind_ip(), config.get_bind_port()), app)
  server.serve_forever()
