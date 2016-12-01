import BaseModel from './BaseModel';

class AddCompanyModel {
  static add(that, company, callback) {
    BaseModel.put(that, '/data/company/add', company, callback);
  }
}

export default AddCompanyModel;