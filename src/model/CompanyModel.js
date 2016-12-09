import BaseModel from './BaseModel';

class CompanyModel {
  static add(that, company, callback) {
    BaseModel.post(that, '/data/company/add', company, callback);
  }

  static edit(that, company, callback) {
    BaseModel.patch(that, '/data/companies/update/' + company.id , company, callback);
  }

  static getCompany(that, id, callback) {
    BaseModel.fetch(that, '/data/company/view/' + id, callback);
  }

  static delete(that, id, callback) {
    BaseModel.delete(that, '/data/company/delete/' + id, callback);
  }
}

export default CompanyModel;
