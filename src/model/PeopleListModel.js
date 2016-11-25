import axios from 'axios';
import Config from '../config';

class PeopleListModel {
  static getList(that, id, callback) {
    axios.get('/data/company/'+ id +'/people', { baseURL: Config.baseUrl() })
      .then(function(response) {
        callback(that, response);
      });
  }
}

export default PeopleListModel;