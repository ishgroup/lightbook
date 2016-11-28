import axios from 'axios';
import Config from '../config';

class BaseModel {
  static get(that, url, callback) {
    axios.get(url, { baseURL: Config.baseUrl() })
      .then(function(response) {
        callback(that, response);
      });
  }
}

export default BaseModel;