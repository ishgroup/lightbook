import axios from 'axios';
import Config from '../Config';

class BaseModel {
  static fetch(that, url, callback) {
    axios.get(url, { baseURL: Config.baseUrl() })
      .then(function(response) {
        if(response.data.status === 'success')
          callback(that, response);
        else {
          if(response.data.status !== undefined) {
            alert('Error: Unable to get record from "' + url + '"\nError: ' + response.data.message);
            return false;
          }
        }
      });
  }

  static post(that, url, data, callback) {
    axios.post(url, data, { baseURL: Config.baseUrl() })
      .then(function(response) {
        if(response.data.status === 'success')
          callback(that, response);
        else {
          if(response.data.status !== undefined) {
            alert('Error: Unable to post record for "' + url + '"\nError: ' + response.data.message);
            return false;
          }
        }
      });
  }

  static put(that, url, data, callback) {
    axios.put(url, data, { baseURL: Config.baseUrl() })
      .then(function(response) {
        if(response.data.status === 'success')
          callback(that, response);
        else {
          if(response.data.status !== undefined) {
            alert('Error: Unable to put record for "' + url + '"\nError: ' + response.data.message);
            return false;
          }
        }
      });
  }

  static patch(that, url, data, callback) {
    axios.patch(url, data, { baseURL: Config.baseUrl() })
      .then(function(response) {
        if(response.data.status === 'success')
          callback(that, response);
        else {
          if(response.data.status !== undefined) {
            alert('Error: Unable to patch record for "' + url + '"\nError: ' + response.data.message);
            return false;
          }
        }
      });
  }

  static delete(that, url, callback) {
    axios.delete(url, { baseURL: Config.baseUrl() })
      .then(function(response) {
        if(response.data.status === 'success')
          callback(that, response);
        else {
          if(response.data.status !== undefined) {
            alert('Error: Unable to delete record for "' + url + '"\nError: ' + response.data.message);
            return false;
          }
        }
      });
  }
}

export default BaseModel;
