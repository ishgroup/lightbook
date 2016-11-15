from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/people/view/<int:id>')
def view_person(id):
    return jsonify(
	{
	  "status": "success",
	  "output": {
	    "people": {
	      "id": id,
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

@app.route('/data/company/get/<search>')
def search_company(search):
    return jsonify(
	{
	  "status": "success",
	  "output": {
	    "message": "Companies fetched successfully",
	    "output": [
	      {
	        "id": "1",
	        "name": "ish"
	      },
	      {
	        "id": "2",
	        "name": "weasydney"
	      }
	    ]
	  }
	}
  	)

if __name__ == '__main__':
    app.run(debug=True)
