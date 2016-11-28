import BaseModel from './BaseModel';

class PeopleListModel extends BaseModel {
  static getList(that, id, callback) {
    BaseModel.get(that, '/data/company/'+ id +'/people', callback);
  }
}

export default PeopleListModel;