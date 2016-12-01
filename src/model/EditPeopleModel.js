import BaseModel from './BaseModel';

class EditPeopleModel {
  static edit(that, people, callback) {
    BaseModel.patch(that, '/data/people/update/' + people.id , people, callback);
  }
}

export default EditPeopleModel;