import axios from 'axios';
import Config from '../config';

class ViewPeopleModel {
  static getPeople(that, id, callback) {
    axios.get('/data/people/view/' + id, { baseURL: Config.baseUrl() })
      .then(function(response) {
        callback(that, response);
      });
  }
}

export default ViewPeopleModel;