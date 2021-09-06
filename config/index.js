const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB || 'localhost',
        template: 'hbs',
        publicDir: 'public',
        cookie: 'x-auth-token',
        secret: process.env.secret || 'SuperSecretSecret',
        saltRounds: process.env.saltRounds || 10,
        expire: process.env.expire || '8h',
        pricePrecision: 100
    },
    production: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB,
        template: 'hbs',
        publicDir: 'public',
        cookie: 'x-auth-token',
        secret: process.env.secret,
        saltRounds: process.env.saltRounds,
        expire: process.env.expire,
        pricePrecision: 100
    }
};

module.exports = config[env];
