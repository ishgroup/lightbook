import BaseModel from './BaseModel';

class ViewPeopleModel {
  static getPeople(that, id, callback) {
    BaseModel.get(that, '/data/people/view/' + id, callback);
  }
}

export default ViewPeopleModel;