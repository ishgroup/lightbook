import BaseModel from './BaseModel';

class CompanyModel {
  static add(that, company, callback) {
    BaseModel.put(that, '/data/company/add', company, callback);
  }

  static edit(that, company, callback) {
    BaseModel.patch(that, '/data/companies/update/' + company.id , company, callback);
  }

  static getCompany(that, id, callback) {
    BaseModel.fetch(that, '/data/company/view/' + id, callback);
  }
}

export default CompanyModel;