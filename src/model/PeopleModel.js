import BaseModel from './BaseModel';

class PeopleModel {
  static add(that, people, callback) {
    BaseModel.post(that, '/data/people/add', people, callback);
  }

  static edit(that, people, callback) {
    BaseModel.post(that, '/data/people/update/' + people.id , people, callback);
  }

  static getList(that, id, callback) {
    BaseModel.fetch(that, '/data/company/'+ id +'/people', callback);
  }

  static getPeople(that, id, callback) {
    BaseModel.fetch(that, '/data/people/view/' + id, callback);
  }
}

export default PeopleModel;
