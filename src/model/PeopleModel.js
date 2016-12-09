import BaseModel from './BaseModel';

class PeopleModel {
  static add(that, people, callback) {
    BaseModel.post(that, '/data/people/add', people, callback);
  }

  static edit(that, people, callback) {
    BaseModel.patch(that, '/data/people/update/' + people.id , people, callback);
  }

  static getList(that, id, callback) {
    BaseModel.fetch(that, '/data/company/'+ id +'/people', callback);
  }

  static getPeople(that, id, callback) {
    BaseModel.fetch(that, '/data/people/view/' + id, callback);
  }

  static delete(that, id, callback) {
    BaseModel.delete(that, '/data/people/delete/' + id, callback);
  }
}

export default PeopleModel;
