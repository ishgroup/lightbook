

class Config {

  static urls = {};

  static baseUrl() {
    if(Config.isDevelopment())
      return 'http://localhost:3000';
    else
      return Config.getEnv('BACKEND_URL');
  }

  static getEnv(name) {
    return process.env[name];
  }

  static getMode() {
    return Config.getEnv('NODE_ENV');
  }

  static isDevelopment() {
    return Config.getMode() === 'development';
  }

  static getUrl(url) {
    Config.urls['searchCompanies'] = '/data/companies/search';
    return Config.urls[url];
  }
}
export default Config;
