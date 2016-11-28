

class Config {

  static baseUrl() {
    if(Config.isDevelopment())
      return 'http://localhost:5000';
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
    if(Config.getMode() === 'development')
      return true;
    else
      return false;
  }
}
export default Config;
