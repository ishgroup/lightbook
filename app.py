from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/people/view/<int:id>')
def view_person(id):
    return jsonify(
	      id=id,
	      name="Chintan Kotadia",
	      username="chintankotadia13@gmail.com",
	      company="ish",
	      company_role="html/css coder",
	      phone="49874646",
	      notes="My notes",
	      mobile="9497654654"
	)


if __name__ == '__main__':
    app.run(debug=True)
