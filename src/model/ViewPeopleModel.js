import BaseModel from './BaseModel';

class ViewPeopleModel {
  static getPeople(that, id, callback) {
    BaseModel.fetch(that, '/data/people/view/' + id, callback);
  }
}

export default ViewPeopleModel;