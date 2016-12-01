import BaseModel from './BaseModel';

class EditCompanyModel {
  static edit(that, company, callback) {
    BaseModel.patch(that, '/data/companies/update/' + company.id , company, callback);
  }
}

export default EditCompanyModel;