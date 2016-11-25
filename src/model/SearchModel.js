import axios from 'axios';
import Config from '../config';

class SearchModel {
  static search(that, text, callback) {
    if(text.length > 2) {
      axios.get('/data/search/get/' + text, { baseURL: Config.baseUrl() })
        .then(function(response) {
          callback(that, response);
        });
    }
  }
}

export default SearchModel;