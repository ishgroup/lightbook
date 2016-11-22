

class Config {

    static baseUrl() {
        if(Config.getMode() === 'development')
            return 'http://localhost:5000';
        else
            return 'https://people.ish.com.au';
    }

    static getEnv(name) {
        return process.env[name];
    }

    static getMode() {
        return Config.getEnv('NODE_ENV');
    }
}
export default Config;
