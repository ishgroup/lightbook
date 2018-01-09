from flask import Flask, jsonify
import logging
from flask_cors import CORS, cross_origin

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, static_folder='build', static_url_path='')

cors = CORS(app, resources={r"/data/*": {"origins": "*"}})

@app.route('/')
def root():
    logging.debug("Index page request")
    return app.send_static_file('index.html')


@app.route('/data/search/get/<search>', methods=['GET', 'OPTIONS'])
@cross_origin()
def search_entry(search):
    return jsonify({
        "status": "success",
        "output": {
            "companies": [
                {
                    "id": "1",
                    "name": "ish"
                },
                {
                    "id": "261",
                    "name": "Beverly Hills Intensive English Centre"
                },
                {
                    "id": "420",
                    "name": "Desktop Magazine Niche Publishing"
                },
                {
                    "id": "641",
                    "name": "Empire Publishing Service"
                },
                {
                    "id": "856",
                    "name": "Aust Govt Publishing Service"
                },
                {
                    "id": "875",
                    "name": "APA (Australian Publishers Association)"
                },
                {
                    "id": "3008",
                    "name": "Torch Publishing"
                },
                {
                    "id": "3011",
                    "name": "Medishift"
                },
                {
                    "id": "3222",
                    "name": "Niche Publishing"
                },
                {
                    "id": "3268",
                    "name": "Thorpe-Bowker Publishing"
                }
            ],
            "peoples": [
                {
                    "id": "289",
                    "name": "Eilish",
                    "company": 'ish'
                },
                {
                    "id": "512",
                    "name": "Andrew Bishop",
                    "company": 'ish'
                },
                {
                    "id": "518",
                    "name": "Chris Fisher",
                    "company": 'ish'
                },
                {
                    "id": "574",
                    "name": "Sudhir Mishra",
                    "company": 'ish'
                },
                {
                    "id": "1681",
                    "name": "Bob Bishop",
                    "company": 'other'
                },
                {
                    "id": "1682",
                    "name": "Barry Bishop",
                    "company": 'other'
                },
                {
                    "id": "1696",
                    "name": "Daryn Chisholm",
                    "company": 'other'
                },
                {
                    "id": "1802",
                    "name": "Robert Fisher",
                    "company": 'other'
                },
                {
                    "id": "1816",
                    "name": "Rishi Lalseta",
                    "company": 'other'
                },
                {
                    "id": "1821",
                    "name": "Vishal Charan",
                    "company": 'other'
                }
            ]
        }
    })


@app.route('/peoples', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_persons():
    return jsonify({
        "status": "success",
        "output": [
            {
                "id": "1",
                "name": "Chintan Kotadia",
                "username": "chintankotadia",
                "email": [
                    "chintankotadia99@gmail.com"
                ],
                "company": "ish",
                "company_role": "html/css coder",
                "phone": [
                    "9199 1234",
                    "1234"
                ],
                "notes": "My notes",
                "mobile": [
                    "9497654654",
                    "123456789"
                ]
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


@app.route('/data/people/add', methods=['POST', 'OPTIONS'])
@cross_origin()
def add_person():
    return jsonify({
        "status": "success",
        "output": {
            "people": {
                "company": "Niche Publishing",
                "company_role": "null",
                "id": "317",
                "mobile": "null",
                "name": "Joanne Davies",
                "notes": "null",
                "phone": [
                    "0243695933 homeoffice",
                    "0395255566 melbheadoff",
                    "0243690357 homefax"
                ],
                "username": "Joanne_157",
                "auto_add_to_task": True
            }
        }
    })


@app.route('/data/people/view/<int:person_id>')
@cross_origin()
def view_person(person_id):
    return jsonify({
        "status": "success",
        "output": {
            "people": {
                "company": "Niche Publishing",
                "company_role": "null",
                "company_id": 124,
                "email": "ish.com.au",
                "id": "317",
                "mobile": "null",
                "name": "Joanne Davies",
                "notes": "null",
                "phone": [
                    "0243695933 homeoffice",
                    "0395255566 melbheadoff",
                    "0243690357 homefax"
                ],
                "username": "Joanne_157",
                "auto_add_to_task": False
            }
        }
    })


@app.route('/data/people/update/<int:person_id>', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def update_person(person_id):
    return jsonify({
        "status": "success",
        "output": {
            "message": "Person updated successfully",
            "people": "****"
        }
    })


@app.route('/data/people/delete/<int:person_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_person(person_id):
    return jsonify({
        'status': "success",
        'output': {
            'message': "Person %s deleted successfully" % person_id
        }
    })


@app.route('/data/company/<int:company_id>/people')
@cross_origin()
def company_people(company_id):
    return jsonify({
        "status": "success",
        "peoples": [
            {
                "id": "4",
                "name": "Rex Chan"
            },
            {
                "id": "7",
                "name": "Natalie Morton (wrong)"
            },
            {
                "id": "8",
                "name": "Lisa Malouf"
            },
            {
                "id": "9",
                "name": "Matthias Moeser"
            },
            {
                "id": "15",
                "name": "Grant Newton"
            },
            {
                "id": "16",
                "name": "Brad Wilson"
            },
            {
                "id": "17",
                "name": "Erlend Simonsen"
            },
            {
                "id": "188",
                "name": "Marek Wawrzyczny"
            },
            {
                "id": "2093",
                "name": "Marcin Skladaniec"
            },
            {
                "id": "10809",
                "name": "Christian Llagas"
            },
            {
                "id": "10868",
                "name": "Monique Dykstra"
            },
            {
                "id": "10954",
                "name": "Michael Keogh"
            },
            {
                "id": "10955",
                "name": "Imogen Searle"
            },
            {
                "id": "11000",
                "name": "Angel Cheung"
            },
            {
                "id": "11158",
                "name": "Ben You"
            },
            {
                "id": "11167",
                "name": "Ilieash Bulbul"
            },
            {
                "id": "11178",
                "name": "Barry Wazzy"
            },
            {
                "id": "11195",
                "name": "Charlotte Tanner (ish)"
            },
            {
                "id": "11244",
                "name": "Simon Josephson"
            },
            {
                "id": "11246",
                "name": "Juan Hawa"
            },
            {
                "id": "11287",
                "name": "Ronald Kuwawi"
            },
            {
                "id": "11298",
                "name": "Peter Dissegna"
            },
            {
                "id": "11317",
                "name": "Lorenzo"
            },
            {
                "id": "11334",
                "name": "Dzmitry Kazimirchyk"
            },
            {
                "id": "11340",
                "name": "Liu Fengyun"
            },
            {
                "id": "11345",
                "name": "Viacheslav Davidovich"
            },
            {
                "id": "11352",
                "name": "Megan Weber (old)"
            },
            {
                "id": "11379",
                "name": "Andrey Koyro (old)"
            },
            {
                "id": "11384",
                "name": "Bogdan Zubakin"
            },
            {
                "id": "11404",
                "name": "Daniel Solsona"
            },
            {
                "id": "11453",
                "name": "Chintan Kotadia (old)"
            },
            {
                "id": "11470",
                "name": "liufengyunchina"
            },
            {
                "id": "11480",
                "name": "David Roddick"
            },
            {
                "id": "11559",
                "name": "Miranda Gracie"
            },
            {
                "id": "11582",
                "name": "Vikrant Chaudhary"
            },
            {
                "id": "11662",
                "name": "George Filipovich (old)"
            },
            {
                "id": "11673",
                "name": "Phanindra Srungavarapu"
            },
            {
                "id": "11695",
                "name": "Artyom Kravchenko (old)"
            },
            {
                "id": "11757",
                "name": "Stephen McIlwaine (old)"
            },
            {
                "id": "11794",
                "name": "Juan Garcia (old)"
            },
            {
                "id": "11799",
                "name": "Midhun Sukumaran"
            },
            {
                "id": "11800",
                "name": "Vikrant Shete"
            },
            {
                "id": "11872",
                "name": "juan test"
            },
            {
                "id": "11883",
                "name": "Andrey Narut (old)"
            },
            {
                "id": "11884",
                "name": "Cheryl Sykes"
            },
            {
                "id": "11917",
                "name": "Evgeny Rugalev"
            },
            {
                "id": "12070",
                "name": "John Havel"
            },
            {
                "id": "12130",
                "name": "Sathyapriya Perumal"
            },
            {
                "id": "12235",
                "name": "Sasha Shestak"
            },
            {
                "id": "12245",
                "name": "Zaid Akram"
            },
            {
                "id": "12272",
                "name": "Savva Kolbachev"
            },
            {
                "id": "12274",
                "name": "Andrei Malyshev (Ruby)"
            },
            {
                "id": "12283",
                "name": "Darya Schemerova"
            },
            {
                "id": "12304",
                "name": "Accounts (do not use)"
            },
            {
                "id": "12339",
                "name": "Ritesh Thumar"
            },
            {
                "id": "12355",
                "name": "Jason Riley (old)"
            },
            {
                "id": "12371",
                "name": "Megan Testing"
            }
        ]
    })


@app.route('/data/companies/update/<int:company_id>', methods=['PATCH', 'OPTIONS'])
@cross_origin()
def update_company(company_id):
    return jsonify({
        "status": "success",
        "output": {
            "message": "Company updated successfully",
            "company": "****"
        }
    })


@app.route('/data/companies/delete/<int:company_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_company(company_id):
    return jsonify({
        'status': "success",
        'output': {
            'message': "Company %s deleted successfully" % company_id
        }
    })


@app.route('/data/company/view/<int:company_id>')
@cross_origin()
def view_company(company_id):
    return jsonify({
        "status": "success",
        "output": {
            "company": {
                "id": "1",
                "name": "Ish Pty. Ltd",
                "abn": "12345678",
                "active": "true",
                "phone": [
                    "12345679"
                ],
                "fax": [
                    "12345679"
                ],
                "street": "30 Wilson St",
                "suburb": "Newtown",
                "postalCode": "2042",
                "st": "NSW",
                "notes": "something exciting"
            }
        }
    })


@app.route('/data/company/add', methods=['POST', 'OPTIONS'])
@cross_origin()
def add_company():
    return jsonify({
        "status": "success",
        "output": {
            "company": {
                "id": "1",
                "name": "Ish Pty. Ltd",
                "abn": "12345678",
                "active": "true",
                "phone": [
                    "12345679"
                ],
                "fax": [
                    "12345679"
                ],
                "street": "30 Wilson St",
                "suburb": "Newtown",
                "postalCode": "2042",
                "st": "NSW",
                "notes": "something exciting"
            }
        }
    })


@app.route('/data/companies/search/<search>')
@cross_origin()
def search_company(search):
    return jsonify({
        'status': 'success',
        'output': {
            'companies': [
                {
                    "id": "1",
                    "name": "Ish Pty. Ltd",
                },
                {
                    "id": "2",
                    "name": "Other corp",
                },
                {
                    "id": "3",
                    "name": "Glooge",
                }
            ]
        }
    })


if __name__ == '__main__':
    app.run(debug=True)
