import sys
import logging
from gevent import monkey, pywsgi
from flask import Flask, jsonify, request
from logstash_formatter import LogstashFormatterV1

from ldap_api.api import API
from ldap_api.settings import SiteSettings
from ldap_api.ldap_auth import requires_auth
from ldap import LDAPError

debug_mode = '--debug' in sys.argv

app = Flask(__name__, static_folder='build', static_url_path='')
config = SiteSettings()

logging.basicConfig(level=logging.DEBUG)

if not debug_mode:
    try:
        file_handler = logging.FileHandler('/var/log/lightbook/lightbook.log')
        file_handler.setFormatter(LogstashFormatterV1())

        app.logger.addHandler(file_handler)
    except:
        pass
        # Just keep going


# @app.errorhandler(Exception)
# def ldap_error_handler(e):
#     app.logger.error(f'Ldap error: {e}')
#
#     return jsonify({
#         'status': 'error',
#         'message': str(e)
#     }), 200
#

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
            "people": API.get_person(person_id)
        }
    })


@app.route('/data/people/update/<int:person_id>', methods=['PATCH', 'OPTIONS'])
@requires_auth
def update_person(person_id):
    result = API.modify_person(person_id, request.get_json())
    if result is None:
        return jsonify({
            "status": "error",
            "message": "Person not found"
        })
    return jsonify({
        "status": "success",
        "output": {
            "message": "Person updated successfully",
            "people": result
        }
    })


@app.route('/data/companies/update/<int:company_id>', methods=['PATCH', 'OPTIONS'])
@requires_auth
def update_company(company_id):
    result = API.modify_company(company_id, request.get_json())
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
    if API.delete_person(person_id):
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
    if API.delete_company(company_id):
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
            'peoples': API.search(search, 'people', get_disabled),
            'companies': API.search(search, 'companies', get_disabled)
        }
    })


@app.route('/data/company/<int:company_id>/people')
@requires_auth
def company_people(company_id):
    only_disabled = request.args.get('only_disabled') is not None
    result = API.get_people(company_id, only_disabled)

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
            "company": API.get_company(company_id)
        }
    })


@app.route('/data/people/add', methods=['POST', 'OPTIONS'])
@requires_auth
def add_person():
    return jsonify({
        "status": "success",
        "output": {
            "people": API.add_person(request.get_json())
        }
    })


@app.route('/data/company/add', methods=['POST', 'OPTIONS'])
@requires_auth
def add_company():
    return jsonify({
        "status": "success",
        "output": {
            "company": API.add_company(request.get_json())
        }
    })


@app.route('/data/companies/search/<search>')
@requires_auth
def search_company(search):
    get_disabled = request.args.get('disabled') is not None
    return jsonify({
        "status": "success",
        "output": {
            'companies': API.search(search, 'companies', get_disabled)
        }
    })


if __name__ == '__main__':
    if debug_mode:
        app.run(debug=True)
    else:
        monkey.patch_all()
        server = pywsgi.WSGIServer((config.get_bind_ip(), config.get_bind_port()), app)
        server.serve_forever()
