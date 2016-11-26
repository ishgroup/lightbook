import axios from 'axios';
import Config from '../config';

class SearchModel {
  static search(that, text, callback) {
    if(text.length > 2) {
      callback(that, {data: {
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
        "name": "Eilish"
      },
      {
        "id": "512",
        "name": "Andrew Bishop"
      },
      {
        "id": "518",
        "name": "Chris Fisher"
      },
      {
        "id": "574",
        "name": "Sudhir Mishra"
      },
      {
        "id": "1681",
        "name": "Bob Bishop"
      },
      {
        "id": "1682",
        "name": "Barry Bishop"
      },
      {
        "id": "1696",
        "name": "Daryn Chisholm"
      },
      {
        "id": "1802",
        "name": "Robert Fisher"
      },
      {
        "id": "1816",
        "name": "Rishi Lalseta"
      },
      {
        "id": "1821",
        "name": "Vishal Charan"
      }
    ]
  },
  "status": "success"
}
});
      /*axios.get('/data/search/get/' + text, { baseURL: Config.baseUrl() })
        .then(function(response) {
          callback(that, response);
        });*/
    }
  }
}

export default SearchModel;