import BaseModel from './BaseModel';

class ViewCompanyModel {
  static getCompany(that, id, callback) {
    BaseModel.fetch(that, '/data/company/view/' + id, callback);
  }
}

export default ViewCompanyModel;