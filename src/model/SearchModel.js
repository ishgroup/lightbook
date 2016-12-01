import BaseModel from './BaseModel';

class SearchModel extends BaseModel {
  static search(that, text, callback) {
    if(text.length > 2) {
      BaseModel.fetch(that, '/data/search/get/' + text, callback);
    }
  }
}

export default SearchModel;