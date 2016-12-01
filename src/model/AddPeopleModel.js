import BaseModel from './BaseModel';

class AddPeopleModel {
  static add(that, people, callback) {
    BaseModel.put(that, '/data/people/add', people, callback);
  }
}

export default AddPeopleModel;