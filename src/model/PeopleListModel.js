import BaseModel from './BaseModel';

class PeopleListModel extends BaseModel {
  static getList(that, id, callback) {
    BaseModel.fetch(that, '/data/company/'+ id +'/people', callback);
  }
}

export default PeopleListModel;