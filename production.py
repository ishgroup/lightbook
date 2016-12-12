#!/usr/bin/env /usr/local/bin/python2

import sys
import logging
from gevent import monkey, wsgi
from flask import Flask, jsonify, request, g
from logstash_formatter import LogstashFormatterV1
import ldap
from ldap_api import requires_auth, SiteSettings

debug_mode = '--debug' in sys.argv

app = Flask(__name__, static_folder='build', static_url_path='')
config = SiteSettings()

def get_ldap_api():
  return getattr(g, '_ldap_api', None)

logging.basicConfig(level=logging.DEBUG)

if not debug_mode:
  try:
    file_handler = logging.FileHandler('/var/log/lightbook/lightbook.log')
    file_handler.setFormatter(LogstashFormatterV1())

    app.logger.addHandler(file_handler)
  except:
    None
    # Just keep going

@app.errorhandler(ldap.LDAPError)
def ldap_error_handler(e):
    app.logger.error('Ldap error: %s', (e))

    return jsonify({
      'status': 'error',
      'message': e.args[0]['desc'].encode()
    }), 200

@app.route('/')
@requires_auth
def root():
  app.logger.debug("The index page was accessed.")
  return app.send_static_file('index.html')


@app.route('/data/people/view/<int:person_id>')
@requires_auth
def view_person(person_id):
  return jsonify({
    "status": "success",
    "output": {
      "people": get_ldap_api().get_person(person_id)
    }
  })


@app.route('/data/people/update/<int:person_id>', methods=['PATCH', 'OPTIONS'])
@requires_auth
def update_person(person_id):
  result = get_ldap_api().modify_person(person_id, request.get_json())
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


@app.route('/data/companies/update/<int:company_id>', methods=['PATCH', 'OPTIONS'])
@requires_auth
def update_company(company_id):
  result = get_ldap_api().modify_company(company_id, request.get_json())
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


@app.route('/data/people/delete/<int:person_id>', methods=['DELETE', 'OPTIONS'])
@requires_auth
def delete_person(person_id):
  if get_ldap_api().delete_person(person_id):
      return jsonify({
        'status': "success",
        'output': {
          'message': "Person %s deleted successfully" % person_id
        }
      })
  else:
    return jsonify({
      'status': "error",
      'output': {
         'message': "Person %s wasn't deleted" % person_id
       }
    })


@app.route('/data/companies/delete/<int:company_id>', methods=['DELETE', 'OPTIONS'])
@requires_auth
def delete_company(company_id):
  if get_ldap_api().delete_company(company_id):
    return jsonify({
      'status': "success",
      'output': {
         'message': "Company %s deleted successfully" % company_id
      }
    })
  else:
    return jsonify({
      'status': "error",
      'output': {
         'message': "Company %s wasn't deleted" % company_id
      }
    })


@app.route('/data/search/get/<search>')
@requires_auth
def search_entry(search):
  get_disabled = request.args.get('disabled') is not None
  return jsonify({
    "status": "success",
    "output": {
      'peoples': get_ldap_api().search(search, 'people', get_disabled),
      'companies': get_ldap_api().search(search, 'companies', get_disabled)
    }
  })


@app.route('/data/company/<int:company_id>/people')
@requires_auth
def company_people(company_id):
  result = get_ldap_api().get_company_people(company_id)

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
@requires_auth
def view_company(company_id):
  return jsonify({
    "status": "success",
    "output": {
      "company": get_ldap_api().get_company(company_id)
    }
  })


@app.route('/data/people/add', methods=['POST', 'OPTIONS'])
@requires_auth
def add_person():
  return jsonify({
    "status": "success",
    "output": {
      "people": get_ldap_api().add_person(request.get_json())
    }
  })


@app.route('/data/company/add', methods=['POST', 'OPTIONS'])
@requires_auth
def add_company():
  return jsonify({
    "status": "success",
    "output": {
      "company": get_ldap_api().add_company(request.get_json())
    }
  })

@app.route('/data/companies/search/<search>')
@requires_auth
def search_company(search):
  get_disabled = request.args.get('disabled') is not None
  return jsonify({
    "status": "success",
    "output": {
      'companies': get_ldap_api().search(search, 'companies', get_disabled)
    }
  })

if __name__ == '__main__':
  if debug_mode:
    app.run(debug=True)
  else:
    monkey.patch_all()
    server = wsgi.WSGIServer((config.get_bind_ip(), config.get_bind_port()), app)
    server.serve_forever()
