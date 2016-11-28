#!/usr/bin/env /usr/local/bin/python2

from flask import Flask, jsonify, request, render_template
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, static_folder='build', static_url_path='')

@app.route('/')
def root():
  logging.debug("Index page request")
  return render_template('index.html')


@app.route('/peoples', methods=['GET', 'OPTIONS'])
def get_persons():
  return jsonify({
    "status": "success",
    "output": [
      {
        "id": "1",
        "name": "Chintan Kotadia",
        "username": "chintankotadia13@gmail.com",
        "company": "ish",
        "company_role": "html/css coder",
        "phone": "49874646",
        "notes": "My notes",
        "mobile": "9497654654"
      },
      {
        "id": "2",
        "name": "Marcus Hodgson",
        "username": "marcus@ish.com",
        "company": "ish",
        "company_role": "developer",
        "phone": "987897544",
        "notes": "Not available",
        "mobile": "9797464876"
      },
      {
        "id": "3",
        "name": "Stephen McIlwaine",
        "username": "Stephen@ish.com",
        "company": "ish",
        "company_role": "java developer",
        "phone": "5464979646",
        "notes": "Busy",
        "mobile": "9797464797"
      },
      {
        "id": "4",
        "name": "Aristedes Maniatis",
        "username": "ari@ish.com.au",
        "company": "ish",
        "company_role": "developer",
        "phone": "554879645",
        "notes": "employees scrum",
        "mobile": "9849476469"
      }
    ]
  })


@app.route('/data/people/view/<int:person_id>')
def view_person(person_id):
  return jsonify({
    "status": "success",
    "output": {
      "people": "****"
    }
  })


@app.route('/data/people/update/<int:person_id>', methods=['PATCH'])
def update_person(person_id):
  return jsonify({
    "status": "success",
    "output": {
      "message": "People updated successfully",
      "people": "****"
      }
  })


@app.route('/data/companies/update/<int:company_id>', methods=['PATCH'])
def update_company(company_id):
  return jsonify({
    "status": "success",
    "output": {
      "message": "Company updated successfully",
      "people": "****"
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
       'peoples': "****",
       'companies': "*****"
     }
  })


@app.route('/data/company/<int:company_id>/people')
def company_people(company_id):
    return jsonify({
      "status": "success",
      "peoples": "****"
    })


@app.route('/data/company/view/<int:company_id>')
def view_company(company_id):
  return jsonify({
    "status": "success",
    "output": {
      "company": "****"
    }
  })


if __name__ == '__main__':
  app.run(debug=True)
